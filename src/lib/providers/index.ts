import { ImageProvider } from "@/types";
import { MockImageProvider } from "./mock-image-provider";
import { FluxProviderAdapter } from "./flux-adapter";
import { GeminiProviderAdapter } from "./gemini-adapter";
import { GptProviderAdapter } from "./gpt-adapter";
import { BriaProviderAdapter } from "./bria-adapter";
import { FalProviderAdapter } from "./fal-adapter";
import { ReplicateProviderAdapter } from "./replicate-adapter";

export { MockImageProvider } from "./mock-image-provider";
export { FluxProviderAdapter } from "./flux-adapter";
export { GeminiProviderAdapter } from "./gemini-adapter";
export { GptProviderAdapter } from "./gpt-adapter";
export { BriaProviderAdapter } from "./bria-adapter";
export { FalProviderAdapter } from "./fal-adapter";
export { ReplicateProviderAdapter } from "./replicate-adapter";
export * from "./cost-calculator";

/**
 * Factory function to retrieve the configured ImageProvider instance
 * based on process.env.IMAGE_PROVIDER or an explicit name parameter.
 * Defaults to MockImageProvider (zero paid calls, offline sharp compositor).
 */
export function getImageProvider(name?: string): ImageProvider {
  const providerName = (name || process.env.IMAGE_PROVIDER || "mock").toLowerCase().trim();

  switch (providerName) {
    case "fal":
    case "fal-ai":
      return new FalProviderAdapter();

    case "replicate":
      return new ReplicateProviderAdapter();

    case "gemini":
    case "gemini-3-pro":
    case "imagen":
      return new GeminiProviderAdapter();

    case "flux":
    case "flux-pro":
    case "flux-kontext":
      return new FluxProviderAdapter();

    case "bria":
    case "bria-rmbg":
      return new BriaProviderAdapter();

    case "gpt":
    case "openai":
    case "sunburst":
      return new GptProviderAdapter();

    case "mock":
    default:
      return new MockImageProvider();
  }
}
