import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isLiveOffer } from "@/lib/offers";

export const dynamic = "force-dynamic";

const OFFER_FIELDS =
  "is_enabled, header, description, product_id, original_price, discounted_price, image_path, end_time, placement";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("offer_settings")
    .select(OFFER_FIELDS)
    .order("created_at", { ascending: true });

  if (error || !data?.length) {
    return NextResponse.json({ success: true, data: { offer: null, offers: [] } });
  }

  let live = data.filter((o) => isLiveOffer(o));

  // Drop offers pointing at a product that no longer exists
  if (live.length) {
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id")
      .in("id", live.map((o) => o.product_id));
    const validIds = new Set((products ?? []).map((p) => p.id));
    live = live.filter((o) => validIds.has(o.product_id));
  }

  // `offer` is the single home-page modal offer; `offers` fill the announcement bar
  return NextResponse.json({
    success: true,
    data: {
      offer: live.find((o) => o.placement === "modal") ?? null,
      offers: live.filter((o) => o.placement === "bar"),
    },
  });
}
