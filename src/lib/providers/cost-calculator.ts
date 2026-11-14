/**
 * Cost Estimate Calculator in AED
 * Fixed UAE Central Bank Peg: 1 USD = 3.6725 AED
 * Computes exact per-image and per-set costs across all target AI image providers.
 */

export const USD_TO_AED_RATE = 3.6725;

export interface ModelPricing {
  providerId: string;
  providerName: string;
  modelName: string;
  costPerImageUsd: number;
  costPerSet3RatiosUsd: number;
  costPerImageAed: number;
  costPerSet3RatiosAed: number;
  notes: string;
}

export const PROVIDER_PRICING: Record<string, ModelPricing> = {
  flux: {
    providerId: "flux",
    providerName: "Black Forest Labs",
    modelName: "FLUX.2 Pro Edit / FLUX Kontext Pro",
    costPerImageUsd: 0.04,
    costPerSet3RatiosUsd: 0.12,
    costPerImageAed: Number((0.04 * USD_TO_AED_RATE).toFixed(4)),
    costPerSet3RatiosAed: Number((0.12 * USD_TO_AED_RATE).toFixed(4)),
    notes: "Best for on-model editorial drape and high-frequency filigree preservation",
  },
  gpt: {
    providerId: "gpt",
    providerName: "OpenAI",
    modelName: "GPT Image 2.5 Sunburst",
    costPerImageUsd: 0.08,
    costPerSet3RatiosUsd: 0.24,
    costPerImageAed: Number((0.08 * USD_TO_AED_RATE).toFixed(4)),
    costPerSet3RatiosAed: Number((0.24 * USD_TO_AED_RATE).toFixed(4)),
    notes: "High prompt fidelity, excellent for creative occasion backdrops",
  },
  gemini: {
    providerId: "gemini",
    providerName: "Google DeepMind",
    modelName: "Gemini 3 Pro Image / Imagen 3",
    costPerImageUsd: 0.03,
    costPerSet3RatiosUsd: 0.09,
    costPerImageAed: Number((0.03 * USD_TO_AED_RATE).toFixed(4)),
    costPerSet3RatiosAed: Number((0.09 * USD_TO_AED_RATE).toFixed(4)),
    notes: "Ultra-fast photorealism with balanced caustics and neutral stone lighting",
  },
  bria: {
    providerId: "bria",
    providerName: "Bria AI",
    modelName: "Bria Product Shot / RMBG 2.0",
    costPerImageUsd: 0.018,
    costPerSet3RatiosUsd: 0.054,
    costPerImageAed: Number((0.018 * USD_TO_AED_RATE).toFixed(4)),
    costPerSet3RatiosAed: Number((0.054 * USD_TO_AED_RATE).toFixed(4)),
    notes: "Specialized ecommerce segmentation and plinth staging with zero geometry drift",
  },
};

export function calculateBenchmarkCost(
  combinationsCount: number,
  providerKey: keyof typeof PROVIDER_PRICING
): {
  combinationsCount: number;
  totalImages: number;
  totalCostUsd: number;
  totalCostAed: number;
  perCatalogSetAed: number;
} {
  const pricing = PROVIDER_PRICING[providerKey];
  const totalImages = combinationsCount * 3; // 3 aspect ratios per run (1:1, 4:5, 9:16)
  const totalCostUsd = combinationsCount * pricing.costPerSet3RatiosUsd;
  const totalCostAed = Number((totalCostUsd * USD_TO_AED_RATE).toFixed(2));

  return {
    combinationsCount,
    totalImages,
    totalCostUsd: Number(totalCostUsd.toFixed(2)),
    totalCostAed,
    perCatalogSetAed: pricing.costPerSet3RatiosAed,
  };
}
