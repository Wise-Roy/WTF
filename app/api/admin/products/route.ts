import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin";
import { validateProduct } from "@/lib/product-validation";

export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
}

/** GET /api/admin/products — list all (admin) */
export async function GET() {
  if (!(await isAdmin())) return forbidden();

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("prod_rank", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { products: data } });
}

/** POST /api/admin/products — create */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return forbidden();

  const body = await req.json();
  const { valid, errors } = validateProduct(body);
  if (!valid) {
    return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
  }

  const rank = Number(body.prod_rank ?? 0);

  // If rank > 0, shift existing ranks to avoid conflict
  if (rank > 0) {
    await supabaseAdmin.rpc("shift_product_ranks", { target_rank: rank });
  }

  const { data, error } = await supabaseAdmin.from("products").insert({
    image: body.image,
    prod_name: (body.prod_name as string).trim(),
    prod_price: Number(body.prod_price),
    prod_quantity: Number(body.prod_quantity ?? 0),
    prod_description: (body.prod_description as string).trim(),
    prod_label: (body.prod_label as string).trim(),
    prod_rank: rank,
  }).select().single();

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { product: data } }, { status: 201 });
}
