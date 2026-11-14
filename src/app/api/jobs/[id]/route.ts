import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-db";
import { JobQueueWorker } from "@/lib/queue/worker";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const serviceCtx = { userId: null, role: "service_role" as const };
    const job = await mockDb.getImageJob(serviceCtx, jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const outputs = await mockDb.getJobOutputs(serviceCtx, jobId);

    // Generate short-lived signed URLs for each output
    const outputsWithUrls = outputs.map((out) => {
      const token = Buffer.from(`${out.storage_path}:${Date.now() + 15 * 60 * 1000}`).toString("base64");
      return {
        ...out,
        signedUrl: `http://localhost:3000/api/storage/signed?path=${encodeURIComponent(out.storage_path)}&token=${token}`,
      };
    });

    return NextResponse.json({
      job,
      outputs: outputsWithUrls,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error retrieving job";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const worker = new JobQueueWorker();
    const result = await worker.processJob(jobId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to run worker";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
