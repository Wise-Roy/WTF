import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const { data: user } = await supabase
      .from("users")
      .select("id, email, password_hash, is_restricted")
      .eq("email", normalizedEmail)
      .single();

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check restriction
    if (user.is_restricted) {
      return NextResponse.json({ error: "Your account has been restricted. Contact support for assistance." }, { status: 403 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create session
    await createSession(user.id, user.email);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
