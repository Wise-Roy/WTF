import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// Without keys the client is useless, so fail loudly at the route instead of
// sending half-built requests to Razorpay.
export const razorpay =
  keyId && keySecret
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : null;

export const razorpayKeyId = keyId ?? "";

/** True only when the signature really came from Razorpay for this order+payment. */
export function isValidPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!keySecret || !orderId || !paymentId || !signature) return false;
  return validatePaymentVerification(
    { order_id: orderId, payment_id: paymentId },
    signature,
    keySecret
  );
}

// Razorpay decides test vs live purely by which key pair is in use
export const paymentMode: "test" | "live" = keyId?.startsWith("rzp_live_") ? "live" : "test";
