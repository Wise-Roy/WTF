import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getProductPrice, offerValidationError, syncOfferPrice } from "@/lib/offers";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("offer_settings")
    .select("*")
    .eq("placement", "bar")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { offers: data ?? [] } });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { is_enabled, header, product_id, discounted_price, end_time } = body;

  const original_price = product_id ? await getProductPrice(product_id) : 0;

  const invalid = offerValidationError(body, original_price, "bar");
  if (invalid) {
    return NextResponse.json({ success: false, message: invalid }, { status: 400 });
  }

  const payload = {
    is_enabled: !!is_enabled,
    header: header || "",
    description: "",
    product_id: product_id || "",
    original_price,
    discounted_price: Number(discounted_price) || 0,
    image_path: "",
    end_time: end_time || "",
    placement: "bar",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("offer_settings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  await syncOfferPrice(
    { is_enabled: payload.is_enabled, product_id: payload.product_id, discounted_price: payload.discounted_price },
    null
  );

  return NextResponse.json({ success: true, data: { offer: data } });
}
