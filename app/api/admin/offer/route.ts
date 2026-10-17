import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("offer_settings")
    .select("*")
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
  let original_price = Number(body.original_price) || 0;

  if (product_id) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("prod_price")
      .eq("id", product_id)
      .single();
    if (product) {
      original_price = product.prod_price;
    }
  }

  // Validate when enabling
  if (is_enabled) {
    if (!header?.trim()) {
      return NextResponse.json({ success: false, message: "Header is required when offer is enabled" }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ success: false, message: "Description is required when offer is enabled" }, { status: 400 });
    }
    if (!product_id) {
      return NextResponse.json({ success: false, message: "Product selection is required" }, { status: 400 });
    }
    const discPrice = Number(discounted_price);
    if (!discPrice || discPrice <= 0) {
      return NextResponse.json({ success: false, message: "Discounted price must be greater than zero" }, { status: 400 });
    }
    if (discPrice >= original_price) {
      return NextResponse.json({ success: false, message: "Discounted price must be lower than original product price" }, { status: 400 });
    }
    if (!image_path) {
      return NextResponse.json({ success: false, message: "Image is required when offer is enabled" }, { status: 400 });
    }
  }

  // Get existing offer to check previous state
  const { data: existing } = await supabaseAdmin
    .from("offer_settings")
    .select("id, image_path, is_enabled, product_id, original_price")
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

  // Sync product price based on offer state
  if (is_enabled && product_id) {
    // Set product price to discounted price
    await supabaseAdmin
      .from("products")
      .update({ prod_price: Number(discounted_price), updated_at: new Date().toISOString() })
      .eq("id", product_id);

    // If previously enabled on a different product, restore that product's price
    if (existing?.is_enabled && existing.product_id && existing.product_id !== product_id && existing.original_price) {
      await supabaseAdmin
        .from("products")
        .update({ prod_price: existing.original_price, updated_at: new Date().toISOString() })
        .eq("id", existing.product_id);
    }
  } else if (!is_enabled && existing?.is_enabled && existing.product_id && existing.original_price) {
    // Offer disabled — restore original price
    await supabaseAdmin
      .from("products")
      .update({ prod_price: existing.original_price, updated_at: new Date().toISOString() })
      .eq("id", existing.product_id);
  }

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
