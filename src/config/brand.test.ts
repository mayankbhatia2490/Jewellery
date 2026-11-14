import { describe, it, expect } from "vitest";
import { BRAND_NAME, BRAND_CONFIG } from "./brand";

describe("Brand Configuration", () => {
  it("centralizes brand name to BRAND placeholder", () => {
    expect(BRAND_NAME).toBe("BRAND");
    expect(BRAND_CONFIG.name).toBe("BRAND");
  });

  it("specifies default currency as AED with 5% VAT rate", () => {
    expect(BRAND_CONFIG.defaultCurrency).toBe("AED");
    expect(BRAND_CONFIG.vatRate).toBe(0.05);
  });

  it("provides valid WhatsApp support links for UAE phone numbers", () => {
    expect(BRAND_CONFIG.supportWhatsAppNumber.startsWith("+971")).toBe(true);
    expect(BRAND_CONFIG.supportWhatsAppUrl).toContain("wa.me/971");
    expect(BRAND_CONFIG.conciergeWhatsAppUrl).toContain("wa.me/971");
  });
});
