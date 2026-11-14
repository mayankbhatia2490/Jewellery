import crypto from "crypto";

export interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP storage for dev & testing (in prod, backed by Redis/Postgres)
const otpStore = new Map<string, OtpRecord>();
const requestTimestamps = new Map<string, number[]>();

export class MockOtpProvider {
  /**
   * Validate standard UAE Mobile Number
   * Acceptable formats: +971501234567, 0501234567, 00971501234567
   * Standardizes to +9715XXXXXXXX
   */
  static normalizeUaePhone(input: string): string {
    const cleaned = input.replace(/[\s\-\(\)]/g, "");
    if (/^\+9715\d{8}$/.test(cleaned)) {
      return cleaned;
    }
    if (/^009715\d{8}$/.test(cleaned)) {
      return "+" + cleaned.slice(2);
    }
    if (/^05\d{8}$/.test(cleaned)) {
      return "+971" + cleaned.slice(1);
    }
    if (/^5\d{8}$/.test(cleaned)) {
      return "+971" + cleaned;
    }
    throw new Error("Invalid UAE phone number. Must be a valid 9-digit UAE mobile (e.g. +971 50 123 4567)");
  }

  /**
   * Sends an OTP to the UAE phone number.
   * In development/test, deterministic code is logged and saved in memory.
   */
  static async sendOtp(phoneInput: string): Promise<{ success: boolean; message: string; debugCode?: string }> {
    const phone = this.normalizeUaePhone(phoneInput);

    // Rate limiting: max 3 requests per 10 minutes
    const now = Date.now();
    const timestamps = requestTimestamps.get(phone) || [];
    const validTimestamps = timestamps.filter((t) => now - t < 10 * 60 * 1000);
    if (validTimestamps.length >= 3) {
      throw new Error("Rate limit exceeded. Please wait a few minutes before requesting another OTP.");
    }
    validTimestamps.push(now);
    requestTimestamps.set(phone, validTimestamps);

    // In dev / test, fixed code 123456 for test numbers, or random 6-digit
    const code = phone.endsWith("0000") || process.env.NODE_ENV === "test" ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phone, {
      code,
      expiresAt,
      attempts: 0,
    });

    return {
      success: true,
      message: `OTP sent successfully to ${phone}`,
      debugCode: process.env.NODE_ENV !== "production" ? code : undefined,
    };
  }

  /**
   * Verifies an OTP code for a UAE phone number.
   */
  static async verifyOtp(phoneInput: string, codeInput: string): Promise<{ verified: boolean; phone: string; token?: string }> {
    const phone = this.normalizeUaePhone(phoneInput);
    const record = otpStore.get(phone);

    if (!record) {
      return { verified: false, phone };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      throw new Error("OTP has expired. Please request a new code.");
    }

    if (record.attempts >= 3) {
      otpStore.delete(phone);
      throw new Error("Too many incorrect attempts. Please request a new code.");
    }

    if (record.code !== codeInput.trim()) {
      record.attempts += 1;
      return { verified: false, phone };
    }

    // Success! Clear OTP
    otpStore.delete(phone);

    // Generate mock signed session token
    const token = Buffer.from(
      JSON.stringify({
        phone,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 86400,
      })
    ).toString("base64");

    return {
      verified: true,
      phone,
      token,
    };
  }

  static clearStore() {
    otpStore.clear();
    requestTimestamps.clear();
  }
}
