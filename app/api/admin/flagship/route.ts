import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("flagship_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({
      success: true,
      data: {
        flagship: {
          product_id: "",
          custom_title: "",
          custom_description: "",
          selected_image: "",
        },
      },
    });
  }

  return NextResponse.json({ success: true, data: { flagship: data } });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { product_id, custom_title, custom_description, selected_image } = body;

  if (!product_id) {
    return NextResponse.json({ success: false, message: "Product selection is required" }, { status: 400 });
  }

  if (!selected_image) {
    return NextResponse.json({ success: false, message: "Image selection is required" }, { status: 400 });
  }

  const payload = {
    product_id,
    custom_title: custom_title || "",
    custom_description: custom_description || "",
    selected_image,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabaseAdmin
    .from("flagship_settings")
    .select("id")
    .limit(1)
    .single();

  let result;
  if (existing) {
    result = await supabaseAdmin
      .from("flagship_settings")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabaseAdmin
      .from("flagship_settings")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ success: false, message: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { flagship: result.data } });
}
