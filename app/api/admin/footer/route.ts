import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("footer_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({
      success: true,
      data: { footer: { instagram: "", twitter: "", spotify: "", facebook: "" } },
    });
  }

  return NextResponse.json({ success: true, data: { footer: data } });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { instagram, twitter, spotify, facebook } = body;

  const { data: existing } = await supabaseAdmin
    .from("footer_settings")
    .select("id")
    .limit(1)
    .single();

  const payload = {
    instagram: instagram || "",
    twitter: twitter || "",
    spotify: spotify || "",
    facebook: facebook || "",
    updated_at: new Date().toISOString(),
  };

  let result;
  if (existing) {
    result = await supabaseAdmin
      .from("footer_settings")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabaseAdmin
      .from("footer_settings")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ success: false, message: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { footer: result.data } });
}
