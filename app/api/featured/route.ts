import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PUBLIC_CACHE_HEADERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("hero_settings")
    .select("featured_images")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  const images: string[] = Array.isArray(data.featured_images)
    ? data.featured_images.filter(Boolean)
    : [];

  return NextResponse.json({ success: true, data: { images } }, { headers: PUBLIC_CACHE_HEADERS });
}
