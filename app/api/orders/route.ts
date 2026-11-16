import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin client because orders are written server-side; scoped to the caller's own paid orders
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, items, subtotal, shipping, total, paid_at, payment_mode")
    .eq("user_id", session.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}
