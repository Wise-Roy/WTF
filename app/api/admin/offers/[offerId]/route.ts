import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getProductPrice, offerValidationError, syncOfferPrice } from "@/lib/offers";

export const dynamic = "force-dynamic";

/** Announcement-bar offers live in the same table, so every lookup is scoped to that placement. */
async function findBarOffer(offerId: string) {
  const { data } = await supabaseAdmin
    .from("offer_settings")
    .select("id, is_enabled, product_id, original_price")
    .eq("id", offerId)
    .eq("placement", "bar")
    .single();
  return data;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { offerId } = await params;
  const existing = await findBarOffer(offerId);
  if (!existing) {
    return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
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
    product_id: product_id || "",
    original_price,
    discounted_price: Number(discounted_price) || 0,
    end_time: end_time || "",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("offer_settings")
    .update(payload)
    .eq("id", offerId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  await syncOfferPrice(
    { is_enabled: payload.is_enabled, product_id: payload.product_id, discounted_price: payload.discounted_price },
    existing
  );

  return NextResponse.json({ success: true, data: { offer: data } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ offerId: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { offerId } = await params;
  const existing = await findBarOffer(offerId);
  if (!existing) {
    return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from("offer_settings").delete().eq("id", offerId);
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Deleting a live offer must hand the product its original price back
  await syncOfferPrice(null, existing);

  return NextResponse.json({ success: true });
}
