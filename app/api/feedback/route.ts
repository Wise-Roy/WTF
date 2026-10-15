import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Get user's feedback
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

// Create feedback
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Feedback message is required" }, { status: 400 });
  }

  if (countWords(message) > 100) {
    return NextResponse.json({ error: "Feedback must be 100 words or less" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({ user_id: session.id, message: message.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}

// Update feedback
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, message } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 });
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: "Feedback message is required" }, { status: 400 });
  }
  if (countWords(message) > 100) {
    return NextResponse.json({ error: "Feedback must be 100 words or less" }, { status: 400 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("feedback")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .update({ message: message.trim(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

// Delete feedback
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("feedback")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("feedback")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
