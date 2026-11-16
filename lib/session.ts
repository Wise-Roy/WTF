import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { signToken, verifyToken } from "@/lib/signed-token";

const SESSION_COOKIE = "wtf_session";

export interface SessionUser {
  id: string;
  email: string;
}

export async function createSession(userId: string, email: string): Promise<void> {
  const token = signToken({ id: userId, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
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
  const data = verifyToken<SessionUser & { exp: number }>(cookieStore.get(SESSION_COOKIE)?.value);
  return data ? { id: data.id, email: data.email } : null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
