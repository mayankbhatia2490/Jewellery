/**
 * In-Memory Database & RLS Enforcement Engine
 * Mirrors the exact Supabase PostgreSQL schema and Row Level Security policies.
 * Used for automated RLS verification in Vitest, offline dev, and worker integration tests.
 */

export interface AuthContext {
  userId: string | null;
  role: "anon" | "seller" | "admin" | "service_role";
}

export interface ProfileRecord {
  id: string;
  phone: string;
  role: "seller" | "admin";
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ShopRecord {
  id: string;
  owner_id: string;
  name_en: string;
  name_ar: string;
  trn_number?: string;
  location: string;
  created_at: string;
}

export interface CreditPackageRecord {
  id: string;
  name_en: string;
  name_ar: string;
  credits: number;
  price_aed_inclusive: number;
  price_aed_exclusive: number;
  vat_amount_aed: number;
  is_active: boolean;
  created_at: string;
}

export interface CreditLedgerRecord {
  id: string;
  user_id: string;
  delta: number;
  reason: "grant" | "purchase" | "spend" | "refund" | "bonus";
  idempotency_key: string;
  reference_id?: string;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  user_id: string;
  package_id: string;
  credits: number;
  amount_aed_inclusive: number;
  amount_aed_exclusive: number;
  vat_amount_aed: number;
  status: "pending" | "completed" | "failed";
  payment_provider: string;
  payment_reference?: string;
  invoice_number: string;
  created_at: string;
}

export interface StylePackRecord {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  is_active: boolean;
  created_at: string;
}

export interface StylePackVersionRecord {
  id: string;
  style_pack_id: string;
  version: number;
  system_prompt: string;
  negative_constraints: string;
  model_target: string;
  karat_color_hints: Record<string, unknown>;
  created_at: string;
}

export interface ImageJobRecord {
  id: string;
  user_id: string;
  piece_type: string;
  metal_karat: string;
  style_pack_id: string;
  style_pack_version_id?: string;
  model_persona: string;
  spec_badge_enabled: boolean;
  spec_badge_data?: Record<string, unknown>;
  input_image_path: string;
  input_image_hash: string;
  status: "queued" | "processing" | "checking" | "done" | "failed" | "needs_review";
  fidelity_warning: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface JobOutputRecord {
  id: string;
  job_id: string;
  aspect_ratio: "1:1" | "4:5" | "9:16";
  storage_path: string;
  width: number;
  height: number;
  file_size_bytes: number;
  mime_type: string;
  fidelity_score: number;
  saved_to_catalog: boolean;
  expires_at: string;
  created_at: string;
}

export interface RefundTicketRecord {
  id: string;
  job_id: string;
  user_id: string;
  credits_refunded: number;
  reason: string;
  ledger_entry_id?: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StorageObject {
  path: string;
  ownerId: string;
  data: Buffer;
  mimeType: string;
  createdAt: string;
}

export class MockDatabase {
  profiles: Map<string, ProfileRecord> = new Map();
  shops: Map<string, ShopRecord> = new Map();
  creditPackages: Map<string, CreditPackageRecord> = new Map();
  creditLedger: Map<string, CreditLedgerRecord> = new Map();
  orders: Map<string, OrderRecord> = new Map();
  stylePacks: Map<string, StylePackRecord> = new Map();
  stylePackVersions: Map<string, StylePackVersionRecord> = new Map();
  imageJobs: Map<string, ImageJobRecord> = new Map();
  jobOutputs: Map<string, JobOutputRecord> = new Map();
  refundTickets: Map<string, RefundTicketRecord> = new Map();
  auditLog: Map<string, AuditLogRecord> = new Map();
  storage: Map<string, StorageObject> = new Map();

  constructor() {
    this.seedDefaults();
  }

  seedDefaults() {
    // Seed Style Packs
    const packs: StylePackRecord[] = [
      {
        id: "gulf_gold_classic",
        name_en: "Gulf Gold Classic",
        name_ar: "كلاسيك الذهب الخليجي",
        description_en: "Warm 21K/22K gold staged on travertine plinth.",
        description_ar: "عرض ذهب 21 و 22 قيراط على أحجار الترافرتين ورخام الحجر الرملي.",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "bridal_set",
        name_en: "Bridal Set Grand Staging",
        name_ar: "أطقم العرائس الفاخرة",
        description_en: "Coordinated multi-piece staging on sculpted velvet.",
        description_ar: "تنسيق متكامل للأطقم الملكية.",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "heritage_filigree",
        name_en: "Heritage Filigree & Jaali",
        name_ar: "تراث الصياغة والنقش الخليجي",
        description_en: "Macro-detail lighting highlighting intricate Gulf jaali.",
        description_ar: "إضاءة ماكرو تبرز دقة النقش التراثي.",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "diamond_minimal",
        name_en: "Diamond Minimal High-Key",
        name_ar: "الألماس العصري النقي",
        description_en: "Crisp architectural white studio lighting.",
        description_ar: "إضاءة استوديو بيضاء عصرية مخصصة للألماس.",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "occasion_ramadan_eid",
        name_en: "Occasion: Ramadan & Eid",
        name_ar: "أجواء رمضان والأعياد",
        description_en: "Subtle lantern-shadow light patterns.",
        description_ar: "إضاءة ظلال الفوانيس الناعمة وأجواء مسائية ساحرة.",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "occasion_national_day_dsf",
        name_en: "Occasion: National Day & DSF",
        name_ar: "اليوم الوطني ومهرجان دبي للتسوق",
        description_en: "Festive luxury campaign backdrops.",
        description_ar: "خلفيات احتفالية فاخرة لليوم الوطني ومهرجان دبي للتسوق.",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "social_story",
        name_en: "Social Story & WhatsApp",
        name_ar: "قصص انستغرام وكتالوج واتساب",
        description_en: "Pre-composed 9:16 and 1:1 layouts with clean safe zones.",
        description_ar: "تكوينات مدروسة بنسب 9:16 و 1:1 مع مساحات أمان خالية للشارات.",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    packs.forEach((p) => this.stylePacks.set(p.id, p));

    // Seed Credit Packages
    const creditPkgs: CreditPackageRecord[] = [
      {
        id: "pkg_starter_50",
        name_en: "Starter Pack (50 Credits)",
        name_ar: "الباقة الأساسية (50 رصيد)",
        credits: 50,
        price_aed_inclusive: 199.0,
        price_aed_exclusive: 189.52,
        vat_amount_aed: 9.48,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "pkg_pro_200",
        name_en: "Pro Jeweller (200 Credits)",
        name_ar: "باقة المحترفين (200 رصيد)",
        credits: 200,
        price_aed_inclusive: 599.0,
        price_aed_exclusive: 570.48,
        vat_amount_aed: 28.52,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "pkg_souk_1000",
        name_en: "Souk Enterprise (1000 Credits)",
        name_ar: "باقة كبار تجار الذهب (1000 رصيد)",
        credits: 1000,
        price_aed_inclusive: 1999.0,
        price_aed_exclusive: 1903.81,
        vat_amount_aed: 95.19,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    creditPkgs.forEach((cp) => this.creditPackages.set(cp.id, cp));
  }

  // --- RLS ENFORCED METHODS ---

  // Profiles
  async getProfile(ctx: AuthContext, id: string): Promise<ProfileRecord | null> {
    const profile = this.profiles.get(id);
    if (!profile) return null;
    if (ctx.role === "admin" || ctx.role === "service_role" || ctx.userId === id) {
      return profile;
    }
    throw new Error("RLS Violation: Cannot view profile belonging to another user");
  }

  async upsertProfile(ctx: AuthContext, profile: ProfileRecord): Promise<ProfileRecord> {
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== profile.id) {
      throw new Error("RLS Violation: Cannot insert/update profile for another user");
    }
    this.profiles.set(profile.id, profile);
    return profile;
  }

  // Shops
  async getShop(ctx: AuthContext, shopId: string): Promise<ShopRecord | null> {
    const shop = this.shops.get(shopId);
    if (!shop) return null;
    if (ctx.role === "admin" || ctx.role === "service_role" || ctx.userId === shop.owner_id) {
      return shop;
    }
    throw new Error("RLS Violation: Cannot view shop belonging to another owner");
  }

  async insertShop(ctx: AuthContext, shop: ShopRecord): Promise<ShopRecord> {
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== shop.owner_id) {
      throw new Error("RLS Violation: Cannot create shop for another owner");
    }
    this.shops.set(shop.id, shop);
    return shop;
  }

  async deleteShop(ctx: AuthContext, shopId: string): Promise<boolean> {
    const shop = this.shops.get(shopId);
    if (!shop) return false;
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== shop.owner_id) {
      throw new Error("RLS Violation: Cannot delete shop belonging to another owner");
    }
    return this.shops.delete(shopId);
  }

  // Credit Ledger (Append-Only)
  async getCreditBalance(ctx: AuthContext, userId: string): Promise<number> {
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== userId) {
      throw new Error("RLS Violation: Cannot view credit balance of another user");
    }
    let balance = 0;
    for (const entry of this.creditLedger.values()) {
      if (entry.user_id === userId) {
        balance += entry.delta;
      }
    }
    return balance;
  }

  async appendLedgerEntry(ctx: AuthContext, entry: CreditLedgerRecord): Promise<CreditLedgerRecord> {
    if (ctx.role !== "admin" && ctx.role !== "service_role") {
      throw new Error("RLS Violation: Normal sellers cannot directly insert credit ledger records");
    }
    if (this.creditLedger.has(entry.idempotency_key)) {
      throw new Error(`Idempotency violation: Key ${entry.idempotency_key} has already been processed`);
    }
    this.creditLedger.set(entry.idempotency_key, entry);
    return entry;
  }

  // Image Jobs
  async getImageJob(ctx: AuthContext, jobId: string): Promise<ImageJobRecord | null> {
    const job = this.imageJobs.get(jobId);
    if (!job) return null;
    if (ctx.role === "admin" || ctx.role === "service_role" || ctx.userId === job.user_id) {
      return job;
    }
    throw new Error("RLS Violation: Cannot access image job belonging to another user");
  }

  async insertImageJob(ctx: AuthContext, job: ImageJobRecord): Promise<ImageJobRecord> {
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== job.user_id) {
      throw new Error("RLS Violation: Cannot create image job for another user");
    }
    this.imageJobs.set(job.id, job);
    return job;
  }

  async updateImageJobStatus(
    ctx: AuthContext,
    jobId: string,
    status: ImageJobRecord["status"],
    extra?: Partial<ImageJobRecord>
  ): Promise<ImageJobRecord> {
    const job = this.imageJobs.get(jobId);
    if (!job) throw new Error("Job not found");
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== job.user_id) {
      throw new Error("RLS Violation: Cannot update image job belonging to another user");
    }
    const updated = {
      ...job,
      status,
      ...extra,
      updated_at: new Date().toISOString(),
    };
    this.imageJobs.set(jobId, updated);
    return updated;
  }

  // Job Outputs
  async getJobOutputs(ctx: AuthContext, jobId: string): Promise<JobOutputRecord[]> {
    const job = this.imageJobs.get(jobId);
    if (!job) return [];
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== job.user_id) {
      throw new Error("RLS Violation: Cannot view outputs of job belonging to another user");
    }
    const outputs: JobOutputRecord[] = [];
    for (const out of this.jobOutputs.values()) {
      if (out.job_id === jobId) {
        outputs.push(out);
      }
    }
    return outputs;
  }

  // Storage Vault (Private Bucket)
  async writeStorageObject(
    ctx: AuthContext,
    path: string,
    data: Buffer,
    mimeType: string
  ): Promise<{ path: string; signedUrl: string }> {
    // Path convention: vault/{userId}/...
    const parts = path.split("/");
    const pathOwner = parts[1];
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== pathOwner) {
      throw new Error("Storage RLS Violation: Cannot write to another user's private storage path");
    }
    this.storage.set(path, {
      path,
      ownerId: pathOwner,
      data,
      mimeType,
      createdAt: new Date().toISOString(),
    });
    // Return simulated short-lived signed URL (15 min)
    const token = Buffer.from(`${path}:${Date.now() + 15 * 60 * 1000}`).toString("base64");
    return {
      path,
      signedUrl: `http://localhost:3000/api/storage/signed?path=${encodeURIComponent(path)}&token=${token}`,
    };
  }

  async readStorageObject(ctx: AuthContext, path: string): Promise<Buffer> {
    const parts = path.split("/");
    const pathOwner = parts[1];
    if (ctx.role !== "admin" && ctx.role !== "service_role" && ctx.userId !== pathOwner) {
      throw new Error("Storage RLS Violation: Cannot read another user's private storage object");
    }
    const obj = this.storage.get(path);
    if (!obj) {
      throw new Error("Storage object not found");
    }
    return obj.data;
  }
}

// Global Singleton Instance for test and dev runs
export const mockDb = new MockDatabase();
