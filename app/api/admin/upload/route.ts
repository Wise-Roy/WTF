import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".mp4", ".webm"];
const VALID_BUCKETS = ["products", "about"] as const;
type BucketName = (typeof VALID_BUCKETS)[number];

// POST: Generate a signed upload URL (client uploads directly to Supabase)
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { bucket = "products", fileName, contentType } = body as {
    bucket?: string;
    fileName?: string;
    contentType?: string;
  };

  if (!VALID_BUCKETS.includes(bucket as BucketName)) {
    return NextResponse.json(
      { success: false, message: `Invalid bucket. Allowed: ${VALID_BUCKETS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!fileName || !contentType) {
    return NextResponse.json(
      { success: false, message: "fileName and contentType are required" },
      { status: 400 }
    );
  }

  // Validate extension
  const ext = fileName.includes(".")
    ? "." + fileName.split(".").pop()!.toLowerCase()
    : "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { success: false, message: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  const uniqueName = `${crypto.randomUUID()}${ext}`;

  // Create signed upload URL (valid for 2 minutes)
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(uniqueName);

  if (error) {
    console.error("Supabase signed URL error:", error);
    return NextResponse.json(
      { success: false, message: `Failed to create upload URL: ${error.message}` },
      { status: 500 }
    );
  }

  // Build the public URL for after upload completes
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(uniqueName);

  return NextResponse.json({
    success: true,
    data: {
      signedUrl: data.signedUrl,
      token: data.token,
      path: uniqueName,
      publicUrl: urlData.publicUrl,
    },
  });
}
