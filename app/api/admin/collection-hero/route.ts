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
      ],
    },
  });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { images } = body as { images?: string[] };

  if (!images || images.length !== 3) {
    return NextResponse.json(
      { success: false, message: "Exactly 3 image URLs required" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("hero_settings")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    const { error } = await supabaseAdmin.from("hero_settings").insert({
      collection_hero_1: images[0],
      collection_hero_2: images[1],
      collection_hero_3: images[2],
    });
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabaseAdmin
      .from("hero_settings")
      .update({
        collection_hero_1: images[0],
        collection_hero_2: images[1],
        collection_hero_3: images[2],
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: "Collection hero images saved" });
}
