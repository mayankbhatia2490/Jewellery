import { describe, it, expect, beforeEach } from "vitest";
import sharp from "sharp";
import { FidelityChecker } from "./checker";
import { JobQueueWorker } from "@/lib/queue/worker";
import { mockDb } from "@/lib/db/mock-db";
import { ImageProvider, GenerationInput, GenerationOutput } from "@/types";

describe("Phase 4: Fidelity Check Gate & Automatic Refund Engine", () => {
  const userId = "seller-dxb-fidelity-test";
  const serviceCtx = { userId: null, role: "service_role" as const };
  const userCtx = { userId, role: "seller" as const };

  beforeEach(() => {
    mockDb.imageJobs.clear();
    mockDb.jobOutputs.clear();
    mockDb.creditLedger.clear();
    mockDb.storage.clear();
    mockDb.auditLog.clear();
    mockDb.refundTickets.clear();
  });

  it("passes known-good high-fidelity outputs where shape and 22K gold color match", async () => {
    // Generate synthetic 22K warm gold ring
    const inputBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 218, g: 165, b: 32, alpha: 1 }, // 22K warm gold
      },
    })
      .png()
      .toBuffer();

    // Composite onto warm sandstone background with preserved piece
    const goodOutputBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 216, g: 162, b: 30, alpha: 1 }, // virtually identical warm gold
      },
    })
      .png()
      .toBuffer();

    const evaluation = await FidelityChecker.evaluate(inputBuffer, goodOutputBuffer, "22K_yellow");
    expect(evaluation.status).toBe("pass");
    expect(evaluation.iouScore).toBeGreaterThanOrEqual(0.70);
    expect(evaluation.colorDriftDelta).toBeLessThanOrEqual(20);
  });

  it("fails outputs where 22K Gulf gold color drifts to washed out pale silver/grey", async () => {
    // Original 22K Gulf Gold piece
    const inputBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 218, g: 165, b: 32, alpha: 1 }, // Rich 22K gold
      },
    })
      .png()
      .toBuffer();

    // Degraded output: piece rendered in dull silver/grey instead of warm 22K gold
    const paleSilverOutput = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 180, g: 180, b: 190, alpha: 1 }, // Silver / Grey piece
      },
    })
      .png()
      .toBuffer();

    const evaluation = await FidelityChecker.evaluate(inputBuffer, paleSilverOutput, "22K_yellow");
    expect(evaluation.status).toBe("fail");
    expect(evaluation.reasons.some((r) => r.includes("Karat color drift exceeded limit"))).toBe(true);
  });

  it("fails outputs where silhouette geometry is warped or piece is erased (low IoU)", async () => {
    // Original piece with solid center
    const inputBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 201, g: 160, b: 32, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    // Blank output with zero piece detected (empty plinth)
    const blankOutput = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // Pure white background
      },
    })
      .png()
      .toBuffer();

    const evaluation = await FidelityChecker.evaluate(inputBuffer, blankOutput, "21K_yellow");
    expect(evaluation.status).toBe("fail");
    expect(evaluation.reasons.some((r) => r.includes("Silhouette distortion detected"))).toBe(true);
  });

  it("automatically catches fidelity failure in worker and triggers instant credit refund", async () => {
    // 1. Give user 10 credits
    await mockDb.appendLedgerEntry(serviceCtx, {
      id: "grant-fid-10",
      user_id: userId,
      delta: 10,
      reason: "grant",
      idempotency_key: "grant-fidelity-10",
      created_at: new Date().toISOString(),
    });

    // 2. Setup input image
    const inputGoldBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 218, g: 165, b: 32, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const inputPath = `vault/${userId}/inputs/input-ring.webp`;
    await mockDb.writeStorageObject(serviceCtx, inputPath, inputGoldBuffer, "image/webp");

    // 3. Mock Provider that intentionally outputs silver metal (failing color drift for 22K gold)
    class ColorDriftingMockProvider implements ImageProvider {
      name = "drifting-mock";
      async generate(input: GenerationInput): Promise<GenerationOutput> {
        const washedBuffer = await sharp({
          create: {
            width: 1080,
            height: 1080,
            channels: 4,
            background: { r: 180, g: 180, b: 190, alpha: 1 }, // Dull silver metal
          },
        })
          .webp()
          .toBuffer();

        return {
          jobId: input.jobId,
          outputs: [
            {
              aspectRatio: "1:1",
              width: 1080,
              height: 1080,
              buffer: washedBuffer,
              mimeType: "image/webp",
            },
          ],
          metadata: {
            providerName: this.name,
            modelName: "mock-defect",
            durationMs: 50,
            promptUsed: "defect",
          },
        };
      }
    }

    const jobId = "job-fidelity-fail-001";
    await mockDb.insertImageJob(userCtx, {
      id: jobId,
      user_id: userId,
      piece_type: "bangle_bracelet",
      metal_karat: "22K_yellow",
      style_pack_id: "gulf_gold_classic",
      model_persona: "none_product_only",
      spec_badge_enabled: false,
      input_image_path: inputPath,
      input_image_hash: "hash_gold_ring",
      status: "queued",
      fidelity_warning: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const defectiveWorker = new JobQueueWorker(new ColorDriftingMockProvider());
    const result = await defectiveWorker.processJob(jobId);

    // Verify job failed
    expect(result.status).toBe("failed");
    expect(result.error).toContain("Fidelity Gate Failure");

    // Verify user received instant auto-refund
    const finalBalance = await mockDb.getCreditBalance(userCtx, userId);
    expect(finalBalance).toBe(10); // 10 - 1 (spend) + 1 (refund) = 10

    // Verify refund ticket was recorded
    const tickets = Array.from(mockDb.refundTickets.values()).filter((t) => t.job_id === jobId);
    expect(tickets).toHaveLength(1);
    expect(tickets[0].credits_refunded).toBe(1);
    expect(tickets[0].reason).toContain("Karat color drift");
  });
});
