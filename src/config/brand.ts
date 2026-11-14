/**
 * Central Brand Configuration
 * All user-facing brand references must use BRAND_NAME so the final UAE trademarked name
 * can be swapped in this single location before commercial launch.
 */
export const BRAND_NAME = "BRAND";

export const BRAND_CONFIG = {
  name: BRAND_NAME,
  legalEntity: "BRAND Technologies FZ-LLC (Pending UAE Incorporation)",
  supportEmail: "concierge@brand.ae",
  supportWhatsAppNumber: "+971501234567",
  supportWhatsAppUrl: "https://wa.me/971501234567?text=Hello%20BRAND%20Concierge%2C%20I%20have%20jewellery%20photos%20ready",
  conciergeWhatsAppUrl: "https://wa.me/971501234567?text=Hello%20BRAND%20Concierge%2C%20I%20would%20like%20to%20send%2020%20pieces%20for%20catalog%20production",
  defaultCurrency: "AED" as const,
  vatRate: 0.05, // 5% UAE VAT
  supportHours: "09:00 - 19:00 GST (UTC+4), Mon - Sat",
  hubLocation: "Gold & Diamond Park / Deira Gold Souk, Dubai, UAE",
} as const;
