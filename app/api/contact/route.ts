import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (
    typeof name !== "string" || !name.trim() || name.length > 200 ||
    typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== "string" || !message.trim() || message.length > 5000
  ) {
    return NextResponse.json({ error: "Please fill all fields correctly" }, { status: 400 });
  }

  try {
    // Constructed per request: module-level init throws at build when key is absent.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "hello@wxrshipthefumes.com",
      to: "hello@wxrshipthefumes.com",
      replyTo: email,
      subject: `New contact message from ${name.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email}\n\nMessage:\n${message.trim()}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
