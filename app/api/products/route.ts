import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** GET /api/products?label=Hoodie&limit=6&ranked=true */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const label = searchParams.get("label");
  const limit = searchParams.get("limit");
  const ranked = searchParams.get("ranked") === "true";

  let query = supabase.from("products").select("*");

  if (label && label !== "All") {
    query = query.eq("prod_label", label);
  }

  if (ranked) {
    query = query.order("prod_rank", { ascending: true, nullsFirst: false });
  }

  query = query.order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(parseInt(limit, 10));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }

  // Sort: rank>0 first (ASC), then rank=0 by created_at DESC
  if (ranked && data) {
    data.sort((a, b) => {
      const aRank = a.prod_rank || 0;
      const bRank = b.prod_rank || 0;
      if (aRank > 0 && bRank > 0) return aRank - bRank;
      if (aRank > 0) return -1;
      if (bRank > 0) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  return NextResponse.json({ success: true, data: { products: data } });
}
