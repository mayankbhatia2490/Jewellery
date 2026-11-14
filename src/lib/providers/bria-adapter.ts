import { ImageProvider, GenerationInput, GenerationOutput } from "@/types";
import { MockImageProvider } from "./mock-image-provider";
import { PROVIDER_PRICING } from "./cost-calculator";

export class BriaProviderAdapter implements ImageProvider {
  name = "bria-product-shot";
  private apiKey?: string;
  private fallbackMock: MockImageProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BRIA_API_KEY;
    this.fallbackMock = new MockImageProvider();
  }

  async generate(input: GenerationInput, dryRun = true): Promise<GenerationOutput> {
    const pricing = PROVIDER_PRICING.bria;

    if (dryRun || !this.apiKey) {
      const mockResult = await this.fallbackMock.generate(input);
      return {
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          providerName: this.name,
          modelName: "bria-rmbg-2.0-product-relight",
          promptUsed: `[Bria Product Shot]: Precision segmented foreground composited onto ${input.stylePackId} background with balanced rim light. Estimated cost: ${pricing.costPerSet3RatiosAed} AED.`,
        },
      };
    }

    throw new Error("Live paid API call blocked: Owner approval required prior to live Bria generation.");
  }
}
