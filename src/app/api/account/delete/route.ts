import { NextRequest, NextResponse } from "next/server";
import { DataLifecycleManager } from "@/lib/data-lifecycle/cleanup";
import { z } from "zod";

const DeleteAccountSchema = z.object({
  userId: z.string(),
  confirmation: z.literal("DELETE_MY_DATA"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DeleteAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid confirmation. Must provide userId and confirmation: 'DELETE_MY_DATA'" },
        { status: 400 }
      );
    }

    const result = await DataLifecycleManager.executeUserErasure(parsed.data.userId);

    return NextResponse.json({
      success: true,
      message: "User personal data and storage assets have been permanently purged pursuant to UAE PDPL Article 8.",
      purgedFilesCount: result.purgedStorageFilesCount,
      anonymizedProfile: result.anonymizedProfile,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Data erasure failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
