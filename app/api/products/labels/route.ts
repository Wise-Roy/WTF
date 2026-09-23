import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/products/labels — returns distinct prod_label values */
export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("prod_label");

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch labels" }, { status: 500 });
  }

  const labels = [...new Set((data || []).map((r) => r.prod_label))].sort();

  return NextResponse.json({ success: true, data: { labels } });
}
