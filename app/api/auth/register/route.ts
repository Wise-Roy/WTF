import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{7,20}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, phone, password, confirm_password, house_flat, street, city, state, country } = body;

    // Validate required fields
    if (!full_name?.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!phone || !PHONE_REGEX.test(phone)) {
      return NextResponse.json({ error: "Valid contact number is required" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (password !== confirm_password) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: normalizedEmail,
        password_hash,
        full_name: full_name.trim(),
      })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || "Failed to create account" }, { status: 500 });
    }

    // Create profile
    await supabase.from("profiles").insert({
      user_id: user.id,
      name: full_name.trim(),
      phone: phone.trim(),
      house_flat: house_flat?.trim() || "",
      street: street?.trim() || "",
      city: city?.trim() || "",
      state: state?.trim() || "",
      country: country?.trim() || "IN",
    });

    // Create session
    await createSession(user.id, user.email);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
