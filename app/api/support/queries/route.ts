import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("support_queries")
    .select("*")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ queries: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, related_order_id, message } = await req.json();

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Subject and message are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("support_queries")
    .insert({
      user_id: session.id,
      subject: subject.trim(),
      related_order_id: related_order_id || null,
      message: message.trim(),
      status: "open",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ query: data });
}
