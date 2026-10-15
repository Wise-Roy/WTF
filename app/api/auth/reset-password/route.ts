import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirm_password } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (password !== confirm_password) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Find token
    const { data: tokenDoc } = await supabase
      .from("magic_link_tokens")
      .select("*")
      .eq("token", token)
      .eq("token_type", "password_reset")
      .single();

    if (!tokenDoc) {
      return NextResponse.json({ error: "Invalid or unknown reset link" }, { status: 400 });
    }
    if (tokenDoc.used) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
    }
    if (new Date(tokenDoc.expires_at) < new Date()) {
      return NextResponse.json({ error: "Reset link expired. Request a new one." }, { status: 400 });
    }

    // Mark token as used
    await supabase
      .from("magic_link_tokens")
      .update({ used: true })
      .eq("id", tokenDoc.id);

    // Hash new password
    const password_hash = await bcrypt.hash(password, 12);

    // Update user password
    const { error } = await supabase
      .from("users")
      .update({ password_hash })
      .eq("email", tokenDoc.email);

    if (error) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
