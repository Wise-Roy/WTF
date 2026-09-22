import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Rate limit: max 3 tokens per email in last 15 min
  const { data: recent } = await supabase
    .from("magic_link_tokens")
    .select("id")
    .eq("email", email.toLowerCase())
    .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

  if (recent && recent.length >= 3) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const token = randomUUID();
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase.from("magic_link_tokens").insert({
    email: email.toLowerCase(),
    token,
    expires_at,
    used: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const origin = req.nextUrl.origin;
  const magic_link = `${origin}/auth/verify?token=${token}`;

  return NextResponse.json({
    magic_link,
    expires_in: 900,
  });
}
