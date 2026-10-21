import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("hero_settings")
    .select("collection_hero_1, collection_hero_2, collection_hero_3")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      images: [
        data.collection_hero_1 || "",
        data.collection_hero_2 || "",
        data.collection_hero_3 || "",
      ].filter(Boolean),
    },
  });
}
