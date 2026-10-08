/**
 * Upload a file to Supabase Storage via signed URL.
 * Step 1: Get signed URL from our API (admin-gated)
 * Step 2: Upload file directly to Supabase (bypasses Vercel 4.5MB limit)
 */
export async function uploadFile(
  file: File,
  bucket: "products" | "about" | "musicians"
): Promise<string> {
  // Step 1: Get signed upload URL
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket,
      fileName: file.name,
      contentType: file.type,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Failed to get upload URL");
  }

  const { signedUrl, token, publicUrl } = json.data;

  // Step 2: Upload directly to Supabase
  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload failed: ${errText}`);
  }

  return publicUrl;
}
