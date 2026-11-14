import { ImageProvider, GenerationInput, GenerationOutput } from "@/types";
import { MockImageProvider } from "./mock-image-provider";
import { PROVIDER_PRICING } from "./cost-calculator";

export class GptProviderAdapter implements ImageProvider {
  name = "gpt-image-2.5-sunburst";
  private apiKey?: string;
  private fallbackMock: MockImageProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.fallbackMock = new MockImageProvider();
  }

  async generate(input: GenerationInput, dryRun = true): Promise<GenerationOutput> {
    const pricing = PROVIDER_PRICING.gpt;

    if (dryRun || !this.apiKey) {
      const mockResult = await this.fallbackMock.generate(input);
      return {
        ...mockResult,
        metadata: {
          ...mockResult.metadata,
          providerName: this.name,
          modelName: "gpt-image-2.5-sunburst-hd",
          promptUsed: `[GPT Sunburst Prompt]: Studio jewellery editorial for UAE luxury catalog, ${input.metalKarat} ${input.pieceType}, style pack ${input.stylePackId}, persona: ${input.modelPersona}. Estimated cost: ${pricing.costPerSet3RatiosAed} AED.`,
        },
      };
    }

    throw new Error("Live paid API call blocked: Owner approval required prior to live OpenAI image generation.");
  }
}
