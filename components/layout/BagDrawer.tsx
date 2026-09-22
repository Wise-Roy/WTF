"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { useBag } from "@/context/BagContext";

export default function BagDrawer() {
  const { items, isOpen, closeBag, removeItem, updateQuantity, subtotal } =
    useBag();

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

  const shipping = subtotal >= 5000 ? 0 : 500;
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
                  key={item.id}
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
                    <p className="text-sm font-bold text-[#1a1a1a] mt-1">
                      &#8377;{item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
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
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 border border-[#1a1a1a]/20 flex items-center justify-center text-xs text-[#1a1a1a]/70 hover:border-[#C6FF00] hover:text-[#88AF00] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
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
          <button
            disabled={isEmpty}
            className={`w-full py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
              isEmpty
                ? "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 cursor-not-allowed"
                : "bg-[#C6FF00] text-[#1a1a1a] hover:bg-[#d4ff33]"
            }`}
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}
