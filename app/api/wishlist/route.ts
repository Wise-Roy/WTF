import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Get user's wishlist with product details
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wishlist")
    .select("id, product_id, created_at, products(id, image, prod_name, prod_price, prod_quantity, prod_label)")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

// Add product to wishlist
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { product_id } = await req.json();
  if (!product_id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  // Check product exists
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", product_id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check duplicate
  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", session.id)
    .eq("product_id", product_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already in wishlist" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("wishlist")
    .insert({ user_id: session.id, product_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}

// Remove from wishlist
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { product_id } = await req.json();
  if (!product_id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", session.id)
    .eq("product_id", product_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
