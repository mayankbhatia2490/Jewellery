import sharp from "sharp";
import { ImageProvider, GenerationInput, GenerationOutput, AspectOutput } from "@/types";

export class MockImageProvider implements ImageProvider {
  name = "mock-provider";

  /**
   * Generates high-fidelity textured SVG backgrounds simulating genuine studio surfaces:
   * Travertine stone, emerald crushed velvet, imperial burgundy, architectural concrete plinth, etc.
   */
  private generateStudioBackdropSvg(
    width: number,
    height: number,
    stylePackId: string,
    metalKarat: string
  ): Buffer {
    let backdropSvg = "";

    switch (stylePackId) {
      case "bridal_set":
        // Sculpted Emerald Crushed Velvet
        backdropSvg = `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="velvetGlow" cx="50%" cy="38%" r="65%">
                <stop offset="0%" stop-color="#09654d"/>
                <stop offset="55%" stop-color="#043c2f"/>
                <stop offset="100%" stop-color="#021d17"/>
              </radialGradient>
              <linearGradient id="plinthEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0a7a5d" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#021d17" stop-opacity="0.9"/>
              </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#velvetGlow)"/>
            <!-- Sculpted Velvet Display Bust/Pedestal -->
            <ellipse cx="${width / 2}" cy="${height * 0.72}" rx="${width * 0.38}" ry="${height * 0.16}" fill="url(#plinthEdge)"/>
            <ellipse cx="${width / 2}" cy="${height * 0.70}" rx="${width * 0.35}" ry="${height * 0.13}" fill="#064e3b" stroke="#0d9488" stroke-width="1.5" stroke-opacity="0.3"/>
          </svg>
        `;
        break;

      case "heritage_filigree":
        // Deep Royal Burgundy Velvet with Majlis directional light
        backdropSvg = `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="burgundyGlow" cx="48%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#6b0f24"/>
                <stop offset="60%" stop-color="#400613"/>
                <stop offset="100%" stop-color="#1f0208"/>
              </radialGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#burgundyGlow)"/>
            <ellipse cx="${width / 2}" cy="${height * 0.72}" rx="${width * 0.36}" ry="${height * 0.14}" fill="#4a0417" stroke="#9f1239" stroke-width="1.5" stroke-opacity="0.4"/>
          </svg>
        `;
        break;

      case "diamond_minimal":
        // Clean Architectural High-Key Concrete / White Studio Plinth
        backdropSvg = `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="highKey" cx="50%" cy="35%" r="70%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="60%" stop-color="#f1f5f9"/>
                <stop offset="100%" stop-color="#e2e8f0"/>
              </radialGradient>
              <linearGradient id="prismCaustic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.3"/>
                <stop offset="50%" stop-color="#ffffff" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#e0e7ff" stop-opacity="0.2"/>
              </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#highKey)"/>
            <!-- Architectural Geometric Plinth -->
            <rect x="${width * 0.16}" y="${height * 0.58}" width="${width * 0.68}" height="${height * 0.32}" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
            <polygon points="${width * 0.16},${height * 0.58} ${width * 0.84},${height * 0.58} ${width * 0.78},${height * 0.52} ${width * 0.22},${height * 0.52}" fill="url(#prismCaustic)"/>
          </svg>
        `;
        break;

      case "occasion_ramadan_eid":
        // Midnight Navy with warm lantern geometric lattice shadow pattern
        backdropSvg = `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ramadanNight" cx="50%" cy="36%" r="65%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="55%" stop-color="#0f172a"/>
                <stop offset="100%" stop-color="#020617"/>
              </radialGradient>
              <radialGradient id="lanternGlow" cx="20%" cy="20%" r="40%">
                <stop offset="0%" stop-color="#fef08a" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#ramadanNight)"/>
            <!-- Warm lantern ambient glow -->
            <rect width="${width}" height="${height}" fill="url(#lanternGlow)"/>
            <!-- Geometric Arabesque Lattice Shadow Cast -->
            <g stroke="#f59e0b" stroke-width="0.75" stroke-opacity="0.12" fill="none">
              <polygon points="${width * 0.5},${height * 0.1} ${width * 0.6},${height * 0.2} ${width * 0.5},${height * 0.3} ${width * 0.4},${height * 0.2}"/>
              <polygon points="${width * 0.5},${height * 0.3} ${width * 0.6},${height * 0.4} ${width * 0.5},${height * 0.5} ${width * 0.4},${height * 0.4}"/>
              <polygon points="${width * 0.7},${height * 0.2} ${width * 0.8},${height * 0.3} ${width * 0.7},${height * 0.4} ${width * 0.6},${height * 0.3}"/>
              <polygon points="${width * 0.3},${height * 0.2} ${width * 0.4},${height * 0.3} ${width * 0.3},${height * 0.4} ${width * 0.2},${height * 0.3}"/>
            </g>
            <ellipse cx="${width / 2}" cy="${height * 0.72}" rx="${width * 0.38}" ry="${height * 0.14}" fill="#0f172a" stroke="#d97706" stroke-width="1.5" stroke-opacity="0.3"/>
          </svg>
        `;
        break;

      case "occasion_national_day_dsf":
        // Luxury Obsidian with gold leaf rim
        backdropSvg = `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="obsidianGlow" cx="50%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#262626"/>
                <stop offset="60%" stop-color="#171717"/>
                <stop offset="100%" stop-color="#0a0a0a"/>
              </radialGradient>
              <linearGradient id="goldLeafRim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#fde047"/>
                <stop offset="50%" stop-color="#ca8a04"/>
                <stop offset="100%" stop-color="#854d0e"/>
              </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#obsidianGlow)"/>
            <rect x="${width * 0.15}" y="${height * 0.60}" width="${width * 0.70}" height="${height * 0.28}" rx="14" fill="#141414" stroke="url(#goldLeafRim)" stroke-width="2"/>
          </svg>
        `;
        break;

      case "gulf_gold_classic":
      default:
        // Honed Travertine Plinth with warm directional Majlis studio illumination
        backdropSvg = `
          <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="majlisStoneLight" cx="45%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#FAF7F2"/>
                <stop offset="45%" stop-color="#F2ECE1"/>
                <stop offset="85%" stop-color="#E2D7C5"/>
                <stop offset="100%" stop-color="#CBBCA5"/>
              </radialGradient>
              <linearGradient id="travertineEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#B8A58D" stop-opacity="0.9"/>
              </linearGradient>
              <linearGradient id="plinthSide" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#E4D8C7"/>
                <stop offset="100%" stop-color="#BCAB95"/>
              </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#majlisStoneLight)"/>
            <!-- Natural honed Travertine Pedestal Slab -->
            <rect x="${width * 0.14}" y="${height * 0.58}" width="${width * 0.72}" height="${height * 0.28}" rx="16" fill="url(#plinthSide)" stroke="url(#travertineEdge)" stroke-width="2.5"/>
            <!-- Subtle natural stone striations -->
            <path d="M ${width * 0.16},${height * 0.64} Q ${width * 0.5},${height * 0.63} ${width * 0.84},${height * 0.66}" stroke="#A6947D" stroke-width="1.5" stroke-opacity="0.3" fill="none"/>
            <path d="M ${width * 0.20},${height * 0.72} Q ${width * 0.5},${height * 0.74} ${width * 0.80},${height * 0.71}" stroke="#A6947D" stroke-width="1.5" stroke-opacity="0.25" fill="none"/>
          </svg>
        `;
        break;
    }

    return Buffer.from(backdropSvg);
  }

  async generate(input: GenerationInput): Promise<GenerationOutput> {
    const startTime = Date.now();

    const targets = [
      { aspectRatio: "1:1" as const, width: 1080, height: 1080 },
      { aspectRatio: "4:5" as const, width: 1080, height: 1350 },
      { aspectRatio: "9:16" as const, width: 1080, height: 1920 },
    ];

    const outputs: AspectOutput[] = [];

    for (const target of targets) {
      // 1. Generate realistic textured studio background
      const backdropSvg = this.generateStudioBackdropSvg(
        target.width,
        target.height,
        input.stylePackId,
        input.metalKarat
      );

      // 2. Resize original piece cleanly
      // In 9:16 story, piece is centered vertically with safe zones
      const pieceSizeRatio = target.aspectRatio === "9:16" ? 0.55 : 0.65;
      const pieceTargetSize = Math.floor(Math.min(target.width, target.height) * pieceSizeRatio);

      const resizedPiece = await sharp(input.imageBuffer)
        .resize(pieceTargetSize, pieceTargetSize, { fit: "inside" })
        .toBuffer();

      const pieceMetadata = await sharp(resizedPiece).metadata();
      const pieceW = pieceMetadata.width || pieceTargetSize;
      const pieceH = pieceMetadata.height || pieceTargetSize;

      // Vertical positioning
      let topOffset = Math.floor((target.height - pieceH) / 2);
      if (target.aspectRatio === "9:16") {
        // Offset slightly down so upper third remains free for stories & price tags
        topOffset = Math.floor(target.height * 0.38);
      }
      const leftOffset = Math.floor((target.width - pieceW) / 2);

      // 3. Multi-layer realistic contact shadow beneath piece
      const shadowSvg = Buffer.from(`
        <svg width="${pieceW + 80}" height="${pieceH + 80}" viewBox="0 0 ${pieceW + 80} ${pieceH + 80}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="softStudioShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="16"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0.05   0 0 0 0 0.04   0 0 0 0 0.03  0 0 0 0.42 0"/>
            </filter>
          </defs>
          <ellipse cx="${(pieceW + 80) / 2}" cy="${pieceH + 40}" rx="${pieceW * 0.45}" ry="${pieceH * 0.12}" filter="url(#softStudioShadow)"/>
        </svg>
      `);

      const compositeLayers: sharp.OverlayOptions[] = [
        {
          input: shadowSvg,
          top: Math.max(0, topOffset - 40),
          left: Math.max(0, leftOffset - 40),
        },
        {
          input: resizedPiece,
          top: topOffset,
          left: leftOffset,
        },
      ];

      // 4. Optional Spec Badge Overlay (Luxury Gulf Typography)
      if (input.specBadgeEnabled && input.specBadgeData) {
        const karatDisplay = input.specBadgeData.karat_label || input.metalKarat.replace("_", " ");
        const weightDisplay = input.specBadgeData.weight_grams ? `${input.specBadgeData.weight_grams}g` : "";
        const priceDisplay = input.specBadgeData.price_aed ? `AED ${Number(input.specBadgeData.price_aed).toLocaleString()}` : "";
        const skuDisplay = input.specBadgeData.sku || "";

        const badgeSvg = Buffer.from(`
          <svg width="360" height="96" viewBox="0 0 360 96" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fde047" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#ca8a04" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#854d0e" stop-opacity="0.9"/>
              </linearGradient>
            </defs>
            <!-- Badge Card -->
            <rect width="360" height="96" rx="16" fill="#090d16" fill-opacity="0.92" stroke="url(#badgeBorder)" stroke-width="1.5"/>
            <!-- Karat and Weight Tag -->
            <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#facc15" letter-spacing="0.5">
              ${karatDisplay.toUpperCase()}
            </text>
            <text x="24" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#cbd5e1">
              ${weightDisplay ? `Weight: ${weightDisplay}` : ""} ${skuDisplay ? `• ${skuDisplay}` : ""}
            </text>
            <!-- Price Display (VAT Inclusive) -->
            <text x="336" y="44" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#ffffff">
              ${priceDisplay}
            </text>
            <text x="336" y="64" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">
              5% UAE VAT Inc.
            </text>
          </svg>
        `);

        compositeLayers.push({
          input: badgeSvg,
          top: target.height - 140,
          left: 48,
        });
      }

      // 5. Render final composite with sharp
      const outputBuffer = await sharp(backdropSvg)
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
        modelName: "pipeline-a-atelier-v2",
        durationMs: Date.now() - startTime,
        promptUsed: `Style: ${input.stylePackId}, Persona: ${input.modelPersona}, Karat: ${input.metalKarat}`,
      },
    };
  }
}
