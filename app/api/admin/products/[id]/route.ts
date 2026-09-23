import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
}

/** PUT /api/admin/products/[id] — update */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return forbidden();
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.prod_name !== undefined) updates.prod_name = (body.prod_name as string).trim();
  if (body.prod_price !== undefined) updates.prod_price = Number(body.prod_price);
  if (body.prod_quantity !== undefined) updates.prod_quantity = Number(body.prod_quantity);
  if (body.prod_description !== undefined) updates.prod_description = (body.prod_description as string).trim();
  if (body.prod_label !== undefined) updates.prod_label = (body.prod_label as string).trim();
  if (body.image !== undefined) updates.image = body.image;

  if (body.prod_rank !== undefined) {
    const rank = Number(body.prod_rank);
    updates.prod_rank = rank;
    if (rank > 0) {
      await supabaseAdmin.rpc("shift_product_ranks", {
        target_rank: rank,
        exclude_id: id,
      });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { product: data } });
}

/** DELETE /api/admin/products/[id] */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return forbidden();
  const { id } = await params;

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: null });
}
