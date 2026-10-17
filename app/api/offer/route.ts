import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("offer_settings")
    .select("is_enabled, header, description, product_id, original_price, discounted_price, image_path, end_time")
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: true, data: { offer: null } });
  }

  if (!data.is_enabled) {
    return NextResponse.json({ success: true, data: { offer: null } });
  }

  return NextResponse.json({ success: true, data: { offer: data } });
}
