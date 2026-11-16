import { createHmac, timingSafeEqual } from "crypto";

// Read per call so a missing secret fails the request, not the build
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return s;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

/** `<payload>.<hmac>` — readable by anyone, but only the server can mint one. */
export function signToken(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** The payload if the signature is ours and `exp` is in the future, else null. */
export function verifyToken<T extends { exp: number }>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T;
    return typeof data.exp === "number" && data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}
