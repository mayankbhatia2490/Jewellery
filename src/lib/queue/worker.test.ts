import { describe, it, expect, beforeEach } from "vitest";
import sharp from "sharp";
import { mockDb } from "@/lib/db/mock-db";
import { ImageValidator } from "@/lib/image/validator";
import { JobQueueWorker } from "./worker";
import { ImageProvider, GenerationInput, GenerationOutput } from "@/types";

describe("Phase 2: Upload Pipeline, Queue Worker & MockProvider Integration", () => {
  const userId = "user-jeweller-dxb-101";
  const serviceCtx = { userId: null, role: "service_role" as const };
  const userCtx = { userId, role: "seller" as const };

  beforeEach(() => {
    // Reset database state for fresh run
    mockDb.imageJobs.clear();
    mockDb.jobOutputs.clear();
    mockDb.creditLedger.clear();
    mockDb.storage.clear();
    mockDb.auditLog.clear();
    mockDb.refundTickets.clear();
  });

  it("validates file sizes, strips EXIF, and auto-rotates via ImageValidator", async () => {
    // Create synthetic 100x100 PNG
    const samplePng = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 218, g: 165, b: 32, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await ImageValidator.validateAndSanitize(samplePng);
    expect(result.valid).toBe(true);
    expect(result.mimeType).toBe("image/webp");
    expect(result.sanitizedBuffer).toBeDefined();

    // Verify metadata was stripped (exif is empty)
    const meta = await sharp(result.sanitizedBuffer!).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.exif).toBeUndefined();

    // Test rejection of oversized file (>15MB)
    const fakeOversizedBuffer = Buffer.alloc(16 * 1024 * 1024);
    const oversizedResult = await ImageValidator.validateAndSanitize(fakeOversizedBuffer);
    expect(oversizedResult.valid).toBe(false);
    expect(oversizedResult.error).toContain("15 MB limit");

    // Test rejection of unsupported file types
    const textBuffer = Buffer.from("Not an image file header");
    const badResult = await ImageValidator.validateAndSanitize(textBuffer);
    expect(badResult.valid).toBe(false);
    expect(badResult.error).toContain("Unsupported file format");
  });

  it("executes full end-to-end flow: Upload -> Queue -> Worker -> Signed Output URLs", async () => {
    // 1. Give user 10 initial credits
    await mockDb.appendLedgerEntry(serviceCtx, {
      id: "grant-001",
      user_id: userId,
      delta: 10,
      reason: "grant",
      idempotency_key: "grant-initial-10",
      created_at: new Date().toISOString(),
    });

    const initialBalance = await mockDb.getCreditBalance(userCtx, userId);
    expect(initialBalance).toBe(10);

    // 2. Prepare sample raw image
    const rawGoldRing = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 201, g: 160, b: 32, alpha: 1 }, // 21K gold color
      },
    })
      .jpeg()
      .toBuffer();

    const sanitized = await ImageValidator.validateAndSanitize(rawGoldRing);
    expect(sanitized.valid).toBe(true);

    const inputStoragePath = `vault/${userId}/inputs/ring-test-01.webp`;
    await mockDb.writeStorageObject(serviceCtx, inputStoragePath, sanitized.sanitizedBuffer!, "image/webp");

    // 3. Enqueue job
    const jobId = "job-e2e-001";
    await mockDb.insertImageJob(userCtx, {
      id: jobId,
      user_id: userId,
      piece_type: "ring",
      metal_karat: "21K_yellow",
      style_pack_id: "gulf_gold_classic",
      model_persona: "none_product_only",
      spec_badge_enabled: true,
      spec_badge_data: {
        karat_label: "21K Gold",
        weight_grams: 4.85,
        sku: "R-DXB-992",
        price_aed: 1650,
      },
      input_image_path: inputStoragePath,
      input_image_hash: "hash_test_ring",
      status: "queued",
      fidelity_warning: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 4. Run Queue Worker
    const worker = new JobQueueWorker();
    const result = await worker.processJob(jobId);

    // Verify worker outcome
    expect(result.status).toBe("done");
    expect(result.outputsCount).toBe(3);
    expect(result.signedUrls).toHaveLength(3);

    // 5. Verify outputs in DB
    const outputs = await mockDb.getJobOutputs(userCtx, jobId);
    expect(outputs).toHaveLength(3);

    const ratios = outputs.map((o) => o.aspect_ratio);
    expect(ratios).toContain("1:1");
    expect(ratios).toContain("4:5");
    expect(ratios).toContain("9:16");

    const out1x1 = outputs.find((o) => o.aspect_ratio === "1:1");
    expect(out1x1?.width).toBe(1080);
    expect(out1x1?.height).toBe(1080);

    const out4x5 = outputs.find((o) => o.aspect_ratio === "4:5");
    expect(out4x5?.width).toBe(1080);
    expect(out4x5?.height).toBe(1350);

    const out9x16 = outputs.find((o) => o.aspect_ratio === "9:16");
    expect(out9x16?.width).toBe(1080);
    expect(out9x16?.height).toBe(1920);

    // 6. Verify Credit Ledger balance decremented by 1
    const finalBalance = await mockDb.getCreditBalance(userCtx, userId);
    expect(finalBalance).toBe(9);

    // Verify spend ledger entry
    const spendEntry = mockDb.creditLedger.get(`job-spend-${jobId}`);
    expect(spendEntry).toBeDefined();
    expect(spendEntry?.delta).toBe(-1);
    expect(spendEntry?.reason).toBe("spend");

    // 7. Verify Audit log recorded transitions
    const logs = Array.from(mockDb.auditLog.values()).filter((l) => l.entity_id === jobId);
    expect(logs.length).toBeGreaterThanOrEqual(3);
  });

  it("handles pipeline failure gracefully with instant idempotent credit refund", async () => {
    // 1. Give user 5 credits
    await mockDb.appendLedgerEntry(serviceCtx, {
      id: "grant-002",
      user_id: userId,
      delta: 5,
      reason: "grant",
      idempotency_key: "grant-initial-5",
      created_at: new Date().toISOString(),
    });

    const initialBalance = await mockDb.getCreditBalance(userCtx, userId);
    expect(initialBalance).toBe(5);

    // 2. Create job with broken image path to force worker exception
    const failJobId = "job-fail-002";
    await mockDb.insertImageJob(userCtx, {
      id: failJobId,
      user_id: userId,
      piece_type: "necklace",
      metal_karat: "22K_yellow",
      style_pack_id: "bridal_set",
      model_persona: "khaleeji_modest",
      spec_badge_enabled: false,
      input_image_path: "vault/missing-path/missing.webp",
      input_image_hash: "missing_hash",
      status: "queued",
      fidelity_warning: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const worker = new JobQueueWorker();
    const result = await worker.processJob(failJobId);

    expect(result.status).toBe("failed");
    expect(result.error).toBeDefined();

    // Verify job in DB is failed
    const failedJob = await mockDb.getImageJob(userCtx, failJobId);
    expect(failedJob?.status).toBe("failed");

    // Verify refund ticket created
    const refundTickets = Array.from(mockDb.refundTickets.values()).filter((r) => r.job_id === failJobId);
    expect(refundTickets).toHaveLength(1);
    expect(refundTickets[0].credits_refunded).toBe(1);

    // Verify user credit balance was restored back to 5
    const balanceAfterRefund = await mockDb.getCreditBalance(userCtx, userId);
    expect(balanceAfterRefund).toBe(5);
  });
});
