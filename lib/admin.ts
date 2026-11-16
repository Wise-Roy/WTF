import { cookies } from "next/headers";
import { verifyToken } from "@/lib/signed-token";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const payload = verifyToken<{ email: string; exp: number }>(cookieStore.get("admin_session")?.value);
  return !!payload && payload.email === process.env.ADMIN_EMAIL;
}
