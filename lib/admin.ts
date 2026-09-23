import { cookies } from "next/headers";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("admin_session")?.value;
  if (!raw) return false;

  try {
    const payload = JSON.parse(Buffer.from(raw, "base64").toString());
    if (!payload.email || !payload.exp) return false;
    if (Date.now() > payload.exp) return false;
    return payload.email === process.env.ADMIN_EMAIL;
  } catch {
    return false;
  }
}
