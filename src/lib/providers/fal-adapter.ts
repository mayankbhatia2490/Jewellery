import { ImageProvider, GenerationInput, GenerationOutput, AspectOutput } from "@/types";
import { MockImageProvider } from "./mock-image-provider";
import { PROVIDER_PRICING } from "./cost-calculator";
import sharp from "sharp";

export class FalProviderAdapter implements ImageProvider {
  name = "fal-ai-pipeline";
  private apiKey?: string;
  private isLive: boolean;
  private fallbackMock: MockImageProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FAL_KEY;
    this.isLive = process.env.IMAGE_PROVIDER_LIVE === "true";
    this.fallbackMock = new MockImageProvider();
  }

  /**
   * Helper to construct cultural Gulf Gold & jewellery scene prompts
   */
  private buildPrompt(input: GenerationInput): string {
    const karatDescriptions: Record<string, string> = {
      "22K_yellow": "22-karat deep saffron Gulf yellow gold, rich warm golden luster, intricate Emirati filigree",
      "21K_yellow": "21-karat solid warm yellow gold, authentic Bahraini laser-carved jaali star motifs",
      "18K_yellow": "18-karat modern yellow gold, clean polished luster",
      "18K_white": "18-karat white gold, platinum prongs, optical diamond dispersion caustics and sharp brilliance",
      "18K_rose": "18-karat warm rose gold, subtle copper blush undertones",
      "platinum_silver": "950 platinum with cool mirror finish and crisp specular glints",
    };

    const styleDescriptions: Record<string, string> = {
      gulf_gold_classic: "resting elegantly on a warm, porous organic travertine stone plinth, soft directional studio lighting, subtle contact shadows with ambient occlusion, creamy beige limewash bokeh",
      bridal_set: "displayed on a sculpted royal emerald green crushed velvet jewellery bust, directional softbox highlights, high-end bridal luxury showcase",
      heritage_filigree: "macro 90mm f/4 studio shot on a natural sand-colored sandstone block, sharp focus on delicate granulation and micro-bead fretwork",
      diamond_minimal: "minimalist architectural honed white limestone plinth, pristine caustics, high-key clean modern luxury aesthetic",
      occasion_ramadan_eid: "royal midnight navy velvet pedestal with soft golden lantern lattice shadow play in the blurred background",
      occasion_national_day_dsf: "regal black marble plinth with subtle gold veins, dramatic rim lighting",
      social_story: "vertical composition with ample top and bottom negative space for price tags and catalog typography",
    };

    const metalDesc = karatDescriptions[input.metalKarat] || "fine fine jewellery";
    const styleDesc = styleDescriptions[input.stylePackId] || "luxury commercial jewelry studio";

    return `Commercial catalog jewelry photography of a ${metalDesc} ${input.pieceType}, ${styleDesc}. Masterclass 85mm macro lens, realistic contact shadows, razor-sharp metallic edges, commercial luxury e-commerce catalog aesthetic.`;
  }

  async generate(input: GenerationInput, dryRun = false): Promise<GenerationOutput> {
    const pricing = PROVIDER_PRICING.fal || {
      costPerSet3RatiosAed: 0.44,
      costPerImageAed: 0.15,
    };

    // Safety Gate: If dryRun requested, or no API key, or live switch is false, run offline fallback
    if (dryRun || !this.apiKey || !this.isLive) {
      const mockResult = await this.fallbackMock.generate(input);
      return {
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          providerName: this.name,
          modelName: "fal-birefnet-flux-iclight-preview",
          durationMs: mockResult.metadata.durationMs,
          promptUsed: `[Fal.ai Preview Mode]: ${this.buildPrompt(input)} (Estimated live cost: ${pricing.costPerSet3RatiosAed} AED)`,
        },
      };
    }

    // =========================================================================
    // LIVE INFERENCE PIPELINE (When FAL_KEY is supplied & IMAGE_PROVIDER_LIVE=true)
    // =========================================================================
    const startTime = Date.now();
    const prompt = this.buildPrompt(input);
    const base64Image = `data:${input.mimeType || "image/webp"};base64,${input.imageBuffer.toString("base64")}`;

    try {
      // 1. Stage 1: BiRefNet Segmentation (Sub-pixel Alpha Matting)
      const segRes = await fetch("https://fal.run/fal-ai/birefnet", {
        method: "POST",
        headers: {
          Authorization: `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: base64Image,
          operating_resolution: "1024x1024",
        }),
      });

      if (!segRes.ok) {
        throw new Error(`Fal.ai BiRefNet segmentation failed with HTTP ${segRes.status}`);
      }

      const segData = (await segRes.json()) as { image?: { url: string } };
      const segmentedImageUrl = segData.image?.url || base64Image;

      // 2. Stage 2: FLUX Inpainting / Relighting (Travertine, Velvet, or Concrete)
      const inpaintRes = await fetch("https://fal.run/fal-ai/flux/dev/inpainting", {
        method: "POST",
        headers: {
          Authorization: `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: segmentedImageUrl,
          prompt,
          strength: 0.85,
          num_inference_steps: 28,
          guidance_scale: 3.5,
        }),
      });

      if (!inpaintRes.ok) {
        throw new Error(`Fal.ai FLUX inpainting failed with HTTP ${inpaintRes.status}`);
      }

      const inpaintData = (await inpaintRes.json()) as { images?: { url: string }[] };
      const renderedImageUrl = inpaintData.images?.[0]?.url;

      if (!renderedImageUrl) {
        throw new Error("Fal.ai returned empty image array");
      }

      // 3. Download the generated master buffer
      const renderedFetch = await fetch(renderedImageUrl);
      const masterBuffer = Buffer.from(await renderedFetch.arrayBuffer());

      // 4. Multi-Ratio Formatter (1:1, 4:5, 9:16) with optional Spec Badge
      const targets: { ratio: "1:1" | "4:5" | "9:16"; width: number; height: number }[] = [
        { ratio: "1:1", width: 1080, height: 1080 },
        { ratio: "4:5", width: 1080, height: 1350 },
        { ratio: "9:16", width: 1080, height: 1920 },
      ];

      const outputs: AspectOutput[] = [];

      for (const target of targets) {
        let pipeline = sharp(masterBuffer).resize(target.width, target.height, {
          fit: "cover",
          position: "center",
        });

        // If UAE spec badge enabled, overlay corner badge
        if (input.specBadgeEnabled && input.specBadgeData) {
          const karatDisplay = (input.specBadgeData.karat_label || input.metalKarat.replace("_", " ")).toString().toUpperCase();
          const weightDisplay = input.specBadgeData.weight_grams ? `${input.specBadgeData.weight_grams}g` : "";
          const priceDisplay = input.specBadgeData.price_aed ? `AED ${Number(input.specBadgeData.price_aed).toLocaleString()}` : "";
          const skuDisplay = input.specBadgeData.sku ? input.specBadgeData.sku.toString() : "";

          const badgeSvg = Buffer.from(`
            <svg width="360" height="96" viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fde047" stop-opacity="0.8"/>
                  <stop offset="50%" stop-color="#ca8a04" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#854d0e" stop-opacity="0.9"/>
                </linearGradient>
              </defs>
              <rect width="360" height="96" rx="16" fill="#090d16" fill-opacity="0.92" stroke="url(#badgeBorder)" stroke-width="1.5"/>
              <text x="24" y="34" font-family="-apple-system, sans-serif" font-size="15" font-weight="800" fill="#facc15" letter-spacing="0.5">
                ${karatDisplay}
              </text>
              <text x="24" y="62" font-family="-apple-system, sans-serif" font-size="13" font-weight="500" fill="#cbd5e1">
                ${weightDisplay ? `Weight: ${weightDisplay}` : ""} ${skuDisplay ? `• ${skuDisplay}` : ""}
              </text>
              <text x="336" y="44" text-anchor="end" font-family="-apple-system, sans-serif" font-size="18" font-weight="900" fill="#ffffff">
                ${priceDisplay}
              </text>
              <text x="336" y="64" text-anchor="end" font-family="-apple-system, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">
                5% UAE VAT Inc.
              </text>
            </svg>
          `);

          pipeline = pipeline.composite([
            {
              input: badgeSvg,
              top: target.height - 130,
              left: 40,
            },
          ]);
        }

        const outBuffer = await pipeline.webp({ quality: 95 }).toBuffer();

        outputs.push({
          aspectRatio: target.ratio,
          width: target.width,
          height: target.height,
          buffer: outBuffer,
          mimeType: "image/webp",
        });
      }

      return {
        jobId: input.jobId,
        outputs,
        metadata: {
          providerName: this.name,
          modelName: "fal-birefnet-flux-dev",
          durationMs: Date.now() - startTime,
          promptUsed: prompt,
        },
      };
    } catch (err: unknown) {
      console.warn(`[FalProviderAdapter] Live inference error: ${err instanceof Error ? err.message : String(err)}. Falling back to offline studio compositor.`);
      // Graceful fallback to offline compositor to ensure job never hard-crashes
      return this.fallbackMock.generate(input);
    }
  }
}
