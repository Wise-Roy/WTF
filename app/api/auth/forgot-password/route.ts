import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check user exists
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (!user) {
      // Don't reveal whether account exists
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been generated." });
    }

    // Rate limit
    const { data: recent } = await supabase
      .from("magic_link_tokens")
      .select("id")
      .eq("email", normalizedEmail)
      .eq("token_type", "password_reset")
      .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if (recent && recent.length >= 3) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const token = randomUUID();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from("magic_link_tokens").insert({
      email: normalizedEmail,
      token,
      expires_at,
      used: false,
      token_type: "password_reset",
    });

    const origin = req.nextUrl.origin;
    const reset_link = `${origin}/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been generated.",
      reset_link, // In production, send via email instead
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
