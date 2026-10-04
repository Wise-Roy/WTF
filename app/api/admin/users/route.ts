import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // Fetch profiles for all users
  const userIds = (users || []).map((u) => u.id);
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("user_id, name, phone, city, country")
    .in("user_id", userIds);

  const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

  const enriched = (users || []).map((u) => ({
    ...u,
    profile: profileMap.get(u.id) || null,
  }));

  return NextResponse.json({ success: true, data: { users: enriched } });
}
