import { mockDb, ImageJobRecord } from "@/lib/db/mock-db";
import { MockImageProvider } from "@/lib/providers/mock-image-provider";
import { ImageProvider } from "@/types";
import crypto from "crypto";

export interface WorkerProcessResult {
  jobId: string;
  status: "done" | "failed" | "needs_review";
  outputsCount: number;
  signedUrls: string[];
  error?: string;
}

export class JobQueueWorker {
  private provider: ImageProvider;

  constructor(provider?: ImageProvider) {
    this.provider = provider || new MockImageProvider();
  }

  /**
   * Process a single job through the state machine:
   * queued -> processing -> checking -> done | failed
   */
  async processJob(jobId: string): Promise<WorkerProcessResult> {
    const serviceCtx = { userId: null, role: "service_role" as const };
    const job = await mockDb.getImageJob(serviceCtx, jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found in queue`);
    }

    if (job.status !== "queued") {
      throw new Error(`Job ${jobId} is not in queued state (current: ${job.status})`);
    }

    // 1. Check seller credit balance
    const balance = await mockDb.getCreditBalance(serviceCtx, job.user_id);
    if (balance < 1) {
      await mockDb.updateImageJobStatus(serviceCtx, jobId, "failed", {
        error_message: "Insufficient credits. Please top up your account.",
      });
      await this.logAudit(jobId, "job_failed", { reason: "insufficient_credits" });
      return {
        jobId,
        status: "failed",
        outputsCount: 0,
        signedUrls: [],
        error: "Insufficient credits",
      };
    }

    // 2. Transition: queued -> processing
    await mockDb.updateImageJobStatus(serviceCtx, jobId, "processing");
    await this.logAudit(jobId, "status_transition", { from: "queued", to: "processing" });

    // Deduct 1 credit with idempotency key
    const spendKey = `job-spend-${jobId}`;
    await mockDb.appendLedgerEntry(serviceCtx, {
      id: crypto.randomUUID(),
      user_id: job.user_id,
      delta: -1,
      reason: "spend",
      idempotency_key: spendKey,
      reference_id: jobId,
      created_at: new Date().toISOString(),
    });

    try {
      // 3. Load input image buffer from storage vault
      const inputBuffer = await mockDb.readStorageObject(serviceCtx, job.input_image_path);

      // Execute generation pipeline
      const generationOutput = await this.provider.generate({
        jobId,
        userId: job.user_id,
        imageBuffer: inputBuffer,
        mimeType: "image/webp",
        pieceType: job.piece_type as any,
        metalKarat: job.metal_karat as any,
        stylePackId: job.style_pack_id as any,
        modelPersona: job.model_persona as any,
        specBadgeEnabled: job.spec_badge_enabled,
        specBadgeData: job.spec_badge_data as any,
      });

      // 4. Transition: processing -> checking (fidelity gate hook)
      await mockDb.updateImageJobStatus(serviceCtx, jobId, "checking");
      await this.logAudit(jobId, "status_transition", { from: "processing", to: "checking" });

      // Save outputs to private storage vault and record job_outputs
      const signedUrls: string[] = [];
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days default

      for (const out of generationOutput.outputs) {
        const ratioSlug = out.aspectRatio.replace(":", "x");
        const storagePath = `vault/${job.user_id}/outputs/${jobId}_${ratioSlug}.webp`;

        const saved = await mockDb.writeStorageObject(
          serviceCtx,
          storagePath,
          out.buffer,
          out.mimeType
        );

        const outputId = crypto.randomUUID();
        mockDb.jobOutputs.set(outputId, {
          id: outputId,
          job_id: jobId,
          aspect_ratio: out.aspectRatio,
          storage_path: storagePath,
          width: out.width,
          height: out.height,
          file_size_bytes: out.buffer.length,
          mime_type: out.mimeType,
          fidelity_score: 0.98,
          saved_to_catalog: false,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        });

        signedUrls.push(saved.signedUrl);
      }

      // 5. Transition: checking -> done
      await mockDb.updateImageJobStatus(serviceCtx, jobId, "done");
      await this.logAudit(jobId, "status_transition", { from: "checking", to: "done" });

      return {
        jobId,
        status: "done",
        outputsCount: generationOutput.outputs.length,
        signedUrls,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Pipeline execution failed";

      // Mark failed
      await mockDb.updateImageJobStatus(serviceCtx, jobId, "failed", {
        error_message: errorMsg,
      });
      await this.logAudit(jobId, "status_transition", { from: "processing", to: "failed", error: errorMsg });

      // Instant Idempotent Refund
      const refundKey = `job-refund-${jobId}`;
      try {
        const ledgerEntry = await mockDb.appendLedgerEntry(serviceCtx, {
          id: crypto.randomUUID(),
          user_id: job.user_id,
          delta: 1,
          reason: "refund",
          idempotency_key: refundKey,
          reference_id: jobId,
          created_at: new Date().toISOString(),
        });

        const refundTicketId = crypto.randomUUID();
        mockDb.refundTickets.set(refundTicketId, {
          id: refundTicketId,
          job_id: jobId,
          user_id: job.user_id,
          credits_refunded: 1,
          reason: `Automatic refund for failed job: ${errorMsg}`,
          ledger_entry_id: ledgerEntry.id,
          created_at: new Date().toISOString(),
        });
      } catch {
        // Refund key already appended, idempotent
      }

      return {
        jobId,
        status: "failed",
        outputsCount: 0,
        signedUrls: [],
        error: errorMsg,
      };
    }
  }

  private async logAudit(jobId: string, action: string, metadata: Record<string, unknown>) {
    const logId = crypto.randomUUID();
    mockDb.auditLog.set(logId, {
      id: logId,
      entity_type: "image_job",
      entity_id: jobId,
      action,
      metadata,
      created_at: new Date().toISOString(),
    });
  }
}
