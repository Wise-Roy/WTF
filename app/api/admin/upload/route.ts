import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const ALLOWED_EXTENSIONS = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS];

const VALID_BUCKETS = ["products", "about"] as const;
type BucketName = (typeof VALID_BUCKETS)[number];

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) || "products";

  if (!VALID_BUCKETS.includes(bucket as BucketName)) {
    return NextResponse.json(
      { success: false, message: `Invalid bucket. Allowed: ${VALID_BUCKETS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: `Invalid file type. Allowed: JPG, PNG, WebP, AVIF, GIF, MP4, WebM` },
      { status: 400 }
    );
  }

  // Validate extension
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { success: false, message: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  // Determine if video or image
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  // Validate size
  if (file.size > maxSize) {
    return NextResponse.json(
      { success: false, message: `File too large. Maximum size is ${isVideo ? "100" : "20"} MB` },
      { status: 400 }
    );
  }

  // Upload to Supabase Storage
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(uniqueName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase storage upload error:", error);
    return NextResponse.json(
      { success: false, message: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(uniqueName);

  return NextResponse.json({ success: true, data: { url: urlData.publicUrl } });
}
