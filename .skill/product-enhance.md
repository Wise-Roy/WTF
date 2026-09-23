19. Admin Dashboard

Create:

/admin/products

The dashboard should provide:

Products

[ + Create Product ]

Product List

Each product row/card should show:

Image
Name
Price
Quantity
Label
Rank
Created Date
Actions

Actions:

Edit
Delete
20. Create Product

Admin should be able to create a product with:

Product Name
Price
Quantity
Description
Label
Rank
Image 1
Image 2
Image 3

Validate everything on both:

frontend
backend

Frontend validation is for user experience.

Backend validation is the source of truth.

21. Edit Product

Admin can edit:

name
price
quantity
description
label
rank
images

Show the existing images before uploading/replacing them.

Ensure exactly 3 images exist before saving.

22. Delete Product

Admin can delete products.

Before deletion, show a confirmation:

Are you sure you want to delete this product?

After successful deletion:

Remove it from the admin list.
Remove it from public product queries.
Show a success notification.

Handle errors gracefully.

23. Image Handling

Do not store raw image binaries directly inside the database.

Store image URLs/paths.

Recommended structure:

Product
 ├── image[0]
 ├── image[1]
 └── image[2]

If the project already has a storage provider, use the existing storage architecture.

Otherwise create a clean abstraction:

uploadProductImages()
deleteProductImages()

so storage implementation can be changed later.

24. Validation Rules

Create a shared product validation schema.

Prefer a schema-validation library already used by the project.

Example conceptual schema:

ProductSchema = {
  id: UUID,

  image: [
    string,
    string,
    string
  ],

  prod_name: string
    .min(2)
    .max(150),

  prod_price: number
    .positive(),

  prod_quantity: integer
    .min(0),

  prod_description: string
    .min(10)
    .max(2000),

  prod_label: string
    .min(1)
    .max(50),

  prod_rank: integer
    .min(0)
}

Use the same validation rules across:

frontend forms
backend API
database constraints where applicable
25. Error Handling

API responses should have consistent error structures.

Example:

{
  "success": false,
  "message": "Product validation failed",
  "errors": {
    "prod_price": "Price must be greater than 0"
  }
}

Frontend should convert these into readable UI messages.

Do not expose stack traces or internal database errors to users.

26. Loading States

Implement loading states for:

Product catalogue
Product detail
Admin product list
Create product
Edit product
Delete product
Image upload

Use skeletons/spinners that fit the existing website aesthetic.

Avoid layout jumps.

27. Empty States

Handle:

No products
No products for selected label
No search/filter results
No ranked products

Example:

NO PRODUCTS YET

Keep the design minimal and consistent with the existing brand.

28. Responsive Behavior

The product card interaction must work across:

Desktop
Tablet
Mobile

Important:

The cursor-based reveal is primarily a desktop interaction.

On touch devices, implement an appropriate fallback.

For mobile:

Do not depend on cursor movement.
Use tap/swipe interaction or a clean static image presentation.
Keep VIEW and ADD TO CART accessible.
Never make the product unusable because the parallax effect isn't available.
29. Performance Requirements

This interaction will exist across multiple product cards, so performance is critical.

Implement:

Lazy loading for product images.
Responsive image sizes.
Proper image compression.
Avoid loading unnecessarily large original images.
Use loading="lazy" where appropriate.
Use framework image optimization if available.
Avoid unnecessary React re-renders.
Keep cursor calculations isolated to the active product card.
Use requestAnimationFrame if continuously updating the reveal.
Use GPU-friendly properties.
Do not run heavy animation logic simultaneously for every card.

Only the card currently receiving pointer interaction should perform intensive reveal calculations.

30. Component Architecture

Create reusable components.

Suggested structure:

components/
  products/
    ProductCard
    ProductGrid
    ProductFilters
    ProductActions
    ProductImageReveal
    ProductForm
    ProductList
    ProductSkeleton

Admin:

admin/
  products/
    page
    ProductTable
    ProductForm
    ProductDeleteDialog

Backend:

products/
  product.controller
  product.service
  product.repository
  product.validation
  product.routes

Adapt this structure to the existing project conventions instead of blindly creating duplicate architecture.

31. Product Card State Machine

The product card should conceptually have these states:

IDLE
 ↓
POINTER ENTER
 ↓
DETECT ENTRY DIRECTION
 ↓
REVEAL IMAGE
 ↓
TRACK POINTER
 ↓
CENTER ACTIONS
 ↓
POINTER EXIT
 ↓
RESET

On pointer exit:

Smoothly return to the primary image.
Hide VIEW / ADD TO CART.
Reset reveal state.

The reset should feel animated rather than abruptly snapping back.

32. Important Interaction Details

The effect should feel like the user is physically uncovering different photographs.

Avoid:

simple image fade
simple image swap
generic zoom
generic 3D tilt

The desired effect is:

cursor movement
       ↓
direction detection
       ↓
dynamic image clipping
       ↓
image revealed toward cursor

The three images should feel like different photographic surfaces of the same product.

33. Accessibility

Ensure:

Product cards are keyboard accessible.
VIEW and ADD TO CART are actual buttons/links.
Images have useful alt text.
Do not depend exclusively on hover to access product actions.
Respect prefers-reduced-motion.

If:

prefers-reduced-motion: reduce

is enabled, disable/reduce the cursor animation and provide a static accessible product card.

34. Security

Important:

The frontend must NEVER determine whether a user is an admin.

This is invalid:

if (isAdmin) {
   showDeleteButton();
}

as the only security mechanism.

The backend must independently verify authentication and authorization for:

POST /products
PUT /products/:id
DELETE /products/:id

The frontend hiding buttons is only a UX feature.

35. Ranking Management

The admin dashboard should make ranking easy to manage.

Provide:

Rank

as an editable field.

Optionally provide:

↑
↓

controls for easier ranking.

The admin must be able to determine which products appear among the highest-priority products on the homepage.

The homepage selection must always be calculated dynamically from database data.

Do not hardcode:

product IDs

into the homepage.

36. Database Indexes

Add indexes for frequently queried fields.

At minimum consider:

created_at
prod_label
prod_rank

This is particularly important because the application frequently needs:

latest products
ranked products
products filtered by label
37. API Response Shape

Keep responses predictable.

Example:

{
  "success": true,
  "data": {
    "products": []
  }
}

Single product:

{
  "success": true,
  "data": {
    "product": {}
  }
}

Errors:

{
  "success": false,
  "message": "Unable to fetch products"
}

Follow the existing API response conventions if the project already has them.