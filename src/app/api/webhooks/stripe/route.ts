import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-db";
import { MockPaymentProvider, StripePaymentProvider } from "@/lib/billing/payment-provider";
import { TaxInvoiceGenerator } from "@/lib/billing/invoice";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "mock-signature";

    const isMock = process.env.PAYMENT_PROVIDER === "mock" || !process.env.STRIPE_SECRET_KEY;
    const provider = isMock ? new MockPaymentProvider() : new StripePaymentProvider();

    const isValid = await provider.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId || "user-test-uae";
      const packageId = session.metadata?.packageId || "pkg_starter_50";
      const customerPhone = session.metadata?.customerPhone || "+971501234567";

      const serviceCtx = { userId: null, role: "service_role" as const };
      const pkg = mockDb.creditPackages.get(packageId);

      if (!pkg) {
        return NextResponse.json({ error: `Package ${packageId} not found` }, { status: 400 });
      }

      const idempotencyKey = `stripe-checkout-${session.id}`;

      // Check if already processed
      if (mockDb.creditLedger.has(idempotencyKey)) {
        return NextResponse.json({ message: "Already processed idempotently", granted: false }, { status: 200 });
      }

      // 1. Append credit grant to ledger
      await mockDb.appendLedgerEntry(serviceCtx, {
        id: crypto.randomUUID(),
        user_id: userId,
        delta: pkg.credits,
        reason: "purchase",
        idempotency_key: idempotencyKey,
        reference_id: session.id,
        created_at: new Date().toISOString(),
      });

      // 2. Generate UAE Tax Invoice
      const invoiceNumber = `INV-2026-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const invoice = TaxInvoiceGenerator.generateInvoice({
        invoiceNumber,
        userId,
        buyerPhone: customerPhone,
        packageId: pkg.id,
        packageNameEn: pkg.name_en,
        packageNameAr: pkg.name_ar,
        credits: pkg.credits,
        grossInclusiveAed: pkg.price_aed_inclusive,
      });

      // 3. Record completed order
      const orderId = crypto.randomUUID();
      mockDb.orders.set(orderId, {
        id: orderId,
        user_id: userId,
        package_id: pkg.id,
        credits: pkg.credits,
        amount_aed_inclusive: pkg.price_aed_inclusive,
        amount_aed_exclusive: invoice.subtotalExclusiveAed,
        vat_amount_aed: invoice.totalVatAed,
        status: "completed",
        payment_provider: "stripe",
        payment_reference: session.id,
        invoice_number: invoiceNumber,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        grantedCredits: pkg.credits,
        invoiceNumber,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
