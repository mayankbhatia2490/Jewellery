import { describe, it, expect, beforeEach } from "vitest";
import { MockDatabase, AuthContext } from "./mock-db";
import { MockOtpProvider } from "../auth/otp";

describe("Phase 1: Row Level Security (RLS) & Multi-Tenant Isolation", () => {
  let db: MockDatabase;

  const userAContext: AuthContext = {
    userId: "user-a-1111-1111",
    role: "seller",
  };

  const userBContext: AuthContext = {
    userId: "user-b-2222-2222",
    role: "seller",
  };

  const adminContext: AuthContext = {
    userId: "admin-9999-9999",
    role: "admin",
  };

  const serviceRoleContext: AuthContext = {
    userId: null,
    role: "service_role",
  };

  beforeEach(() => {
    db = new MockDatabase();
  });

  describe("Profiles Isolation", () => {
    it("allows User A to read and update their own profile", async () => {
      await db.upsertProfile(userAContext, {
        id: "user-a-1111-1111",
        phone: "+971501111111",
        role: "seller",
        full_name: "Ahmed Al-Maktoum Jewellers",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const profile = await db.getProfile(userAContext, "user-a-1111-1111");
      expect(profile).not.toBeNull();
      expect(profile?.full_name).toBe("Ahmed Al-Maktoum Jewellers");
    });

    it("STRICTLY BLOCKS User A from reading or updating User B's profile", async () => {
      await db.upsertProfile(userBContext, {
        id: "user-b-2222-2222",
        phone: "+971502222222",
        role: "seller",
        full_name: "Deira Pearl Boutique",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // User A reading User B's profile must throw RLS error
      await expect(db.getProfile(userAContext, "user-b-2222-2222")).rejects.toThrow(
        /RLS Violation/
      );

      // User A updating User B's profile must throw RLS error
      await expect(
        db.upsertProfile(userAContext, {
          id: "user-b-2222-2222",
          phone: "+971502222222",
          role: "seller",
          full_name: "Hacked by User A",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      ).rejects.toThrow(/RLS Violation/);
    });

    it("allows Admin to inspect any user profile", async () => {
      await db.upsertProfile(userBContext, {
        id: "user-b-2222-2222",
        phone: "+971502222222",
        role: "seller",
        full_name: "Sharjah Gold House",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const profile = await db.getProfile(adminContext, "user-b-2222-2222");
      expect(profile?.full_name).toBe("Sharjah Gold House");
    });
  });

  describe("Shops Isolation", () => {
    it("prevents User A from reading, modifying, or deleting User B's shops", async () => {
      const shopB = {
        id: "shop-b-001",
        owner_id: "user-b-2222-2222",
        name_en: "Sharjah Heritage Jewels",
        name_ar: "مجوهرات الشارقة التراثية",
        location: "Sharjah Gold Centre",
        created_at: new Date().toISOString(),
      };

      await db.insertShop(userBContext, shopB);

      // User A cannot read User B's shop
      await expect(db.getShop(userAContext, "shop-b-001")).rejects.toThrow(/RLS Violation/);

      // User A cannot delete User B's shop
      await expect(db.deleteShop(userAContext, "shop-b-001")).rejects.toThrow(/RLS Violation/);
    });
  });

  describe("Credit Ledger: Append-Only & Idempotency", () => {
    it("prohibits sellers from directly manipulating credit ledger", async () => {
      const illegalEntry = {
        id: "ledger-hack-1",
        user_id: "user-a-1111-1111",
        delta: 1000,
        reason: "grant" as const,
        idempotency_key: "free-credits-exploit",
        created_at: new Date().toISOString(),
      };

      await expect(db.appendLedgerEntry(userAContext, illegalEntry)).rejects.toThrow(
        /RLS Violation: Normal sellers cannot directly insert credit ledger records/
      );
    });

    it("correctly computes balance as SUM(delta) via service_role and rejects duplicate idempotency keys", async () => {
      // Grant initial 50 credits
      await db.appendLedgerEntry(serviceRoleContext, {
        id: "ledger-001",
        user_id: "user-a-1111-1111",
        delta: 50,
        reason: "purchase",
        idempotency_key: "stripe-charge-success-001",
        created_at: new Date().toISOString(),
      });

      // Deduct 1 credit for generation job
      await db.appendLedgerEntry(serviceRoleContext, {
        id: "ledger-002",
        user_id: "user-a-1111-1111",
        delta: -1,
        reason: "spend",
        idempotency_key: "job-spend-job-001",
        created_at: new Date().toISOString(),
      });

      const balanceA = await db.getCreditBalance(userAContext, "user-a-1111-1111");
      expect(balanceA).toBe(49);

      // Replaying the exact same purchase idempotency key MUST be rejected
      await expect(
        db.appendLedgerEntry(serviceRoleContext, {
          id: "ledger-duplicate",
          user_id: "user-a-1111-1111",
          delta: 50,
          reason: "purchase",
          idempotency_key: "stripe-charge-success-001",
          created_at: new Date().toISOString(),
        })
      ).rejects.toThrow(/Idempotency violation/);

      // User B cannot view User A's credit balance
      await expect(db.getCreditBalance(userBContext, "user-a-1111-1111")).rejects.toThrow(
        /RLS Violation/
      );
    });
  });

  describe("Image Jobs & Outputs Isolation", () => {
    it("isolates image jobs and output links between sellers", async () => {
      const jobA = {
        id: "job-aaa-111",
        user_id: "user-a-1111-1111",
        piece_type: "necklace",
        metal_karat: "22K_yellow",
        style_pack_id: "gulf_gold_classic",
        model_persona: "khaleeji_modest",
        spec_badge_enabled: true,
        input_image_path: "vault/user-a-1111-1111/input.jpg",
        input_image_hash: "hash123",
        status: "done" as const,
        fidelity_warning: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.insertImageJob(userAContext, jobA);

      db.jobOutputs.set("out-1", {
        id: "out-1",
        job_id: "job-aaa-111",
        aspect_ratio: "1:1",
        storage_path: "vault/user-a-1111-1111/output-1x1.webp",
        width: 1080,
        height: 1080,
        file_size_bytes: 450000,
        mime_type: "image/webp",
        fidelity_score: 0.98,
        saved_to_catalog: false,
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      });

      // User A can read their own job and outputs
      const job = await db.getImageJob(userAContext, "job-aaa-111");
      expect(job?.id).toBe("job-aaa-111");

      const outputs = await db.getJobOutputs(userAContext, "job-aaa-111");
      expect(outputs).toHaveLength(1);

      // User B cannot read User A's job or outputs
      await expect(db.getImageJob(userBContext, "job-aaa-111")).rejects.toThrow(/RLS Violation/);
      await expect(db.getJobOutputs(userBContext, "job-aaa-111")).rejects.toThrow(/RLS Violation/);
    });
  });

  describe("Private Storage Vault Isolation", () => {
    it("ensures User A cannot read or write to User B's private storage bucket folder", async () => {
      const bufferA = Buffer.from("User A private jewellery photo");
      const pathA = "vault/user-a-1111-1111/necklace.jpg";

      await db.writeStorageObject(userAContext, pathA, bufferA, "image/jpeg");

      const retrievedA = await db.readStorageObject(userAContext, pathA);
      expect(retrievedA.toString()).toBe("User A private jewellery photo");

      // User B trying to write to User A's folder is blocked
      await expect(
        db.writeStorageObject(
          userBContext,
          "vault/user-a-1111-1111/exploit.jpg",
          Buffer.from("malicious"),
          "image/jpeg"
        )
      ).rejects.toThrow(/Storage RLS Violation/);

      // User B trying to read User A's photo is blocked
      await expect(db.readStorageObject(userBContext, pathA)).rejects.toThrow(
        /Storage RLS Violation/
      );
    });
  });
});

describe("Phase 1: UAE Phone Auth (+971) & MockOtpProvider", () => {
  beforeEach(() => {
    MockOtpProvider.clearStore();
  });

  it("normalizes UAE phone numbers accurately", () => {
    expect(MockOtpProvider.normalizeUaePhone("+971501234567")).toBe("+971501234567");
    expect(MockOtpProvider.normalizeUaePhone("0501234567")).toBe("+971501234567");
    expect(MockOtpProvider.normalizeUaePhone("00971501234567")).toBe("+971501234567");
    expect(MockOtpProvider.normalizeUaePhone("50 123 4567")).toBe("+971501234567");
  });

  it("rejects invalid non-UAE numbers", () => {
    expect(() => MockOtpProvider.normalizeUaePhone("+14155552671")).toThrow(/Invalid UAE phone number/);
    expect(() => MockOtpProvider.normalizeUaePhone("+447911123456")).toThrow(/Invalid UAE phone number/);
  });

  it("delivers OTP and verifies successfully in test/mock mode", async () => {
    const phone = "+971501234567";
    const res = await MockOtpProvider.sendOtp(phone);
    expect(res.success).toBe(true);

    const verification = await MockOtpProvider.verifyOtp(phone, res.debugCode || "123456");
    expect(verification.verified).toBe(true);
    expect(verification.token).toBeDefined();
  });

  it("locks after 3 incorrect OTP attempts", async () => {
    const phone = "+971509999999";
    await MockOtpProvider.sendOtp(phone);

    // Attempt 1 incorrect
    const v1 = await MockOtpProvider.verifyOtp(phone, "000000");
    expect(v1.verified).toBe(false);

    // Attempt 2 incorrect
    const v2 = await MockOtpProvider.verifyOtp(phone, "000000");
    expect(v2.verified).toBe(false);

    // Attempt 3 incorrect
    const v3 = await MockOtpProvider.verifyOtp(phone, "000000");
    expect(v3.verified).toBe(false);

    // Attempt 4 throws lock error
    await expect(MockOtpProvider.verifyOtp(phone, "000000")).rejects.toThrow(/Too many incorrect attempts/);
  });
});
