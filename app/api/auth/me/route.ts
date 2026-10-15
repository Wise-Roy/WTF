import { NextResponse } from "next/server";
import { getSession, destroySession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Check if user is restricted
  const { data: user } = await supabase
    .from("users")
    .select("is_restricted")
    .eq("id", session.id)
    .single();

  if (user?.is_restricted) {
    await destroySession();
    return NextResponse.json({ user: null, restricted: true });
  }

  return NextResponse.json({ user: session });
}
