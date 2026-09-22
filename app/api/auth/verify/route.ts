import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_token", req.url));
  }

  // Find token
  const { data: tokenDoc } = await supabase
    .from("magic_link_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (!tokenDoc) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_token", req.url));
  }

  if (tokenDoc.used) {
    return NextResponse.redirect(new URL("/sign-in?error=token_used", req.url));
  }

  if (new Date(tokenDoc.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/sign-in?error=token_expired", req.url));
  }

  // Mark token as used
  await supabase
    .from("magic_link_tokens")
    .update({ used: true })
    .eq("id", tokenDoc.id);

  // Find or create user
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", tokenDoc.email)
    .single();

  if (!user) {
    const { data: newUser } = await supabase
      .from("users")
      .insert({ email: tokenDoc.email })
      .select()
      .single();
    user = newUser;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in?error=server_error", req.url));
  }

  // Create profile if not exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    await supabase.from("profiles").insert({ user_id: user.id });
  }

  // Set session cookie
  await createSession(user.id, user.email);

  return NextResponse.redirect(new URL("/profile", req.url));
}
