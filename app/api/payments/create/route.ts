import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { paymentMode, razorpay, razorpayKeyId } from "@/lib/razorpay";
import {
  generateOrderNumber,
  normalizeItems,
  priceOrder,
  toPaise,
} from "@/lib/orders";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!razorpay) {
    return NextResponse.json(
      { success: false, message: "Payments are not configured" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const items = normalizeItems(body?.items);
  if (!items) {
    return NextResponse.json({ success: false, message: "Invalid bag" }, { status: 400 });
  }

  const priced = await priceOrder(items);
  if ("error" in priced) {
    return NextResponse.json({ success: false, message: priced.error }, { status: 400 });
  }
  const { lines, subtotal, shipping, total } = priced.order;

  const orderNumber = generateOrderNumber();

  let rzpOrder;
  try {
    rzpOrder = await razorpay.orders.create({
      amount: toPaise(total),
      currency: "INR",
      receipt: orderNumber,
      notes: { user_id: session.id, email: session.email },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start the payment";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }

  // The row is written before the payment so a completed payment always has an
  // order to attach itself to, even if the browser dies mid-checkout.
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: session.id,
      order_number: orderNumber,
      status: "pending",
      items: lines,
      subtotal,
      shipping,
      total,
      currency: "INR",
      razorpay_order_id: rzpOrder.id,
      payment_mode: paymentMode,
    })
    .select("id, order_number, total")
    .single();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: rzpOrder.id,
      amount: toPaise(total),
      currency: "INR",
      keyId: razorpayKeyId,
      subtotal,
      shipping,
      total,
    },
  });
}
