import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PUBLIC_CACHE_HEADERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** GET /api/musicians — public list */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("musicians")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch musicians" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { musicians: data } }, { headers: PUBLIC_CACHE_HEADERS });
}
