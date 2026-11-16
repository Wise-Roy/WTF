import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";
import { isValidPaymentSignature } from "@/lib/razorpay";
import type { OrderLine } from "@/lib/orders";

const PURCHASE_INBOX = "hello@wxrshipthefumes.com";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

type PaidOrder = {
  user_id: string;
  order_number: string;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  paid_at: string;
  payment_mode: string | null;
};

/** Store notification plus the customer's receipt; one failing must not block the other. */
async function sendPurchaseEmails(order: PaidOrder, buyerEmail: string, siteUrl: string) {
  const [{ data: profile }, { data: user }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("name, house_flat, street, address_line1, city, state, zip, country")
      .eq("user_id", order.user_id)
      .maybeSingle(),
    supabaseAdmin.from("users").select("full_name").eq("id", order.user_id).maybeSingle(),
  ]);
  const name = profile?.name || user?.full_name || buyerEmail;
  const isTest = order.payment_mode !== "live";
  const lines = order.items ?? [];
  const lineLabel = (l: OrderLine) => `${l.name}${l.size ? ` (${l.size})` : ""}`;
  const products = lines
    .map((l) => `- ${lineLabel(l)} x${l.quantity} — ₹${l.price * l.quantity}`)
    .join("\n");

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sends: Promise<unknown>[] = [
    resend.emails.send({
      from: PURCHASE_INBOX,
      to: PURCHASE_INBOX,
      subject: `${isTest ? "[TEST] " : ""}New purchase ${order.order_number} — ₹${order.total} by ${name}`,
      text:
        (isTest ? "TEST PAYMENT — no real money was charged.\n\n" : "") +
        `Name: ${name}\nEmail: ${buyerEmail}\nOrder: ${order.order_number}\n\nProducts:\n${products}\n\nAmount: ₹${order.total}`,
    }),
  ];

  const templateId = process.env.RESEND_PURCHASE_TEMPLATE_ID;
  if (!templateId) {
    console.error("RESEND_PURCHASE_TEMPLATE_ID not set; customer receipt skipped");
  } else {
    const address = [
      profile?.house_flat, profile?.street, profile?.address_line1,
      profile?.city, profile?.state, profile?.zip, profile?.country,
    ].filter(Boolean).join(", ");

    sends.push(
      resend.emails.send({
        from: PURCHASE_INBOX,
        to: buyerEmail,
        subject: `${isTest ? "[TEST] " : ""}Thanks for your order ${order.order_number}`,
        // shortcut: the template has one product row, so multi-item orders are joined into it; add a loop in the template to list rows
        template: {
          id: templateId,
          variables: {
            first_name: name.includes("@") ? "there" : name.split(" ")[0],
            order_number: order.order_number,
            order_date: new Date(order.paid_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
            }),
            product_name: lines.map(lineLabel).join(", "),
            quantity: lines.map((l) => l.quantity).join(", "),
            price: lines.map((l) => inr(l.price * l.quantity)).join(", "),
            subtotal: inr(order.subtotal),
            shipping_cost: Number(order.shipping) === 0 ? "FREE" : inr(order.shipping),
            tax: inr(0),
            order_total: inr(order.total),
            shipping_address: address || "Not provided — we will contact you",
            order_url: `${siteUrl}/profile`,
          },
        },
      })
    );
  }

  const results = await Promise.allSettled(sends);
  for (const r of results) {
    const error = r.status === "rejected" ? r.reason : (r.value as { error?: unknown }).error;
    if (error) console.error("Purchase email failed:", error);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const razorpayOrderId = String(body?.razorpay_order_id ?? "");
  const razorpayPaymentId = String(body?.razorpay_payment_id ?? "");
  const signature = String(body?.razorpay_signature ?? "");

  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    return NextResponse.json(
      { success: false, message: "Missing payment details" },
      { status: 400 }
    );
  }

  // The order must belong to the caller, so one user cannot settle another's order
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, status, total")
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("user_id", session.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
  }
  if (order.status === "paid") {
    // Razorpay's handler can fire twice; the second one is not a failure
    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.order_number, status: "paid" },
    });
  }

  if (!isValidPaymentSignature(razorpayOrderId, razorpayPaymentId, signature)) {
    await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 400 }
    );
  }

  // Only the request that flips pending -> paid gets a row back, so a replayed
  // verify cannot send the purchase email twice.
  const { data: paid, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .neq("status", "paid")
    .select("id, user_id, order_number, status, items, subtotal, shipping, total, paid_at, payment_mode")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
  }
  if (!paid) {
    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.order_number, status: "paid" },
    });
  }

  // The payment is already captured; a mail outage must not look like a failed checkout
  try {
    await sendPurchaseEmails(
      { ...paid, subtotal: Number(paid.subtotal), shipping: Number(paid.shipping), total: Number(paid.total) },
      // Verify only matches orders owned by session.id, so this is the buyer's own address
      session.email,
      req.nextUrl.origin
    );
  } catch (err) {
    console.error("Purchase email failed:", err);
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId: paid.id,
      orderNumber: paid.order_number,
      status: paid.status,
      total: Number(paid.total),
    },
  });
}
