export type PieceType =
  | "ring"
  | "necklace"
  | "earrings"
  | "bangle_bracelet"
  | "bridal_set"
  | "pendant";

export type MetalKarat =
  | "22K_yellow"
  | "21K_yellow"
  | "18K_yellow"
  | "18K_white"
  | "18K_rose"
  | "platinum_silver";

export type StylePackId =
  | "gulf_gold_classic"
  | "bridal_set"
  | "heritage_filigree"
  | "diamond_minimal"
  | "occasion_ramadan_eid"
  | "occasion_national_day_dsf"
  | "social_story";

export type ModelPersona =
  | "none_product_only"
  | "khaleeji_modest"
  | "south_asian_festive"
  | "levantine_modern"
  | "luxury_minimal";

export type AspectRatio = "1:1" | "4:5" | "9:16";

export type JobStatus =
  | "queued"
  | "processing"
  | "checking"
  | "done"
  | "failed"
  | "needs_review";

export type LedgerReason = "grant" | "purchase" | "spend" | "refund" | "bonus";

export interface SpecBadgeData {
  karat_label: string;
  weight_grams?: number;
  sku?: string;
  price_aed?: number;
}

export interface GenerationInput {
  jobId: string;
  userId: string;
  imageBuffer: Buffer;
  mimeType: string;
  pieceType: PieceType;
  metalKarat: MetalKarat;
  stylePackId: StylePackId;
  modelPersona: ModelPersona;
  specBadgeEnabled: boolean;
  specBadgeData?: SpecBadgeData;
}

export interface AspectOutput {
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  buffer: Buffer;
  mimeType: string;
}

export interface GenerationOutput {
  jobId: string;
  outputs: AspectOutput[];
  metadata: {
    providerName: string;
    modelName: string;
    durationMs: number;
    promptUsed: string;
  };
}

export interface FidelityCheckResult {
  status: "pass" | "warn" | "fail";
  iouScore: number;
  colorDriftDelta: number;
  reasons: string[];
}

export interface ImageProvider {
  name: string;
  generate(input: GenerationInput): Promise<GenerationOutput>;
}

export interface PaymentProvider {
  name: string;
  createCheckoutSession(params: {
    userId: string;
    packageId: string;
    amountAedInclusive: number;
    customerPhone: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }>;
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
}

export interface MessagingProvider {
  name: string;
  sendOtp(phone: string, code: string): Promise<{ success: boolean; messageId: string }>;
  sendJobNotification(phone: string, status: JobStatus, jobId: string): Promise<{ success: boolean }>;
}
