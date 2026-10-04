import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("hero_settings")
    .select("video_url")
    .limit(1)
    .single();

  return NextResponse.json({
    success: true,
    data: { video_url: data?.video_url || "/into.mp4" },
  });
}
