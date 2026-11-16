import { supabaseAdmin } from "@/lib/supabase-admin";
import { isLiveOffer } from "@/lib/offers";
import {
  DEFAULT_SHIPPING,
  orderTotals,
  type OrderItemInput,
  type OrderLine,
  type ShippingSettings,
} from "@/lib/order-pricing";

export * from "@/lib/order-pricing";

type PricedOrder = {
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

/**
 * Prices a bag from the database only — the client never gets to say what
 * something costs. Returns an error message the route can hand back as 400.
 */
export async function priceOrder(
  items: OrderItemInput[]
): Promise<{ order: PricedOrder } | { error: string }> {
  const ids = [...new Set(items.map((i) => i.id))];

  const [{ data: products, error }, { data: offers }, { data: footer }] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("id, prod_name, prod_price, prod_quantity, prod_sizes")
      .in("id", ids),
    supabaseAdmin
      .from("offer_settings")
      .select("is_enabled, header, product_id, discounted_price, end_time")
      .in("product_id", ids),
    supabaseAdmin
      .from("footer_settings")
      .select("shipping_fee, free_shipping_threshold")
      .limit(1)
      .single(),
  ]);

  if (error) return { error: error.message };

  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  // A product on a live offer sells at the offer price, not the list price
  const offerPrice = new Map<string, number>();
  for (const offer of offers ?? []) {
    if (!isLiveOffer(offer)) continue;
    const price = Number(offer.discounted_price);
    if (!price || price <= 0) continue;
    const current = offerPrice.get(offer.product_id);
    if (current == null || price < current) offerPrice.set(offer.product_id, price);
  }

  // Quantities of the same product across sizes all come out of one stock count
  const wanted = new Map<string, number>();
  for (const item of items) {
    wanted.set(item.id, (wanted.get(item.id) ?? 0) + item.quantity);
  }

  const lines: OrderLine[] = [];
  for (const item of items) {
    const product = byId.get(item.id);
    if (!product) return { error: "One of the items is no longer available" };

    const sizes: string[] = Array.isArray(product.prod_sizes) ? product.prod_sizes : [];
    if (sizes.length > 0 && !sizes.includes(item.size ?? "")) {
      return { error: `Pick an available size for ${product.prod_name}` };
    }

    if ((wanted.get(item.id) ?? 0) > Number(product.prod_quantity)) {
      return { error: `${product.prod_name} is out of stock` };
    }

    lines.push({
      id: product.id,
      name: product.prod_name,
      size: item.size ?? "",
      price: offerPrice.get(product.id) ?? Number(product.prod_price),
      quantity: item.quantity,
    });
  }

  const shipping: ShippingSettings = {
    fee: Number(footer?.shipping_fee ?? DEFAULT_SHIPPING.fee),
    freeAbove: Number(footer?.free_shipping_threshold ?? DEFAULT_SHIPPING.freeAbove),
  };

  const totals = orderTotals(lines, shipping);
  if (totals.total <= 0) return { error: "Order total must be greater than zero" };

  return { order: { lines, ...totals } };
}
