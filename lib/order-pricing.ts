/** Pure order maths — no database, so it can be checked on its own. */

/** What the client is allowed to send: what and how many, never the price. */
export interface OrderItemInput {
  id: string;
  size?: string;
  quantity: number;
}

/** A priced line, stored on the order so the price at purchase time is kept. */
export interface OrderLine {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export interface ShippingSettings {
  fee: number;
  freeAbove: number;
}

export const DEFAULT_SHIPPING: ShippingSettings = { fee: 500, freeAbove: 5000 };

const MAX_QUANTITY_PER_LINE = 10;

/** Same rule the bag drawer shows: free shipping once the subtotal clears the threshold. */
export function orderTotals(lines: OrderLine[], shipping: ShippingSettings) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const shippingFee = subtotal >= shipping.freeAbove ? 0 : shipping.fee;
  return { subtotal, shipping: shippingFee, total: subtotal + shippingFee };
}

/** Razorpay takes paise, and only whole ones. */
export function toPaise(amount: number): number {
  return Math.round(amount * 100);
}

export function normalizeItems(raw: unknown): OrderItemInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const items: OrderItemInput[] = [];
  for (const item of raw) {
    const id = typeof item?.id === "string" ? item.id.trim() : "";
    const quantity = Number(item?.quantity);
    if (!id) return null;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return null;
    }
    items.push({
      id,
      size: typeof item?.size === "string" ? item.size : "",
      quantity,
    });
  }
  return items;
}

/** Human-facing order reference; the uniqueness that matters is the row id. */
export function generateOrderNumber(): string {
  return `WTF-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}
