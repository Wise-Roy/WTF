import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { isValidEmail, INVALID_EMAIL_MESSAGE } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: INVALID_EMAIL_MESSAGE }, { status: 400 });
  }

  try {
    // Constructed per request: module-level init throws at build when key is absent.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "hello@wxrshipthefumes.com",
      to: email,
      subject: "Welcome to the Cult",
      template: {
        id: process.env.RESEND_TEMPLATE_ID!,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
