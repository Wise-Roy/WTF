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
    .eq("placement", "modal")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({
      success: true,
      data: {
        offer: {
          is_enabled: false,
          header: "",
          description: "",
          product_id: "",
          original_price: 0,
          discounted_price: 0,
          image_path: "",
          end_time: "",
        },
      },
    });
  }

  return NextResponse.json({ success: true, data: { offer: data } });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { is_enabled, header, description, product_id, discounted_price, image_path, end_time } = body;

  // When enabling, look up the product to get original price
  const original_price = product_id
    ? await getProductPrice(product_id)
    : Number(body.original_price) || 0;

  const invalid = offerValidationError(body, original_price, "modal");
  if (invalid) {
    return NextResponse.json({ success: false, message: invalid }, { status: 400 });
  }

  // Get existing offer to check previous state
  const { data: existing } = await supabaseAdmin
    .from("offer_settings")
    .select("id, image_path, is_enabled, product_id, original_price")
    .eq("placement", "modal")
    .limit(1)
    .single();

  const payload = {
    is_enabled: !!is_enabled,
    header: header || "",
    description: description || "",
    product_id: product_id || "",
    original_price,
    discounted_price: Number(discounted_price) || 0,
    image_path: image_path || "",
    end_time: end_time || "",
    placement: "modal",
    updated_at: new Date().toISOString(),
  };

  let result;
  if (existing) {
    result = await supabaseAdmin
      .from("offer_settings")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabaseAdmin
      .from("offer_settings")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ success: false, message: result.error.message }, { status: 500 });
  }

  await syncOfferPrice(
    { is_enabled: !!is_enabled, product_id: product_id || "", discounted_price: payload.discounted_price },
    existing ?? null
  );

  // Clean up old image if replaced
  if (existing?.image_path && existing.image_path !== image_path && image_path) {
    try {
      const oldFileName = existing.image_path.split("/").pop();
      if (oldFileName) {
        await supabaseAdmin.storage.from("offers").remove([oldFileName]);
      }
    } catch {
      console.error("Failed to clean up old offer image");
    }
  }

  return NextResponse.json({ success: true, data: { offer: result.data } });
}
