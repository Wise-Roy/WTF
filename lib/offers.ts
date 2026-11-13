import { supabaseAdmin } from "@/lib/supabase-admin";

export type OfferPlacement = "modal" | "bar";

export interface OfferRow {
  is_enabled: boolean;
  header: string;
  product_id: string;
  end_time: string | null;
}

/** An offer shows on the site only while enabled, filled in, and not past its end time. */
export function isLiveOffer(offer: OfferRow, now: number = Date.now()): boolean {
  if (!offer.is_enabled) return false;
  if (!offer.header?.trim()) return false;
  if (!offer.product_id) return false;
  // Blank end_time means the offer never expires
  if (!offer.end_time) return true;
  const ends = new Date(offer.end_time).getTime();
  return Number.isNaN(ends) ? true : ends > now;
}

export interface OfferInput {
  is_enabled?: boolean;
  header?: string;
  description?: string;
  product_id?: string;
  discounted_price?: number | string;
  image_path?: string;
}

/**
 * Returns the first problem with an offer that is about to go live, or null.
 * Only the modal offer renders a description and an image, so only it requires them.
 */
export function offerValidationError(
  input: OfferInput,
  originalPrice: number,
  placement: OfferPlacement
): string | null {
  if (!input.is_enabled) return null;
  if (!input.header?.trim()) return "Header is required when offer is enabled";
  if (placement === "modal" && !input.description?.trim())
    return "Description is required when offer is enabled";
  if (!input.product_id) return "Product selection is required";
  const price = Number(input.discounted_price);
  if (!price || price <= 0) return "Discounted price must be greater than zero";
  if (price >= originalPrice) return "Discounted price must be lower than original product price";
  if (placement === "modal" && !input.image_path) return "Image is required when offer is enabled";
  return null;
}

export async function getProductPrice(productId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from("products")
    .select("prod_price")
    .eq("id", productId)
    .single();
  return data?.prod_price ?? 0;
}

async function setProductPrice(productId: string, price: number) {
  await supabaseAdmin
    .from("products")
    .update({ prod_price: price, updated_at: new Date().toISOString() })
    .eq("id", productId);
}

/**
 * Keeps the product's listed price in step with its offer: a live offer takes the product
 * down to its discounted price, and an offer that stops being live puts the original back.
 * Pass next = null when the offer is being deleted.
 *
 * shortcut: two live offers on the same product overwrite each other's price; add a
 * per-product uniqueness check if sales ever run overlapping offers.
 */
export async function syncOfferPrice(
  next: { is_enabled: boolean; product_id: string; discounted_price: number } | null,
  prev: { is_enabled: boolean; product_id: string; original_price: number } | null
) {
  const stillOnSameProduct = !!next?.is_enabled && next.product_id === prev?.product_id;
  if (prev?.is_enabled && prev.product_id && prev.original_price && !stillOnSameProduct) {
    await setProductPrice(prev.product_id, prev.original_price);
  }
  if (next?.is_enabled && next.product_id) {
    await setProductPrice(next.product_id, next.discounted_price);
  }
}
