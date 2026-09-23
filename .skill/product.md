# Product Management + Interactive Product Card Implementation

## 1. Objective

Implement a complete product-management system for the existing website.

The implementation must cover:

1. Interactive 3-image product cards with cursor-based parallax/reveal effects.
2. Product database/table with proper validation.
3. Product APIs for public product browsing.
4. Admin-only product management.
5. Admin dashboard for creating, editing, deleting and ranking products.
6. Homepage showing the latest/top-ranked 6 products.
7. /shop section showing the complete product catalogue.
8. Product filtering based on `prod_label`.
9. Preserve the existing website's visual identity and color theme.

Do **not** redesign the entire website. Integrate this system into the existing design language.

---

# 2. Existing Visual Theme

Maintain the existing website theme:

* Background: `#FFF9D6` — warm beige/cream
* Primary/navigation color: `#DF2877` — vibrant pink
* CTA/accent: `#C6FF00` — neon lime
* Use black/dark text where required for readability.
* Keep the visual language bold, modern, fashion-oriented and experimental.
* Product cards should feel premium/editorial rather than like generic e-commerce cards.
* Use smooth animations and generous whitespace.
* Preserve the existing typography and spacing system already implemented in the project.

Do not introduce random colors unless required for accessibility or functional states.

---

# 3. Product Data Model

Create a `products` table.

Recommended schema:

```text
products
├── id
├── image
├── prod_name
├── prod_price
├── prod_quantity
├── prod_description
├── prod_label
├── prod_rank
├── created_at
└── updated_at
```

## Fields

### `id`

* UUID or equivalent database-generated unique identifier.
* Primary key.
* Automatically generated.
* Cannot be manually duplicated.

### `image`

Array containing exactly 3 product image URLs.

Example:

```json
[
  "/products/product-front.jpg",
  "/products/product-back.jpg",
  "/products/product-detail.jpg"
]
```

Validation:

* Must contain exactly 3 images.
* Every image must be a valid URL/path.
* All 3 positions have semantic meaning:

```text
image[0] = primary/default image
image[1] = secondary reveal image
image[2] = tertiary/side reveal image
```

Do not allow a product to be published without all 3 images.

### `prod_name`

* Required.
* String.
* Minimum length: 2 characters.
* Maximum length: 150 characters.
* Trim whitespace.
* Cannot be empty.

### `prod_price`

* Required.
* Positive numeric/decimal value.
* Must be greater than 0.
* Store as a precise decimal/currency-compatible database type rather than floating-point if supported.

Example:

```text
₹2499.00
```

### `prod_quantity`

* Required.
* Integer.
* Minimum: 0.
* Represents available inventory.
* Do not allow negative quantities.

### `prod_description`

* Required.
* Text.
* Minimum length: 10 characters.
* Maximum length: 2000 characters.

### `prod_label`

* Required.
* String/enumerated category label.
* Examples:

```text
New
Featured
Oversized
T-Shirt
Hoodie
Limited
Drop
Sale
```

The implementation should make labels easy to extend.

Do not hardcode the frontend filter list independently from the backend.

The frontend should obtain the available labels/categories from the product data or a dedicated category endpoint.

### `prod_rank`

* Integer.
* Required or default to a neutral value such as `0`.
* Used to determine product ordering/ranking.
* Rank `1` represents the highest-priority product.
* Admin can modify ranking.

### `created_at`

Automatically generated timestamp.

### `updated_at`

Automatically updated whenever the product changes.

---

# 4. Product Ordering Logic

Implement two concepts:

## Latest Products

Latest products are determined using:

```text
created_at DESC
```

## Ranked Products

Admin can explicitly assign a rank.

Lower rank number = higher priority.

Example:

```text
rank 1 → highest priority
rank 2 → second priority
rank 3 → third priority
```

Do not create duplicate ranks unless intentionally supported.

Prefer enforcing unique ranks for active ranked products.

If rank uniqueness is implemented, the admin interface must gracefully handle rank changes.

Example:

If:

```text
Product A → rank 1
Product B → rank 2
```

and admin changes Product B to rank 1, automatically resolve the conflict rather than silently creating duplicate ranking.

---

# 5. Homepage Product Section

The The Latest Drop section must display exactly the **top 6 products**.

Primary ordering:

```text
prod_rank ASC
```

Then use:

```text
created_at DESC
```

as the secondary ordering.

If fewer than 6 ranked products exist, fill the remaining slots using the latest available products.

Do not display duplicate products.

Example:

```text
1. Rank 1
2. Rank 2
3. Rank 3
4. Rank 4
5. Rank 5
6. Rank 6
```

The actual implementation should dynamically calculate this rather than hardcoding product IDs.

---

# 6. Full Product Catalogue

On the About/Product page, display **all available products**.

Products should use the same interactive product card component as the homepage.

Add a filter/navigation section above the products.

Example:

```text
ALL    NEW    OVERSIZED    T-SHIRTS    HOODIES    LIMITED
```

`ALL` should show every product.

Selecting a label should only display products whose `prod_label` matches that label.

Filtering should happen without unnecessarily reloading the entire page.

Use URL query parameters where appropriate:

```text
/products?label=Hoodie
```

This makes filtering shareable and improves navigation.

---

# 7. Interactive 3-Image Product Card

This is the most important frontend interaction.

Each product has exactly three images:

```text
image[0] → Default
image[1] → Vertical reveal
image[2] → Horizontal/side reveal
```

The card should initially display:

```text
IMAGE 1
```

---

# 8. Cursor-Based Image Reveal

Create a smooth, continuous image-reveal interaction based on the cursor's position inside the product card.

The interaction must determine:

```text
cursor position
+
cursor entry direction
+
distance from card edges
```

and use that information to reveal the appropriate image.

Do NOT implement this as simple hover swapping.

The effect should feel like the cursor is physically revealing another image underneath the primary image.

---

# 9. Vertical Reveal — Image 2

When the cursor approaches/enters from the top:

```text
TOP
 ↓
cursor
 ↓
BOTTOM
```

start revealing `image[1]` from the top.

The reveal boundary should follow the cursor position.

Conceptually:

```text
┌─────────────────────┐
│ IMAGE 2             │
│ IMAGE 2             │ ← cursor
├─────────────────────┤
│ IMAGE 1             │
│ IMAGE 1             │
└─────────────────────┘
```

As the cursor moves downward 

```text
Image 2 reveal area
        ↓
        ↓
        ↓
```

continues expanding downward till the end or till cursor stops or leaves . 

similarly if cursor start from below start reverse reveling 
Start reveling cursor enters from the bottom:

```text
┌─────────────────────┐
│ IMAGE 1             │
│ IMAGE 1             │
├─────────────────────┤
│ IMAGE 2             │
│ IMAGE 2             │ ← cursor
└─────────────────────┘
```

Image 2 should reveal upward from the bottom.

Therefore:

### Cursor enters from TOP

Reveal:

```text
image[1]
top → cursor
```

### Cursor enters from BOTTOM

Reveal:

```text
image[1]
bottom → cursor
```

The reveal should smoothly track the cursor.

---

# 10. Horizontal Reveal — Image 3

Use the same principle horizontally for `image[2]`.

When the cursor enters from the left:

```text
LEFT → cursor
```

reveal `image[2]` from the left toward the cursor.

Conceptually:

```text
┌───────────────┬──────────┐
│ IMAGE 3       │ IMAGE 1  │
│ IMAGE 3       │ IMAGE 1  │
│ ← cursor      │          │
└───────────────┴──────────┘
```

When the cursor enters from the right:

```text
cursor ← RIGHT
```

reveal `image[2]` from the right toward the cursor.

```text
┌──────────┬───────────────┐
│ IMAGE 1  │ IMAGE 3       │
│          │       cursor → │
└──────────┴───────────────┘
```

---

# 11. Entry Direction Detection

Track the cursor's previous position relative to the card.

Calculate:

```text
deltaX
deltaY
```

and determine the dominant direction.

Conceptually:

```javascript
if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // horizontal interaction
} else {
    // vertical interaction
}
```

Determine:

```text
TOP
BOTTOM
LEFT
RIGHT
```

entry/reveal direction.

Do not rely only on `mouseenter`.

The effect should react continuously as the cursor moves.

---

# 12. Reveal Implementation

Prefer GPU-friendly CSS techniques.

Possible implementation:

```tex
```

# 13. Button at center
Need two buttons View and Add to cart at center of every product card. on clicking view should redirect to endpoint of /get/product_id where its description can be showed. add to cart as name specifies. will implment cart in future