import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const mode = req.nextUrl.searchParams.get("mode") === "live" ? "live" : "test";

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, order_number, items, total, currency, paid_at, razorpay_payment_id")
    .eq("status", "paid")
    .eq("payment_mode", mode)
    .order("paid_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  const userIds = [...new Set((orders || []).map((o) => o.user_id))];
  const [{ data: users }, { data: profiles }] = await Promise.all([
    supabaseAdmin.from("users").select("id, email, full_name").in("id", userIds),
    supabaseAdmin.from("profiles").select("user_id, name").in("user_id", userIds),
  ]);

  const userMap = new Map((users || []).map((u) => [u.id, u]));
  const nameMap = new Map((profiles || []).map((p) => [p.user_id, p.name]));

  const purchases = (orders || []).map((o) => {
    const user = userMap.get(o.user_id);
    return {
      ...o,
      total: Number(o.total),
      email: user?.email ?? "",
      name: nameMap.get(o.user_id) || user?.full_name || "",
    };
  });

  return NextResponse.json({ success: true, data: { purchases } });
}
