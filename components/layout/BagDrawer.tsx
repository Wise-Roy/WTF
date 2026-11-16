"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBag, bagItemKey, type BagItem } from "@/context/BagContext";
import { useAuth } from "@/context/AuthContext";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      close: () => void;
      on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void;
    };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BagDrawer() {
  const { items, isOpen, closeBag, removeItem, updateQuantity, clearBag, subtotal } =
    useBag();
  const { user } = useAuth();
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<{ orderNumber: string; items: BagItem[]; total: number } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const closeResult = () => { setPurchase(null); setFailure(null); };

  useEffect(() => {
    if (!purchase && !failure) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeResult();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [purchase, failure]);

  const handleCheckout = async () => {
    setMessage(null);
    if (!user) {
      closeBag();
      router.push("/sign-in");
      return;
    }

    setPaying(true);
    try {
      if (!(await loadRazorpay()) || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection.");
      }

      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, size: i.size, quantity: i.quantity })),
        }),
      });
      const created = await res.json();
      if (!res.ok || !created.success) throw new Error(created.message || "Could not start the payment");
      const order = created.data;
      // The bag is cleared on success, so keep what was bought for the thank-you modal
      const bought = items;

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "WTF",
        description: `Order ${order.orderNumber}`,
        prefill: { email: user.email },
        theme: { color: "#C6FF00" },
        handler: async (response: RazorpayResponse) => {
          try {
            const vr = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verified = await vr.json();
            if (!vr.ok || !verified.success) throw new Error(verified.message);
            setPurchase({ orderNumber: order.orderNumber, items: bought, total: Number(order.total) });
            clearBag();
            closeBag();
          } catch {
            setMessage(`Payment received but we could not confirm it. Contact us with order ${order.orderNumber}.`);
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      // Swap Razorpay's own error screen for ours; the bag is untouched so a retry starts fresh
      rzp.on("payment.failed", (r) => {
        rzp.close();
        setPaying(false);
        setFailure(r.error?.description || "");
      });
      rzp.open();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not start the payment");
      setPaying(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [shippingSettings, setShippingSettings] = useState({ fee: 500, freeAbove: 5000 });

  // Refetch on every open so admin changes show without a full page reload
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/footer", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const f = d.data?.footer;
        if (f?.shipping_fee != null && f?.free_shipping_threshold != null) {
          setShippingSettings({ fee: Number(f.shipping_fee), freeAbove: Number(f.free_shipping_threshold) });
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const shipping = subtotal >= shippingSettings.freeAbove ? 0 : shippingSettings.fee;
  const total = subtotal + shipping;
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60]"
          onClick={closeBag}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#FFF9D6] border-l border-[#1a1a1a]/10 z-[70] flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]/10">
          <h2 className="font-heading text-2xl uppercase tracking-wider text-[#1a1a1a]">
            Your Bag
          </h2>
          <button
            onClick={closeBag}
            className="w-9 h-9 border border-[#1a1a1a]/20 flex items-center justify-center text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEmpty ? (
            <p className="text-sm uppercase tracking-wider text-[#1a1a1a]/40 text-center mt-12">
              Bag is empty. Go get something.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={bagItemKey(item)}
                  className="flex gap-4 border border-[#1a1a1a]/10 p-3 bg-[#FFF3B0]"
                >
                  <div className="relative w-16 h-20 shrink-0 bg-[#FFF9D6] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] truncate">
                      {item.name}
                    </p>
                    {item.size && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/60 mt-1">
                        Size {item.size}
                      </p>
                    )}
                    <p className="text-sm font-bold text-[#1a1a1a] mt-1">
                      &#8377;{item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(bagItemKey(item), item.quantity - 1)
                        }
                        className="w-6 h-6 border border-[#1a1a1a]/20 flex items-center justify-center text-xs text-[#1a1a1a]/70 hover:border-[#C6FF00] hover:text-[#88AF00] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs w-6 text-center text-[#1a1a1a]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(bagItemKey(item), item.quantity + 1)
                        }
                        className="w-6 h-6 border border-[#1a1a1a]/20 flex items-center justify-center text-xs text-[#1a1a1a]/70 hover:border-[#C6FF00] hover:text-[#88AF00] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(bagItemKey(item))}
                    className="text-[#1a1a1a]/30 hover:text-[#1a1a1a] self-start transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-6 border-t border-[#1a1a1a]/10 space-y-3">
          <div className="flex justify-between text-xs uppercase tracking-wider text-[#1a1a1a]/70">
            <span>Subtotal</span>
            <span>&#8377;{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs uppercase tracking-wider text-[#1a1a1a]/70">
            <span>Shipping est.</span>
            <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div className="border-t border-dashed border-[#1a1a1a]/20 my-2" />
          <div className="flex justify-between text-sm uppercase tracking-wider font-bold text-[#1a1a1a]">
            <span>Total</span>
            <span>&#8377;{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          {message && (
            <p role="status" className="text-xs uppercase tracking-wider text-[#1a1a1a]/70 text-center">
              {message}
            </p>
          )}
          <button
            onClick={handleCheckout}
            disabled={isEmpty || paying}
            className={`w-full py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
              isEmpty || paying
                ? "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 cursor-not-allowed"
                : "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33]"
            }`}
          >
            {paying ? "Processing..." : "Checkout"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {(purchase || failure !== null) && (
          <motion.div
            className="fixed inset-0 z-80 flex items-center justify-center px-4 py-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeResult} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="purchase-title"
              className="relative w-full max-w-md bg-[#FFF9D6] border border-[#1a1a1a]/10 p-6 sm:p-8"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={closeResult}
                aria-label="Close"
                className="absolute top-4 right-4 w-9 h-9 border border-[#1a1a1a]/20 flex items-center justify-center text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/40 transition-colors"
              >
                <X size={16} />
              </button>

              {purchase ? (
                <>
                <div className="w-12 h-12 bg-[#C6FF00] flex items-center justify-center mb-5">
                  <Check size={24} className="text-[#1a1a1a]" />
                </div>
                <h2 id="purchase-title" className="font-heading text-3xl uppercase tracking-wider text-[#1a1a1a]">
                  Congratulations!
                </h2>
                <p className="text-sm text-[#1a1a1a]/70 mt-2">
                  Thank you for shopping with us. Your order is confirmed.
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/50 mt-4">
                  Order {purchase.orderNumber}
                </p>

                <div className="mt-5 space-y-3 max-h-64 overflow-y-auto">
                  {purchase.items.map((item) => (
                    <div key={bagItemKey(item)} className="flex gap-3 items-center border border-[#1a1a1a]/10 p-2 bg-[#FFF3B0]">
                      <div className="relative w-12 h-15 shrink-0 bg-[#FFF9D6] overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] truncate">{item.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/60 mt-1">
                          {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm uppercase tracking-wider font-bold text-[#1a1a1a] border-t border-dashed border-[#1a1a1a]/20 mt-5 pt-4">
                  <span>Total paid</span>
                  <span>&#8377;{purchase.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                <button
                  onClick={closeResult}
                  className="w-full mt-6 py-3 text-sm font-bold uppercase tracking-widest bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33] transition-colors"
                >
                  Keep shopping
                </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-red-800 flex items-center justify-center mb-5">
                    <AlertTriangle size={24} className="text-[#FFF9D6]" />
                  </div>
                  <h2 id="purchase-title" className="font-heading text-3xl uppercase tracking-wider text-[#1a1a1a]">
                    Payment failed
                  </h2>
                  <p className="text-sm text-[#1a1a1a]/70 mt-2">
                    Your payment failed. Please retry the payment. If any money was deducted, it will be refunded automatically.
                  </p>
                  {failure && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/50 mt-4">
                      {failure}
                    </p>
                  )}
                  <button
                    onClick={() => { closeResult(); handleCheckout(); }}
                    className="w-full mt-6 py-3 text-sm font-bold uppercase tracking-widest bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33] transition-colors"
                  >
                    Retry payment
                  </button>
                  <button
                    onClick={closeResult}
                    className="w-full mt-3 py-3 text-sm font-bold uppercase tracking-widest border border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#1a1a1a]/40 transition-colors"
                  >
                    Back to bag
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
