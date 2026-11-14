import sharp from "sharp";
import { StylePackId, ModelPersona, GenerationInput } from "../src/types";
import { FluxProviderAdapter } from "../src/lib/providers/flux-adapter";
import { GptProviderAdapter } from "../src/lib/providers/gpt-adapter";
import { GeminiProviderAdapter } from "../src/lib/providers/gemini-adapter";
import { BriaProviderAdapter } from "../src/lib/providers/bria-adapter";
import { PROVIDER_PRICING, calculateBenchmarkCost, USD_TO_AED_RATE } from "../src/lib/providers/cost-calculator";

const ALL_STYLE_PACKS: StylePackId[] = [
  "gulf_gold_classic",
  "bridal_set",
  "heritage_filigree",
  "diamond_minimal",
  "occasion_ramadan_eid",
  "occasion_national_day_dsf",
  "social_story",
];

const ALL_PERSONAS: ModelPersona[] = [
  "none_product_only",
  "khaleeji_modest",
  "south_asian_festive",
  "levantine_modern",
  "luxury_minimal",
];

export async function runBenchmark(dryRun = true) {
  console.log("==================================================================");
  console.log("  JEWELLERAY UAE — MODEL BENCHMARK & COST ESTIMATION HARNESS");
  console.log("==================================================================");
  console.log(`Exchange Rate: 1 USD = ${USD_TO_AED_RATE} AED (UAE Central Bank Peg)`);
  console.log(`Total Style Packs: ${ALL_STYLE_PACKS.length}`);
  console.log(`Total Buyer Personas: ${ALL_PERSONAS.length}`);
  console.log(`Total Permutations: ${ALL_STYLE_PACKS.length * ALL_PERSONAS.length} combinations per provider`);
  console.log(`Total Output Images: ${ALL_STYLE_PACKS.length * ALL_PERSONAS.length * 3} images (1:1, 4:5, 9:16)`);
  console.log(`Execution Mode: ${dryRun ? "DRY-RUN / OFFLINE (Zero Paid Calls)" : "LIVE"}`);
  console.log("------------------------------------------------------------------\n");

  // Create sample 21K gold test piece
  const testPieceBuffer = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 4,
      background: { r: 218, g: 165, b: 32, alpha: 1 },
    },
  })
    .jpeg()
    .toBuffer();

  const providers = [
    { key: "flux" as const, adapter: new FluxProviderAdapter() },
    { key: "gpt" as const, adapter: new GptProviderAdapter() },
    { key: "gemini" as const, adapter: new GeminiProviderAdapter() },
    { key: "bria" as const, adapter: new BriaProviderAdapter() },
  ];

  const totalCombinations = ALL_STYLE_PACKS.length * ALL_PERSONAS.length;

  console.log("ITEMIZED COST ESTIMATE PER PROVIDER (35 Combinations x 3 Aspect Ratios = 105 Images):\n");
  console.log("| Provider / Model Target | Cost/Set (AED) | Total Benchmark Cost (AED) | Best Fit Recommendation |");
  console.log("|---|---|---|---|");

  for (const p of providers) {
    const cost = calculateBenchmarkCost(totalCombinations, p.key);
    const pricing = PROVIDER_PRICING[p.key];
    console.log(
      `| ${pricing.modelName} | ${cost.perCatalogSetAed.toFixed(2)} AED | ${cost.totalCostAed.toFixed(2)} AED ($${cost.totalCostUsd.toFixed(2)}) | ${pricing.notes.slice(0, 45)}... |`
    );
  }

  console.log("\n------------------------------------------------------------------");
  console.log("Running offline dry-run sample pass across first matrix slice...");

  // Run dry run test sample with first provider across sample style pack
  const sampleInput: GenerationInput = {
    jobId: "benchmark-sample-01",
    userId: "benchmark-user",
    imageBuffer: testPieceBuffer,
    mimeType: "image/jpeg",
    pieceType: "necklace",
    metalKarat: "22K_yellow",
    stylePackId: "gulf_gold_classic",
    modelPersona: "khaleeji_modest",
    specBadgeEnabled: true,
    specBadgeData: {
      karat_label: "22K Gold",
      weight_grams: 14.2,
      price_aed: 4850,
    },
  };

  const sampleResult = await providers[0].adapter.generate(sampleInput, dryRun);
  console.log(`Dry-run sample completed successfully in ${sampleResult.metadata.durationMs}ms`);
  console.log(`Generated ${sampleResult.outputs.length} aspect ratios:`);
  for (const out of sampleResult.outputs) {
    console.log(`  - ${out.aspectRatio} -> ${out.width}x${out.height} (${(out.buffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log("\n==================================================================");
  console.log("BENCHMARK DRY-RUN COMPLETE. ZERO PAID API CALLS EXECUTED.");
  console.log("==================================================================");

  return {
    success: true,
    totalCombinations,
    providersCount: providers.length,
  };
}

if (require.main === module) {
  runBenchmark(true).catch((err) => {
    console.error("Benchmark failed:", err);
    process.exit(1);
  });
}
