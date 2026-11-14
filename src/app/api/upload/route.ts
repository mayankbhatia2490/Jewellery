import { NextRequest, NextResponse } from "next/server";
import { ImageValidator } from "@/lib/image/validator";
import { mockDb } from "@/lib/db/mock-db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "user-test-uae";
    const pieceType = (formData.get("pieceType") as string) || "necklace";
    const metalKarat = (formData.get("metalKarat") as string) || "21K_yellow";
    const stylePackId = (formData.get("stylePackId") as string) || "gulf_gold_classic";
    const modelPersona = (formData.get("modelPersona") as string) || "none_product_only";
    const specBadgeEnabled = formData.get("specBadgeEnabled") === "true";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Validate MIME, magic bytes, max 15MB, strip EXIF/GPS, auto-rotate
    const validation = await ImageValidator.validateAndSanitize(rawBuffer);
    if (!validation.valid || !validation.sanitizedBuffer) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Compute input image hash
    const hash = crypto.createHash("sha256").update(validation.sanitizedBuffer).digest("hex");
    const inputPath = `vault/${userId}/inputs/${hash}.webp`;

    const serviceCtx = { userId: null, role: "service_role" as const };

    // Save to private storage vault
    await mockDb.writeStorageObject(serviceCtx, inputPath, validation.sanitizedBuffer, "image/webp");

    // Enqueue Image Job
    const jobId = crypto.randomUUID();
    const job = await mockDb.insertImageJob(serviceCtx, {
      id: jobId,
      user_id: userId,
      piece_type: pieceType,
      metal_karat: metalKarat,
      style_pack_id: stylePackId,
      model_persona: modelPersona,
      spec_badge_enabled: specBadgeEnabled,
      input_image_path: inputPath,
      input_image_hash: hash,
      status: "queued",
      fidelity_warning: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      inputPath: job.input_image_path,
      status: job.status,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload processing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
