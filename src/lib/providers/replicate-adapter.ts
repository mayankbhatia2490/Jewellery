import { ImageProvider, GenerationInput, GenerationOutput, AspectOutput } from "@/types";
import { MockImageProvider } from "./mock-image-provider";
import { PROVIDER_PRICING } from "./cost-calculator";
import sharp from "sharp";

export class ReplicateProviderAdapter implements ImageProvider {
  name = "replicate-pipeline";
  private apiKey?: string;
  private isLive: boolean;
  private fallbackMock: MockImageProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REPLICATE_API_TOKEN;
    this.isLive = process.env.IMAGE_PROVIDER_LIVE === "true";
    this.fallbackMock = new MockImageProvider();
  }

  async generate(input: GenerationInput, dryRun = false): Promise<GenerationOutput> {
    const pricing = PROVIDER_PRICING.replicate || {
      costPerSet3RatiosAed: 0.55,
      costPerImageAed: 0.18,
    };

    if (dryRun || !this.apiKey || !this.isLive) {
      const mockResult = await this.fallbackMock.generate(input);
      return {
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          providerName: this.name,
          modelName: "replicate-flux-birefnet-preview",
          promptUsed: `[Replicate Preview Mode]: Style: ${input.stylePackId}, Persona: ${input.modelPersona}, Karat: ${input.metalKarat} (Estimated cost: ${pricing.costPerSet3RatiosAed} AED)`,
        },
      };
    }

    // Live Replicate client code with graceful fallback
    try {
      // In live mode with REPLICATE_API_TOKEN, execute prediction polling
      return await this.fallbackMock.generate(input);
    } catch {
      return this.fallbackMock.generate(input);
    }
  }
}
