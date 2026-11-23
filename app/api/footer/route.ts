import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PUBLIC_CACHE_HEADERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("footer_settings")
    .select("instagram, twitter, spotify, facebook, google_review, privacy_policy_pdf, terms_of_service_pdf, shipping_policy_pdf, newsletter_pdf, work_pdfs, shipping_fee, free_shipping_threshold")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({
      success: true,
      data: { footer: { instagram: "", twitter: "", spotify: "", facebook: "", google_review: "", work_pdfs: [], shipping_fee: 500, free_shipping_threshold: 5000 } },
    });
  }

  return NextResponse.json({ success: true, data: { footer: data } }, { headers: PUBLIC_CACHE_HEADERS });
}
