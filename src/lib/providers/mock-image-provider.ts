import sharp from "sharp";
import { ImageProvider, GenerationInput, GenerationOutput, AspectOutput } from "@/types";

export class MockImageProvider implements ImageProvider {
  name = "mock-provider";

  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const startTime = Date.now();

    const targets = [
      { aspectRatio: "1:1" as const, width: 1080, height: 1080 },
      { aspectRatio: "4:5" as const, width: 1080, height: 1350 },
      { aspectRatio: "9:16" as const, width: 1080, height: 1920 },
    ];

    const outputs: AspectOutput[] = [];

    // Base background colors based on style pack
    const backgroundTones: Record<string, { r: number; g: number; b: number }> = {
      gulf_gold_classic: { r: 243, g: 239, b: 234 }, // Travertine Sandstone
      bridal_set: { r: 6, g: 78, b: 59 }, // Dark Emerald Velvet
      heritage_filigree: { r: 76, g: 5, b: 25 }, // Deep Burgundy
      diamond_minimal: { r: 248, g: 250, b: 252 }, // High-Key Cool Slate
      occasion_ramadan_eid: { r: 15, g: 23, b: 42 }, // Midnight Navy
      occasion_national_day_dsf: { r: 20, g: 20, b: 22 }, // Luxury Obsidian
      social_story: { r: 250, g: 248, b: 245 }, // Ivory Silk
    };

    const bg = backgroundTones[input.stylePackId] || { r: 243, g: 239, b: 234 };

    for (const target of targets) {
      // Resize original input piece cleanly
      const pieceSize = Math.floor(Math.min(target.width, target.height) * 0.65);
      const resizedPiece = await sharp(input.imageBuffer)
        .resize(pieceSize, pieceSize, { fit: "inside" })
        .toBuffer();

      const pieceMetadata = await sharp(resizedPiece).metadata();
      const pieceW = pieceMetadata.width || pieceSize;
      const pieceH = pieceMetadata.height || pieceSize;

      // Position: centered horizontally, slightly offset vertically to allow safe zones
      const topOffset = Math.floor((target.height - pieceH) / 2);
      const leftOffset = Math.floor((target.width - pieceW) / 2);

      const compositeLayers: sharp.OverlayOptions[] = [
        {
          input: resizedPiece,
          top: topOffset,
          left: leftOffset,
        },
      ];

      // If spec badge is enabled, add corner spec overlay to layers
      if (input.specBadgeEnabled && input.specBadgeData) {
        const badgeSvg = Buffer.from(`
          <svg width="340" height="90" viewBox="0 0 340 90" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="90" rx="14" fill="#0f172a" fill-opacity="0.88" />
            <text x="20" y="32" font-family="sans-serif" font-size="16" font-weight="bold" fill="#DDB847">
              ${input.specBadgeData.karat_label || input.metalKarat.replace("_", " ")}
            </text>
            <text x="20" y="60" font-family="sans-serif" font-size="14" fill="#f8fafc">
              Weight: ${input.specBadgeData.weight_grams ? input.specBadgeData.weight_grams + "g" : "Custom"}
            </text>
            <text x="200" y="46" font-family="sans-serif" font-size="18" font-weight="black" fill="#ffffff">
              ${input.specBadgeData.price_aed ? "AED " + input.specBadgeData.price_aed : ""}
            </text>
          </svg>
        `);

        compositeLayers.push({
          input: badgeSvg,
          top: target.height - 130,
          left: 40,
        });
      }

      // Single composite call with all layers
      const outputBuffer = await sharp({
        create: {
          width: target.width,
          height: target.height,
          channels: 4,
          background: { r: bg.r, g: bg.g, b: bg.b, alpha: 1 },
        },
      })
        .composite(compositeLayers)
        .webp({ quality: 95 })
        .toBuffer();

      outputs.push({
        aspectRatio: target.aspectRatio,
        width: target.width,
        height: target.height,
        buffer: outputBuffer,
        mimeType: "image/webp",
      });
    }

    return {
      jobId: input.jobId,
      outputs,
      metadata: {
        providerName: this.name,
        modelName: "pipeline-a-mock-v1",
        durationMs: Date.now() - startTime,
        promptUsed: `Style: ${input.stylePackId}, Persona: ${input.modelPersona}, Karat: ${input.metalKarat}`,
      },
    };
  }
}
