import { describe, it, expect, beforeEach } from "vitest";
import { mockDb } from "@/lib/db/mock-db";
import { TaxInvoiceGenerator } from "./invoice";
import { MockPaymentProvider } from "./payment-provider";
import { POST as stripeWebhookHandler } from "@/app/api/webhooks/stripe/route";
import { NextRequest } from "next/server";

describe("Phase 5: AED Credits Ledger, Tax Invoices & Stripe Webhooks", () => {
  const userId = "seller-dxb-gold-souk-1";
  const userCtx = { userId, role: "seller" as const };

  beforeEach(() => {
    mockDb.creditLedger.clear();
    mockDb.orders.clear();
  });

  describe("Seeded Credit Packages (VAT-inclusive in AED)", () => {
    it("ensures all credit packages have valid 5% UAE VAT calculations", () => {
      const packages = Array.from(mockDb.creditPackages.values());
      expect(packages.length).toBeGreaterThanOrEqual(3);

      for (const pkg of packages) {
        expect(pkg.price_aed_inclusive).toBeGreaterThan(0);
        // Verify formula: Net + 5% VAT = Gross (within 0.05 AED rounding)
        const computedGross = pkg.price_aed_exclusive + pkg.vat_amount_aed;
        expect(Math.abs(computedGross - pkg.price_aed_inclusive)).toBeLessThan(0.05);

        // Verify VAT is approximately 5% of net
        const expectedVat = pkg.price_aed_exclusive * 0.05;
        expect(Math.abs(pkg.vat_amount_aed - expectedVat)).toBeLessThan(0.05);
      }
    });
  });

  describe("Bilingual UAE Tax Invoice Generator", () => {
    it("generates compliant bilingual tax invoice with 5% VAT itemization", () => {
      const invoice = TaxInvoiceGenerator.generateInvoice({
        invoiceNumber: "INV-2026-TEST01",
        userId,
        buyerPhone: "+971501234567",
        companyName: "Al-Zain Jewellery LLC",
        buyerTrn: "100-2222-3333-0003",
        packageId: "pkg_pro_200",
        packageNameEn: "Pro Jeweller (200 Credits)",
        packageNameAr: "باقة المحترفين (200 رصيد)",
        credits: 200,
        grossInclusiveAed: 599.0,
      });

      expect(invoice.currency).toBe("AED");
      expect(invoice.totalInclusiveAed).toBe(599.0);
      expect(invoice.totalVatAed).toBe(28.52);
      expect(invoice.subtotalExclusiveAed).toBe(570.48);
      expect(invoice.items[0].descriptionAr).toContain("باقة المحترفين");
      expect(invoice.items[0].descriptionEn).toContain("Pro Jeweller");

      const html = TaxInvoiceGenerator.renderHtml(invoice);
      expect(html).toContain("فاتورة ضريبية / TAX INVOICE");
      expect(html).toContain("599.00 AED");
      expect(html).toContain("28.52 AED");
    });
  });

  describe("Checkout Session & Webhook Replay Idempotency", () => {
    it("creates checkout session via MockPaymentProvider", async () => {
      const provider = new MockPaymentProvider();
      const session = await provider.createCheckoutSession({
        userId,
        packageId: "pkg_starter_50",
        amountAedInclusive: 199.0,
        customerPhone: "+971501234567",
        successUrl: "http://localhost:3000/studio",
        cancelUrl: "http://localhost:3000/pricing",
      });

      expect(session.sessionId).toContain("cs_mock_");
      expect(session.url).toContain("mock_success=true");
    });

    it("grants credits on first webhook and PREVENTS duplicate credits on replay", async () => {
      // 1. Initial balance is 0
      const initialBal = await mockDb.getCreditBalance(userCtx, userId);
      expect(initialBal).toBe(0);

      const fakeSessionId = "cs_live_unique_replay_test_998";
      const webhookPayload = JSON.stringify({
        type: "checkout.session.completed",
        data: {
          object: {
            id: fakeSessionId,
            metadata: {
              userId,
              packageId: "pkg_pro_200", // 200 credits
              customerPhone: "+971509876543",
            },
          },
        },
      });

      const req1 = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_test_12345",
          "Content-Type": "application/json",
        },
        body: webhookPayload,
      });

      // 2. First Webhook execution
      const res1 = await stripeWebhookHandler(req1);
      const json1 = await res1.json();
      expect(res1.status).toBe(200);
      expect(json1.success).toBe(true);
      expect(json1.grantedCredits).toBe(200);

      // Verify balance is now 200
      const balanceAfterFirst = await mockDb.getCreditBalance(userCtx, userId);
      expect(balanceAfterFirst).toBe(200);

      // 3. Replay exact same webhook event (2nd time)
      const req2 = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_test_12345",
          "Content-Type": "application/json",
        },
        body: webhookPayload,
      });

      const res2 = await stripeWebhookHandler(req2);
      const json2 = await res2.json();
      expect(res2.status).toBe(200);
      expect(json2.granted).toBe(false);
      expect(json2.message).toContain("Already processed idempotently");

      // 4. Replay exact same webhook event (3rd time)
      const req3 = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_test_12345",
          "Content-Type": "application/json",
        },
        body: webhookPayload,
      });

      const res3 = await stripeWebhookHandler(req3);
      expect(res3.status).toBe(200);

      // Verify final balance is STILL 200, strictly proving credits were NOT duplicated
      const finalBal = await mockDb.getCreditBalance(userCtx, userId);
      expect(finalBal).toBe(200);
    });
  });
});
