import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Update user restriction status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const { is_restricted } = await req.json();

  if (typeof is_restricted !== "boolean") {
    return NextResponse.json({ success: false, message: "is_restricted must be boolean" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ is_restricted })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
