import { describe, it, expect } from "vitest";
import { calculateBenchmarkCost, PROVIDER_PRICING, USD_TO_AED_RATE } from "../src/lib/providers/cost-calculator";
import { runBenchmark } from "./benchmark";
import { FluxProviderAdapter } from "../src/lib/providers/flux-adapter";
import { GptProviderAdapter } from "../src/lib/providers/gpt-adapter";
import { GeminiProviderAdapter } from "../src/lib/providers/gemini-adapter";
import { BriaProviderAdapter } from "../src/lib/providers/bria-adapter";
import sharp from "sharp";

describe("Phase 3: Model Benchmark Harness & Cost Calculator (Dry-Run)", () => {
  it("computes accurate AED cost estimates using UAE Central Bank peg (3.6725)", () => {
    expect(USD_TO_AED_RATE).toBe(3.6725);

    // 35 combinations (7 style packs x 5 personas)
    const fluxCost = calculateBenchmarkCost(35, "flux");
    expect(fluxCost.totalImages).toBe(105);
    expect(fluxCost.totalCostUsd).toBe(4.2);
    expect(fluxCost.totalCostAed).toBe(15.42);

    const briaCost = calculateBenchmarkCost(35, "bria");
    expect(briaCost.totalCostUsd).toBe(1.89);
    expect(briaCost.totalCostAed).toBe(6.94);
  });

  it("blocks live paid calls without explicit credentials/flag", async () => {
    const flux = new FluxProviderAdapter("fake-api-key");
    const gpt = new GptProviderAdapter("fake-api-key");
    const gemini = new GeminiProviderAdapter("fake-api-key");
    const bria = new BriaProviderAdapter("fake-api-key");

    const sampleBuffer = await sharp({
      create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 215, b: 0 } },
    })
      .jpeg()
      .toBuffer();

    const dummyInput = {
      jobId: "test-001",
      userId: "user-1",
      imageBuffer: sampleBuffer,
      mimeType: "image/jpeg",
      pieceType: "ring" as const,
      metalKarat: "22K_yellow" as const,
      stylePackId: "gulf_gold_classic" as const,
      modelPersona: "none_product_only" as const,
      specBadgeEnabled: false,
    };

    // Calling with dryRun=false MUST throw error blocking unauthorized charges
    await expect(flux.generate(dummyInput, false)).rejects.toThrow(/Owner approval required/);
    await expect(gpt.generate(dummyInput, false)).rejects.toThrow(/Owner approval required/);
    await expect(gemini.generate(dummyInput, false)).rejects.toThrow(/Owner approval required/);
    await expect(bria.generate(dummyInput, false)).rejects.toThrow(/Owner approval required/);
  });

  it("executes full benchmark dry-run suite cleanly with zero paid calls", async () => {
    const result = await runBenchmark(true);
    expect(result.success).toBe(true);
    expect(result.totalCombinations).toBe(35);
    expect(result.providersCount).toBe(4);
  });
});
