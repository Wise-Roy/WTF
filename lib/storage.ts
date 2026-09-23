import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "product-images";

/**
 * Upload product images to Supabase Storage.
 * Returns array of public URLs.
 * Falls back to keeping existing URLs if they're already valid paths.
 */
export async function uploadProductImages(
  productId: string,
  files: { name: string; data: Buffer; type: string }[]
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `${productId}/${i}-${file.name}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, file.data, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);

    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(path);

    urls.push(urlData.publicUrl);
  }

  return urls;
}

/**
 * Delete all images for a product from storage.
 */
export async function deleteProductImages(productId: string): Promise<void> {
  const { data: files } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(productId);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${productId}/${f.name}`);
    await supabaseAdmin.storage.from(BUCKET).remove(paths);
  }
}
