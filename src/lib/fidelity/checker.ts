import sharp from "sharp";
import { MetalKarat, FidelityCheckResult } from "@/types";

export interface ColorMetrics {
  avgHue: number; // 0 - 360
  avgSat: number; // 0 - 100
  avgVal: number; // 0 - 100
  pixelCount: number;
}

export class FidelityChecker {
  /**
   * Convert RGB to HSV
   */
  static rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, v * 100];
  }

  /**
   * Extract foreground binary mask and color metrics from raw image buffer.
   * Focuses on the primary product region (inner 85% area, excluding bottom corner overlay badges).
   */
  static async extractMaskAndColors(buffer: Buffer): Promise<{
    mask: boolean[];
    normalizedMask: boolean[];
    colors: ColorMetrics;
    foregroundCount: number;
  }> {
    const analysisDim = 64;
    const { data } = await sharp(buffer)
      .resize(analysisDim, analysisDim, { fit: "inside" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const mask: boolean[] = [];
    let minX = analysisDim, maxX = 0, minY = analysisDim, maxY = 0;
    let totalH = 0, totalS = 0, totalV = 0, fgCount = 0;

    // We exclude the bottom 18% where spec badge overlays reside in generated output
    const maxAllowedY = Math.floor(analysisDim * 0.84);

    for (let y = 0; y < analysisDim; y++) {
      for (let x = 0; x < analysisDim; x++) {
        const idx = (y * analysisDim + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const inBadgeZone = y > maxAllowedY && x < Math.floor(analysisDim * 0.45);
        const isOpaque = a > 50;
        const [h, s, v] = this.rgbToHsv(r, g, b);

        // A pixel belongs to the foreground jewellery piece if it is not pure neutral plinth/white
        // Plinth background is typically high brightness and very low saturation (s < 10, v > 85)
        const isBackgroundPlinth = (v > 88 && s < 12) || (v < 10);
        const isForeground = isOpaque && !inBadgeZone && !isBackgroundPlinth;

        mask.push(isForeground);

        if (isForeground) {
          fgCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          totalH += h;
          totalS += s;
          totalV += v;
        }
      }
    }

    // Scale-invariant 32x32 normalized bounding box mask
    const normDim = 32;
    const normalizedMask: boolean[] = new Array(normDim * normDim).fill(false);

    if (fgCount > 0 && maxX >= minX && maxY >= minY) {
      const boxW = Math.max(1, maxX - minX + 1);
      const boxH = Math.max(1, maxY - minY + 1);

      for (let ny = 0; ny < normDim; ny++) {
        for (let nx = 0; nx < normDim; nx++) {
          const origX = Math.min(analysisDim - 1, Math.floor(minX + (nx / normDim) * boxW));
          const origY = Math.min(analysisDim - 1, Math.floor(minY + (ny / normDim) * boxH));
          const origIdx = origY * analysisDim + origX;
          if (mask[origIdx]) {
            normalizedMask[ny * normDim + nx] = true;
          }
        }
      }
    }

    const colors: ColorMetrics = {
      avgHue: fgCount > 0 ? totalH / fgCount : 0,
      avgSat: fgCount > 0 ? totalS / fgCount : 0,
      avgVal: fgCount > 0 ? totalV / fgCount : 0,
      pixelCount: fgCount,
    };

    return {
      mask,
      normalizedMask,
      colors,
      foregroundCount: fgCount,
    };
  }

  /**
   * Compute scale-invariant IoU between normalized masks
   */
  static computeIoU(maskA: boolean[], maskB: boolean[]): number {
    let intersection = 0;
    let union = 0;

    for (let i = 0; i < maskA.length; i++) {
      const a = maskA[i];
      const b = maskB[i];
      if (a && b) intersection++;
      if (a || b) union++;
    }

    if (union === 0) return 0.0;
    return intersection / union;
  }

  /**
   * Compute Karat color drift delta
   */
  static computeColorDrift(inputColors: ColorMetrics, outputColors: ColorMetrics, karat: MetalKarat): number {
    let hueDiff = Math.abs(inputColors.avgHue - outputColors.avgHue);
    if (hueDiff > 180) hueDiff = 360 - hueDiff;

    const satDiff = Math.abs(inputColors.avgSat - outputColors.avgSat);

    if (karat === "21K_yellow" || karat === "22K_yellow") {
      // 21K and 22K Gulf Gold must retain warmth. If output saturation drops below 25, it's washed out.
      const isWashedOut = outputColors.avgSat < 25;
      const penalty = isWashedOut ? 35 : 0;
      return hueDiff * 0.5 + satDiff * 0.4 + penalty;
    }

    if (karat === "18K_white" || karat === "platinum_silver") {
      const hasYellowCast = outputColors.avgSat > 25;
      return (hasYellowCast ? 35 : 0) + satDiff * 0.5;
    }

    return hueDiff * 0.5 + satDiff * 0.5;
  }

  /**
   * Evaluate Fidelity Gate
   */
  static async evaluate(
    inputBuffer: Buffer,
    outputBuffer: Buffer,
    karat: MetalKarat
  ): Promise<FidelityCheckResult> {
    const inputAnalysis = await this.extractMaskAndColors(inputBuffer);
    const outputAnalysis = await this.extractMaskAndColors(outputBuffer);

    // If output piece was completely erased
    if (outputAnalysis.foregroundCount === 0) {
      return {
        status: "fail",
        iouScore: 0,
        colorDriftDelta: 100,
        reasons: ["Silhouette distortion detected: zero foreground jewellery detected in output image"],
      };
    }

    const iouScore = this.computeIoU(inputAnalysis.normalizedMask, outputAnalysis.normalizedMask);
    const colorDriftDelta = this.computeColorDrift(inputAnalysis.colors, outputAnalysis.colors, karat);

    const reasons: string[] = [];
    let status: "pass" | "warn" | "fail" = "pass";

    if (iouScore < 0.50) {
      status = "fail";
      reasons.push(`Silhouette distortion detected: IoU ${iouScore.toFixed(2)} is below 0.50 minimum threshold`);
    } else if (iouScore < 0.70) {
      status = "warn";
      reasons.push(`Slight shape variation: IoU ${iouScore.toFixed(2)} is in warning range (0.50 - 0.70)`);
    }

    if (colorDriftDelta > 30) {
      status = "fail";
      reasons.push(
        `Karat color drift exceeded limit: Delta ${colorDriftDelta.toFixed(1)} > 30 (warm Gulf gold altered or washed out)`
      );
    } else if (colorDriftDelta > 20) {
      if (status !== "fail") status = "warn";
      reasons.push(
        `Minor metal tone shift: Delta ${colorDriftDelta.toFixed(1)} is in warning range (20 - 30)`
      );
    }

    return {
      status,
      iouScore: Number(iouScore.toFixed(4)),
      colorDriftDelta: Number(colorDriftDelta.toFixed(2)),
      reasons,
    };
  }
}
