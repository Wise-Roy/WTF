import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

const SESSION_COOKIE = "wtf_session";

export interface SessionUser {
  id: string;
  email: string;
}

export async function createSession(userId: string, email: string): Promise<void> {
  // Simple base64 encoded session token (in production, use JWT)
  const token = Buffer.from(JSON.stringify({ id: userId, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const data = JSON.parse(Buffer.from(token, "base64").toString());
    if (data.exp < Date.now()) return null;
    return { id: data.id, email: data.email };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
