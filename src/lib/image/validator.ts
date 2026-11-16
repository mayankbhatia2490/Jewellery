import sharp from "sharp";

export interface ValidationResult {
  valid: boolean;
  mimeType: string;
  sanitizedBuffer?: Buffer;
  error?: string;
}

export class ImageValidator {
  static readonly MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB max

  /**
   * Detect mime type and verify integrity via magic bytes
   */
  static detectMagicBytes(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return "image/png";
    }

    // WebP: RIFF .... WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return "image/webp";
    }

    // HEIC / HEIF: ....ftypheic or ftypmif1
    const ftyp = buffer.toString("ascii", 4, 12);
    if (
      ftyp.startsWith("ftyp") &&
      (ftyp.includes("heic") || ftyp.includes("mif1") || ftyp.includes("msf1") || ftyp.includes("heix"))
    ) {
      return "image/heic";
    }

    // SVG: <svg or <?xml
    const sample = buffer.subarray(0, 128).toString("utf-8").trim();
    if (sample.startsWith("<svg") || sample.startsWith("<?xml") || sample.includes("<svg")) {
      return "image/svg+xml";
    }

    return null;
  }

  /**
   * Validate, auto-rotate according to EXIF, strip all GPS / camera metadata (PDPL compliance),
   * and normalize to clean WebP/JPEG buffer.
   */
  static async validateAndSanitize(buffer: Buffer): Promise<ValidationResult> {
    if (buffer.length === 0) {
      return { valid: false, mimeType: "", error: "Uploaded file is empty" };
    }

    if (buffer.length > this.MAX_SIZE_BYTES) {
      return {
        valid: false,
        mimeType: "",
        error: `File size exceeds 15 MB limit (received ${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }

    const detectedMime = this.detectMagicBytes(buffer);
    if (!detectedMime) {
      return {
        valid: false,
        mimeType: "",
        error: "Unsupported file format. Please upload JPEG, PNG, WebP, or iPhone HEIC.",
      };
    }

    try {
      // Use sharp to auto-rotate, strip EXIF/GPS, and convert to standardized WebP
      // Note: sharp auto-rotates by default when .rotate() is called with no args,
      // and stripping metadata happens when we don't call .withMetadata()
      const sanitized = await sharp(buffer)
        .rotate() // auto-orient based on EXIF before stripping
        .webp({ quality: 95 })
        .toBuffer();

      return {
        valid: true,
        mimeType: "image/webp",
        sanitizedBuffer: sanitized,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image processing failed";
      return {
        valid: false,
        mimeType: detectedMime,
        error: `Corrupted or invalid image data: ${msg}`,
      };
    }
  }
}
