export interface ProductInput {
  prod_name: string;
  prod_price: number | string;
  prod_quantity: number | string;
  prod_description: string;
  prod_label: string;
  prod_rank: number | string;
  image: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateProduct(input: ProductInput): ValidationResult {
  const errors: Record<string, string> = {};

  // prod_name
  const name = (input.prod_name || "").trim();
  if (!name) errors.prod_name = "Name is required";
  else if (name.length < 2) errors.prod_name = "Name must be at least 2 characters";
  else if (name.length > 150) errors.prod_name = "Name must be at most 150 characters";

  // prod_price
  const price = Number(input.prod_price);
  if (!input.prod_price && input.prod_price !== 0) errors.prod_price = "Price is required";
  else if (isNaN(price) || price <= 0) errors.prod_price = "Price must be greater than 0";

  // prod_quantity
  const qty = Number(input.prod_quantity);
  if (isNaN(qty) || qty < 0) errors.prod_quantity = "Quantity must be 0 or more";
  else if (!Number.isInteger(qty)) errors.prod_quantity = "Quantity must be a whole number";

  // prod_description
  const desc = (input.prod_description || "").trim();
  if (!desc) errors.prod_description = "Description is required";
  else if (desc.length < 10) errors.prod_description = "Description must be at least 10 characters";
  else if (desc.length > 2000) errors.prod_description = "Description must be at most 2000 characters";

  // prod_label
  const label = (input.prod_label || "").trim();
  if (!label) errors.prod_label = "Label is required";
  else if (label.length > 50) errors.prod_label = "Label must be at most 50 characters";

  // prod_rank
  const rank = Number(input.prod_rank ?? 0);
  if (isNaN(rank) || rank < 0) errors.prod_rank = "Rank must be 0 or more";
  else if (!Number.isInteger(rank)) errors.prod_rank = "Rank must be a whole number";

  // image
  if (!Array.isArray(input.image) || input.image.length !== 3) {
    errors.image = "Exactly 3 images are required";
  } else if (input.image.some((i) => typeof i !== "string" || !i.trim())) {
    errors.image = "All 3 image URLs must be non-empty strings";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
