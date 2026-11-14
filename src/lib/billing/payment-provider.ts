import { PaymentProvider } from "@/types";
import crypto from "crypto";

export interface CreateCheckoutParams {
  userId: string;
  packageId: string;
  amountAedInclusive: number;
  customerPhone: string;
  successUrl: string;
  cancelUrl: string;
}

export class MockPaymentProvider implements PaymentProvider {
  name = "stripe_mock";

  async createCheckoutSession(params: CreateCheckoutParams): Promise<{ sessionId: string; url: string }> {
    const sessionId = "cs_mock_" + crypto.randomBytes(12).toString("hex");
    const checkoutUrl = `${params.successUrl}?session_id=${sessionId}&mock_success=true`;
    return {
      sessionId,
      url: checkoutUrl,
    };
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    // In mock provider, accept signature or test secret
    return Boolean(signature && signature.length > 5);
  }
}

export class StripePaymentProvider implements PaymentProvider {
  name = "stripe";
  private secretKey?: string;
  private webhookSecret?: string;

  constructor(secretKey?: string, webhookSecret?: string) {
    this.secretKey = secretKey || process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<{ sessionId: string; url: string }> {
    // If running in development without live keys, delegate safely to mock provider
    if (!this.secretKey || this.secretKey.startsWith("sk_test_mock")) {
      const mock = new MockPaymentProvider();
      return mock.createCheckoutSession(params);
    }

    // Dynamic import to prevent loading in strictly offline test environments
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(this.secretKey, { apiVersion: "2024-12-18.acacia" as any });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Enables Apple Pay automatically in UAE
      line_items: [
        {
          price_data: {
            currency: "aed",
            unit_amount: Math.round(params.amountAedInclusive * 100), // in fils
            product_data: {
              name: `Studio Credits Package (${params.packageId})`,
              description: "High-resolution UAE jewellery catalog credits (5% UAE VAT Inclusive)",
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: params.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        packageId: params.packageId,
        customerPhone: params.customerPhone,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    if (!this.webhookSecret || this.webhookSecret.startsWith("whsec_mock")) {
      return true;
    }
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(this.secretKey || "", { apiVersion: "2024-12-18.acacia" as any });
    try {
      stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch {
      return false;
    }
  }
}
