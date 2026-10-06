import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { writeFile, mkdir } from "fs/promises";
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

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

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

  // Save to appropriate directory
  const subDir = isVideo ? "videos" : "products";
  const uploadDir = path.join(process.cwd(), "public", subDir);
  await mkdir(uploadDir, { recursive: true });

  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/${subDir}/${uniqueName}`;

  return NextResponse.json({ success: true, data: { url } });
}
