import { describe, it, expect, beforeEach } from "vitest";
import { mockDb } from "@/lib/db/mock-db";
import { DataLifecycleManager } from "./cleanup";

describe("Phase 7: UAE PDPL Compliance & Data Lifecycle Management", () => {
  const userId = "seller-dxb-pdpl-test-01";
  const otherUserId = "seller-dxb-other-user";
  const serviceCtx = { userId: null, role: "service_role" as const };

  beforeEach(() => {
    mockDb.storage.clear();
    mockDb.jobOutputs.clear();
    mockDb.imageJobs.clear();
    mockDb.profiles.clear();
    mockDb.shops.clear();
    mockDb.auditLog.clear();
  });

  describe("30-Day Auto-Expiry Cleanup", () => {
    it("purges expired outputs older than 30 days while preserving saved catalog items", async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString();
      const futureDate = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString();

      // Output 1: Expired and NOT saved to catalog -> MUST be purged
      const path1 = `vault/${userId}/outputs/expired_unsaved.webp`;
      mockDb.storage.set(path1, {
        path: path1,
        ownerId: userId,
        data: Buffer.from("image_data_1"),
        mimeType: "image/webp",
        createdAt: pastDate,
      });
      mockDb.jobOutputs.set("out-expired-unsaved", {
        id: "out-expired-unsaved",
        job_id: "job-1",
        aspect_ratio: "1:1",
        storage_path: path1,
        width: 1080,
        height: 1080,
        file_size_bytes: 50000,
        mime_type: "image/webp",
        fidelity_score: 0.98,
        saved_to_catalog: false,
        expires_at: pastDate,
        created_at: pastDate,
      });

      // Output 2: Expired BUT marked "saved_to_catalog: true" -> MUST be retained
      const path2 = `vault/${userId}/outputs/expired_saved.webp`;
      mockDb.storage.set(path2, {
        path: path2,
        ownerId: userId,
        data: Buffer.from("image_data_2"),
        mimeType: "image/webp",
        createdAt: pastDate,
      });
      mockDb.jobOutputs.set("out-expired-saved", {
        id: "out-expired-saved",
        job_id: "job-2",
        aspect_ratio: "1:1",
        storage_path: path2,
        width: 1080,
        height: 1080,
        file_size_bytes: 60000,
        mime_type: "image/webp",
        fidelity_score: 0.99,
        saved_to_catalog: true, // Permanent catalog mark
        expires_at: pastDate,
        created_at: pastDate,
      });

      // Output 3: Active and NOT expired -> MUST be retained
      const path3 = `vault/${userId}/outputs/active.webp`;
      mockDb.storage.set(path3, {
        path: path3,
        ownerId: userId,
        data: Buffer.from("image_data_3"),
        mimeType: "image/webp",
        createdAt: now.toISOString(),
      });
      mockDb.jobOutputs.set("out-active", {
        id: "out-active",
        job_id: "job-3",
        aspect_ratio: "1:1",
        storage_path: path3,
        width: 1080,
        height: 1080,
        file_size_bytes: 55000,
        mime_type: "image/webp",
        fidelity_score: 0.97,
        saved_to_catalog: false,
        expires_at: futureDate,
        created_at: now.toISOString(),
      });

      const cleanup = await DataLifecycleManager.runAutoExpiryCleanup(now);

      expect(cleanup.purgedOutputsCount).toBe(1);
      expect(cleanup.retainedCatalogCount).toBe(1);
      expect(cleanup.freedBytes).toBe(50000);

      // Verify Output 1 is deleted from storage vault and DB
      expect(mockDb.storage.has(path1)).toBe(false);
      expect(mockDb.jobOutputs.has("out-expired-unsaved")).toBe(false);

      // Verify Output 2 (saved catalog) and Output 3 (active) are preserved
      expect(mockDb.storage.has(path2)).toBe(true);
      expect(mockDb.jobOutputs.has("out-expired-saved")).toBe(true);

      expect(mockDb.storage.has(path3)).toBe(true);
      expect(mockDb.jobOutputs.has("out-active")).toBe(true);
    });
  });

  describe("1-Click User Data Erasure (UAE PDPL Article 8)", () => {
    it("completely purges storage assets, deletes shops, and anonymizes profile", async () => {
      // Setup user profile
      mockDb.profiles.set(userId, {
        id: userId,
        phone: "+971501234567",
        role: "seller",
        full_name: "Tariq Al-Nuaimi",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Setup user shop
      mockDb.shops.set("shop-01", {
        id: "shop-01",
        owner_id: userId,
        name_en: "Nuaimi Gold Souk",
        name_ar: "مجوهرات النعيمي",
        location: "Deira Gold Souk",
        created_at: new Date().toISOString(),
      });

      // Setup user storage assets
      const userFile1 = `vault/${userId}/inputs/photo1.webp`;
      const userFile2 = `vault/${userId}/outputs/job1_1x1.webp`;
      mockDb.storage.set(userFile1, {
        path: userFile1,
        ownerId: userId,
        data: Buffer.from("photo1"),
        mimeType: "image/webp",
        createdAt: new Date().toISOString(),
      });
      mockDb.storage.set(userFile2, {
        path: userFile2,
        ownerId: userId,
        data: Buffer.from("photo2"),
        mimeType: "image/webp",
        createdAt: new Date().toISOString(),
      });

      // Setup other user file (must be untouched)
      const otherFile = `vault/${otherUserId}/inputs/other.webp`;
      mockDb.storage.set(otherFile, {
        path: otherFile,
        ownerId: otherUserId,
        data: Buffer.from("other_photo"),
        mimeType: "image/webp",
        createdAt: new Date().toISOString(),
      });

      // Execute Right to Erasure
      const result = await DataLifecycleManager.executeUserErasure(userId);

      expect(result.purgedStorageFilesCount).toBe(2);
      expect(result.anonymizedProfile).toBe(true);

      // Verify user's files are gone
      expect(mockDb.storage.has(userFile1)).toBe(false);
      expect(mockDb.storage.has(userFile2)).toBe(false);

      // Verify other user's file is intact
      expect(mockDb.storage.has(otherFile)).toBe(true);

      // Verify shop is deleted
      expect(mockDb.shops.has("shop-01")).toBe(false);

      // Verify profile is anonymized
      const anonymized = mockDb.profiles.get(userId);
      expect(anonymized?.phone).toContain("+971-PURGED-");
      expect(anonymized?.full_name).toContain("Anonymized");

      // Verify regulatory audit trail
      const audit = mockDb.auditLog.get(`audit-erasure-${userId}`);
      expect(audit).toBeDefined();
      expect(audit?.action).toBe("pdpl_right_to_erasure_completed");
    });
  });
});
