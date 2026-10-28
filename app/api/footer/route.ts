import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("footer_settings")
    .select("instagram, twitter, spotify, facebook, google_review, privacy_policy_pdf, newsletter_pdf, shipping_fee, free_shipping_threshold")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({
      success: true,
      data: { footer: { instagram: "", twitter: "", spotify: "", facebook: "", google_review: "", shipping_fee: 500, free_shipping_threshold: 5000 } },
    });
  }

  return NextResponse.json({ success: true, data: { footer: data } });
}
