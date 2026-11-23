import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PUBLIC_CACHE_HEADERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("about_sections")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ success: true, data: { sections: [] } });
  }

  return NextResponse.json({ success: true, data: { sections: data } }, { headers: PUBLIC_CACHE_HEADERS });
}
