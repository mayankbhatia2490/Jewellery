import { ImageProvider, GenerationInput, GenerationOutput } from "@/types";
import { MockImageProvider } from "./mock-image-provider";
import { PROVIDER_PRICING } from "./cost-calculator";

export class GeminiProviderAdapter implements ImageProvider {
  name = "gemini-3-pro-image";
  private apiKey?: string;
  private fallbackMock: MockImageProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.fallbackMock = new MockImageProvider();
  }

  async generate(input: GenerationInput, dryRun = true): Promise<GenerationOutput> {
    const pricing = PROVIDER_PRICING.gemini;

    if (dryRun || !this.apiKey) {
      const mockResult = await this.fallbackMock.generate(input);
      return {
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          providerName: this.name,
          modelName: "gemini-3-pro-image-v1",
          promptUsed: `[Gemini 3 Pro Image Prompt]: Hyper-realistic luxury commercial studio lighting for ${input.metalKarat} ${input.pieceType}, backdrop ${input.stylePackId}, model framing ${input.modelPersona}. Estimated cost: ${pricing.costPerSet3RatiosAed} AED.`,
        },
      };
    }

    throw new Error("Live paid API call blocked: Owner approval required prior to live Gemini image generation.");
  }
}
