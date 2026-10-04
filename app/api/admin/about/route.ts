import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("about_sections")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { sections: data } });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { tagline, heading, body: bodyText, images, position } = body;

  if (!heading || !bodyText || !images?.length || !position) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  if (position < 1 || position > 3) {
    return NextResponse.json(
      { success: false, message: "Position must be 1, 2, or 3" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("about_sections")
    .upsert(
      {
        position,
        tagline: tagline || "Our Story",
        heading,
        body: bodyText,
        images,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "position" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { section: data } });
}
