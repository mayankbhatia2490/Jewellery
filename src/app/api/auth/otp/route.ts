import { NextRequest, NextResponse } from "next/server";
import { MockOtpProvider } from "@/lib/auth/otp";
import { mockDb } from "@/lib/db/mock-db";
import { z } from "zod";

const SendOtpSchema = z.object({
  action: z.literal("send"),
  phone: z.string(),
});

const VerifyOtpSchema = z.object({
  action: z.literal("verify"),
  phone: z.string(),
  code: z.string().min(4).max(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "send") {
      const parsed = SendOtpSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
      }
      const result = await MockOtpProvider.sendOtp(parsed.data.phone);
      return NextResponse.json(result);
    }

    if (body.action === "verify") {
      const parsed = VerifyOtpSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
      }
      const result = await MockOtpProvider.verifyOtp(parsed.data.phone, parsed.data.code);
      if (!result.verified) {
        return NextResponse.json({ error: "Invalid or expired OTP code" }, { status: 401 });
      }

      // Upsert profile for seller
      const userId = "user-" + Buffer.from(result.phone).toString("hex").slice(0, 16);
      const serviceCtx = { userId: null, role: "service_role" as const };
      
      let profile = await mockDb.getProfile(serviceCtx, userId).catch(() => null);
      if (!profile) {
        profile = await mockDb.upsertProfile(serviceCtx, {
          id: userId,
          phone: result.phone,
          role: "seller",
          full_name: "UAE Retailer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        // Grant 10 free trial credits for new UAE jewellery accounts
        await mockDb.appendLedgerEntry(serviceCtx, {
          id: `grant-trial-${userId}`,
          user_id: userId,
          delta: 10,
          reason: "grant",
          idempotency_key: `onboarding-trial-grant-${userId}`,
          reference_id: "welcome_bonus_10",
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        token: result.token,
        profile,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal authentication error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
