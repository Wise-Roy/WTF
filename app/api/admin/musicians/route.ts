import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function forbidden() {
  return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
}

/** GET /api/admin/musicians — list all (admin) */
export async function GET() {
  if (!(await isAdmin())) return forbidden();

  const { data, error } = await supabaseAdmin
    .from("musicians")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch musicians" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { musicians: data } });
}

/** POST /api/admin/musicians — create */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return forbidden();

  const body = await req.json();
  const name = (body.name as string)?.trim();
  const photo = (body.photo as string)?.trim();

  if (!name || name.length < 1) {
    return NextResponse.json(
      { success: false, message: "Name is required" },
      { status: 400 }
    );
  }

  if (!photo) {
    return NextResponse.json(
      { success: false, message: "Photo is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("musicians")
    .insert({ name, photo })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to create musician" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { musician: data } }, { status: 201 });
}
