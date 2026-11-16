import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/signed-token";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { success: false, message: "Admin credentials not configured" },
      { status: 500 }
    );
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Set admin session cookie (24h)
  const cookieStore = await cookies();
  const payload = signToken({ email: adminEmail, exp: Date.now() + 24 * 60 * 60 * 1000 });

  cookieStore.set("admin_session", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return NextResponse.json({ success: true });
}
