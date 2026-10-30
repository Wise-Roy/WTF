const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const INVALID_EMAIL_MESSAGE = "Enter a valid email address";

// Flags dot-stuffed gmail aliases (e.g. a.b.c.d.e@gmail.com) used to spam the same inbox.
function isSuspiciousEmail(email: string) {
  const [username, domain] = email.toLowerCase().split("@");
  if (domain !== "gmail.com") return false;

  const segments = username.split(".");
  if (segments.length >= 6) return true;
  return segments.filter((s) => s.length === 1).length >= 4;
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && EMAIL_REGEX.test(email) && !isSuspiciousEmail(email);
}
