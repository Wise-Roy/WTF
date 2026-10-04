import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("hero_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ success: true, data: { hero: { video_url: "/into.mp4" } } });
  }

  return NextResponse.json({ success: true, data: { hero: data } });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { video_url } = body;

  if (!video_url) {
    return NextResponse.json(
      { success: false, message: "video_url is required" },
      { status: 400 }
    );
  }

  // Check if row exists
  const { data: existing } = await supabaseAdmin
    .from("hero_settings")
    .select("id")
    .limit(1)
    .single();

  let result;
  if (existing) {
    result = await supabaseAdmin
      .from("hero_settings")
      .update({ video_url, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabaseAdmin
      .from("hero_settings")
      .insert({ video_url })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ success: false, message: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { hero: result.data } });
}
