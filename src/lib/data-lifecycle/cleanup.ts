import { mockDb } from "@/lib/db/mock-db";

export interface CleanupResult {
  purgedOutputsCount: number;
  retainedCatalogCount: number;
  freedBytes: number;
}

export class DataLifecycleManager {
  /**
   * 30-Day Auto-Expiry Cleanup Job
   * Purges image outputs older than 30 days unless marked "saved_to_catalog: true".
   */
  static async runAutoExpiryCleanup(asOfDate: Date = new Date()): Promise<CleanupResult> {
    const serviceCtx = { userId: null, role: "service_role" as const };
    let purgedCount = 0;
    let retainedCount = 0;
    let freedBytes = 0;

    const nowIso = asOfDate.toISOString();

    for (const [outputId, output] of mockDb.jobOutputs.entries()) {
      const isExpired = output.expires_at < nowIso;

      if (isExpired) {
        if (output.saved_to_catalog) {
          // Retained because user explicitly saved this piece to their permanent catalog
          retainedCount++;
        } else {
          // Purge from private storage vault
          mockDb.storage.delete(output.storage_path);
          freedBytes += output.file_size_bytes;
          mockDb.jobOutputs.delete(outputId);
          purgedCount++;

          // Record audit log
          mockDb.auditLog.set(`audit-purge-${outputId}`, {
            id: `audit-purge-${outputId}`,
            entity_type: "job_output",
            entity_id: outputId,
            action: "auto_expired_purge",
            metadata: {
              storagePath: output.storage_path,
              freedBytes: output.file_size_bytes,
              expiresAt: output.expires_at,
            },
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    return {
      purgedOutputsCount: purgedCount,
      retainedCatalogCount: retainedCount,
      freedBytes,
    };
  }

  /**
   * 1-Click User Data Erasure (Right to Erasure under UAE PDPL Article 8)
   * Purges all private storage files, anonymizes profile, and cascades deletions.
   */
  static async executeUserErasure(userId: string): Promise<{
    purgedStorageFilesCount: number;
    anonymizedProfile: boolean;
  }> {
    const serviceCtx = { userId: null, role: "service_role" as const };
    let filesPurged = 0;

    // 1. Purge all storage vault files belonging to userId
    for (const [path, obj] of mockDb.storage.entries()) {
      if (obj.ownerId === userId || path.startsWith(`vault/${userId}/`)) {
        mockDb.storage.delete(path);
        filesPurged++;
      }
    }

    // 2. Remove job outputs and image jobs
    for (const [jobId, job] of mockDb.imageJobs.entries()) {
      if (job.user_id === userId) {
        for (const [outId, out] of mockDb.jobOutputs.entries()) {
          if (out.job_id === jobId) {
            mockDb.jobOutputs.delete(outId);
          }
        }
        mockDb.imageJobs.delete(jobId);
      }
    }

    // 3. Remove shops
    for (const [shopId, shop] of mockDb.shops.entries()) {
      if (shop.owner_id === userId) {
        mockDb.shops.delete(shopId);
      }
    }

    // 4. Anonymize profile (retaining non-identifiable tombstone for tax compliance audit)
    const profile = mockDb.profiles.get(userId);
    if (profile) {
      mockDb.profiles.set(userId, {
        ...profile,
        phone: `+971-PURGED-${userId.slice(0, 8)}`,
        full_name: "Anonymized / Purged User (PDPL Right to Erasure)",
        updated_at: new Date().toISOString(),
      });
    }

    // 5. Audit log
    mockDb.auditLog.set(`audit-erasure-${userId}`, {
      id: `audit-erasure-${userId}`,
      entity_type: "profile",
      entity_id: userId,
      action: "pdpl_right_to_erasure_completed",
      metadata: {
        purgedFilesCount: filesPurged,
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });

    return {
      purgedStorageFilesCount: filesPurged,
      anonymizedProfile: Boolean(profile),
    };
  }
}
