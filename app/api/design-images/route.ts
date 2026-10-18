import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("hero_settings")
    .select("design_images")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  const images: string[] = Array.isArray(data.design_images)
    ? data.design_images.filter(Boolean)
    : [];

  return NextResponse.json({ success: true, data: { images } });
}
