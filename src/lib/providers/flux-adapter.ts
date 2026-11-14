import { ImageProvider, GenerationInput, GenerationOutput } from "@/types";
import { MockImageProvider } from "./mock-image-provider";
import { PROVIDER_PRICING } from "./cost-calculator";

export class FluxProviderAdapter implements ImageProvider {
  name = "flux-kontext-pro";
  private apiKey?: string;
  private fallbackMock: MockImageProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FLUX_API_KEY;
    this.fallbackMock = new MockImageProvider();
  }

  async generate(input: GenerationInput, dryRun = true): Promise<GenerationOutput> {
    const pricing = PROVIDER_PRICING.flux;

    if (dryRun || !this.apiKey) {
      const mockResult = await this.fallbackMock.generate(input);
      return {
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          providerName: this.name,
          modelName: "flux-2-pro-edit-preview",
          promptUsed: `[FLUX Prompt]: Luxury 21K/22K Gulf Gold jewellery piece (${input.pieceType}), staged in style ${input.stylePackId}, persona framing: ${input.modelPersona}. Estimated cost: ${pricing.costPerSet3RatiosAed} AED.`,
        },
      };
    }

    throw new Error("Live paid API call blocked: Owner approval required prior to live FLUX generation.");
  }
}
