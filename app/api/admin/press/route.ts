import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const MAX_IMAGES = 10;

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("hero_settings")
    .select("press_images")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Ensure we always return exactly 10 slots
  const images: string[] = Array.isArray(data.press_images)
    ? data.press_images
    : [];
  while (images.length < MAX_IMAGES) images.push("");

  return NextResponse.json({ success: true, data: { images: images.slice(0, MAX_IMAGES) } });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { images, previousImages } = body as {
    images?: string[];
    previousImages?: string[];
  };

  if (!images || images.length !== MAX_IMAGES) {
    return NextResponse.json(
      { success: false, message: `Exactly ${MAX_IMAGES} image slots required` },
      { status: 400 }
    );
  }

  // Cleanup: delete old images from storage that are no longer in the new set
  if (previousImages && Array.isArray(previousImages)) {
    const newSet = new Set(images.filter(Boolean));
    const toDelete = previousImages
      .filter((url) => url && !newSet.has(url))
      .map((url) => {
        // Extract file path from public URL: .../storage/v1/object/public/designs/<path>
        const match = url.match(/\/storage\/v1\/object\/public\/designs\/(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    if (toDelete.length > 0) {
      await supabaseAdmin.storage.from("designs").remove(toDelete);
    }
  }

  // Get existing row id
  const { data: existing } = await supabaseAdmin
    .from("hero_settings")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    const { error } = await supabaseAdmin.from("hero_settings").insert({
      press_images: images,
    });
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabaseAdmin
      .from("hero_settings")
      .update({
        press_images: images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: "Press images saved" });
}
