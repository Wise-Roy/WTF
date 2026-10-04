import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("about_sections")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ success: true, data: { sections: [] } });
  }

  return NextResponse.json({ success: true, data: { sections: data } });
}
