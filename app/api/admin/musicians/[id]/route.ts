import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
}

/** GET /api/admin/musicians/[id] */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return forbidden();
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("musicians")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, message: "Musician not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { musician: data } });
}

/** PUT /api/admin/musicians/[id] — update */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return forbidden();
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.name !== undefined) updates.name = (body.name as string).trim();
  if (body.photo !== undefined) updates.photo = (body.photo as string).trim();

  const { data, error } = await supabaseAdmin
    .from("musicians")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to update musician" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { musician: data } });
}

/** DELETE /api/admin/musicians/[id] */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return forbidden();
  const { id } = await params;

  const { error } = await supabaseAdmin.from("musicians").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to delete musician" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: null });
}
