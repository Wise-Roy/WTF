# Clothing Brand Backend Architecture — Next.js + Supabase

## 1. Objective

Build a production-ready backend for a clothing e-commerce website using:

- **Next.js App Router** as the full-stack framework
- **Next.js Route Handlers** for HTTP APIs
- **Supabase PostgreSQL** as the database
- **Supabase Auth** for authentication
- **Supabase Storage** for product/testimonial images
- **Supabase Row Level Security (RLS)** for authorization at the database layer
- TypeScript throughout
- Zod for request validation
- Modular, atomic, reusable service/repository architecture

The initial backend scope contains four domains:

1. Products
2. Users, cart and orders
3. Testimonials
4. Offers of the Day

There must also be an **admin system** that allows authorized administrators to manage products, offers and testimonials.

---

# 2. Core Architecture Principles

The backend must follow these principles:

### 2.1 Separation of concerns

Do not put database queries, validation, business logic and HTTP response handling inside the same route handler.

Use this flow:

```text
HTTP Request
    ↓
Route Handler
    ↓
Authentication / Authorization
    ↓
Zod Validation
    ↓
Service Layer
    ↓
Repository / Supabase Data Access
    ↓
Supabase PostgreSQL
```

For example:

```text
POST /api/products
    ↓
products.route.ts
    ↓
requireAdmin()
    ↓
CreateProductSchema.parse()
    ↓
productService.createProduct()
    ↓
productRepository.create()
    ↓
Supabase
```

### 2.2 Atomic modules

Each domain should be independently understandable and reusable.

Recommended domains:

```text
products
cart
orders
users
testimonials
offers
admin
auth
```

Avoid one large `utils.ts`, `service.ts`, or `api.ts`.

### 2.3 Database is the source of truth

Do not trust the frontend for:

- price
- quantity
- user identity
- admin permissions
- order totals
- discount calculations
- stock availability

The backend must recalculate and validate these values.

---

# 3. Recommended Project Structure

```text
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts
│       │   ├── logout/
│       │   │   └── route.ts
│       │   └── me/
│       │       └── route.ts
│       │
│       ├── products/
│       │   ├── route.ts
│       │   └── [productId]/
│       │       └── route.ts
│       │
│       ├── cart/
│       │   ├── route.ts
│       │   └── items/
│       │       ├── route.ts
│       │       └── [itemId]/
│       │           └── route.ts
│       │
│       ├── orders/
│       │   ├── route.ts
│       │   └── [orderId]/
│       │       └── route.ts
│       │
│       ├── testimonials/
│       │   ├── route.ts
│       │   └── [testimonialId]/
│       │       └── route.ts
│       │
│       ├── offers/
│       │   ├── route.ts
│       │   └── [offerId]/
│       │       └── route.ts
│       │
│       └── admin/
│           ├── products/
│           ├── testimonials/
│           └── offers/
│
├── modules/
│   ├── products/
│   │   ├── product.types.ts
│   │   ├── product.schemas.ts
│   │   ├── product.repository.ts
│   │   ├── product.service.ts
│   │   └── product.mapper.ts
│   │
│   ├── cart/
│   │   ├── cart.types.ts
│   │   ├── cart.schemas.ts
│   │   ├── cart.repository.ts
│   │   └── cart.service.ts
│   │
│   ├── orders/
│   │   ├── order.types.ts
│   │   ├── order.schemas.ts
│   │   ├── order.repository.ts
│   │   └── order.service.ts
│   │
│   ├── users/
│   │   ├── user.types.ts
│   │   ├── user.schemas.ts
│   │   ├── user.repository.ts
│   │   └── user.service.ts
│   │
│   ├── testimonials/
│   │   ├── testimonial.types.ts
│   │   ├── testimonial.schemas.ts
│   │   ├── testimonial.repository.ts
│   │   └── testimonial.service.ts
│   │
│   ├── offers/
│   │   ├── offer.types.ts
│   │   ├── offer.schemas.ts
│   │   ├── offer.repository.ts
│   │   └── offer.service.ts
│   │
│   └── admin/
│       ├── admin.types.ts
│       ├── admin.service.ts
│       └── admin.authorization.ts
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── browser.ts
│   │   └── admin.ts
│   ├── auth/
│   │   ├── require-user.ts
│   │   └── require-admin.ts
│   ├── errors/
│   │   ├── app-error.ts
│   │   └── error-handler.ts
│   └── pagination/
│       └── pagination.ts
│
├── types/
│   ├── api.ts
│   └── database.ts
│
└── constants/
    └── enums.ts
```

The exact names can change, but the architectural separation must remain.

---

# 4. Database Architecture

Use Supabase PostgreSQL.

Recommended tables:

```text
profiles
products
product_images
carts
cart_items
orders
order_items
addresses
testimonials
offers
admin_users
```

Supabase Auth owns authentication identities.

Do **not** create a custom `users.password` column.

---

# 5. Users and Authentication

## 5.1 Supabase Auth

Use:

```text
auth.users
```

for:

- email
- encrypted/password authentication
- authentication identity
- sessions
- refresh tokens
- password reset

The application database should reference:

```text
auth.users.id
```

through a public profile table.

---

# 6. Profiles Table

Recommended fields:

```text
profiles
---------
id                  UUID PK
username            VARCHAR(30) UNIQUE NOT NULL
display_name        VARCHAR(100)
email               TEXT
phone               VARCHAR(20)
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### Constraints

`username`:

- 3–30 characters
- lowercase recommended
- letters, numbers, `_` and `.` only
- unique

`display_name`:

- maximum 100 characters

`phone`:

- store in normalized international format where possible
- maximum 20 characters

Email should remain synchronized with Supabase Auth.

Do not allow clients to arbitrarily modify another user's profile.

---

# 7. Addresses

Use a separate address table instead of putting one address directly on `profiles`.

```text
addresses
---------
id
user_id
full_name
phone
address_line_1
address_line_2
city
state
postal_code
country
is_default
created_at
updated_at
```

Recommended constraints:

```text
full_name       2–100 chars
address_line_1  1–200 chars
address_line_2  0–200 chars
city            1–100 chars
state           1–100 chars
postal_code     3–20 chars
country         2–100 chars
phone           max 20 chars
```

A user may have multiple addresses.

---

# 8. Products

The product model is the most important catalog entity.

Recommended structure:

```text
products
--------
id
name
slug
category_id
description
price
compare_at_price
currency
sku
quantity
trend_label
trend_score
status
created_at
updated_at
```

## Product fields

### `name`

```text
VARCHAR(150)
NOT NULL
```

Constraints:

- 2–150 characters
- trim whitespace
- cannot be empty

Example:

```text
Oversized Essential Black Tee
```

### `slug`

```text
VARCHAR(180)
UNIQUE
NOT NULL
```

Example:

```text
oversized-essential-black-tee
```

Generate server-side.

### `description`

Use `TEXT`.

Constraints:

- minimum 10 characters for published products
- maximum 5,000 characters

### `price`

Use:

```text
NUMERIC(10,2)
```

Never use floating-point numbers for money.

Constraints:

```text
price >= 0
```

### `compare_at_price`

Optional original price.

Example:

```text
price = 1499
compare_at_price = 1999
```

Constraint:

```text
compare_at_price >= price
```

when provided.

### `currency`

Use:

```text
CHAR(3)
DEFAULT 'INR'
```

Store ISO currency codes.

### `sku`

Unique product identifier.

Example:

```text
WT-TEE-BLK-001
```

Maximum 50 characters.

### `quantity`

Represents available inventory.

```text
INTEGER
NOT NULL
DEFAULT 0
```

Constraint:

```text
quantity >= 0
```

Never allow negative stock.

---

# 9. Product Sizes

Because this is a clothing brand, size should not be a single free-text field.

Use a separate product variants table.

```text
product_variants
----------------
id
product_id
size
color
sku
price
quantity
image_id
created_at
updated_at
```

Recommended size enum:

```text
XS
S
M
L
XL
XXL
XXXL
```

This allows:

```text
Black T-Shirt
    ├── S  → 10 units
    ├── M  → 15 units
    ├── L  → 20 units
    └── XL → 8 units
```

This is substantially better than storing:

```text
size = "M,L,XL"
quantity = 53
```

because inventory needs to be tracked per purchasable variant.

---

# 10. Product Images

Do not store image binary data inside PostgreSQL.

Use Supabase Storage.

Database:

```text
product_images
--------------
id
product_id
storage_path
alt_text
sort_order
is_primary
created_at
```

Images should be stored in a dedicated bucket:

```text
product-images
```

Recommended image rules:

- JPEG, PNG or WebP
- validate MIME type
- validate file size
- generate predictable storage paths
- never trust the filename supplied by the browser
- use signed/public URLs appropriately
- delete orphaned images

Example storage path:

```text
products/{product_id}/{uuid}.webp
```

---

# 11. Product Categories

Create a category table instead of hardcoding categories in the frontend.

```text
categories
----------
id
name
slug
description
is_active
created_at
updated_at
```

Examples:

```text
T-Shirts
Shirts
Hoodies
Jackets
Pants
Accessories
```

Category name:

```text
2–80 characters
```

Slug must be unique.

---

# 12. Product Trend

For this clothing store, use two fields:

```text
trend_label
trend_score
```

### `trend_label`

Recommended enum:

```text
NONE
NEW
TRENDING
BEST_SELLER
```

### `trend_score`

```text
INTEGER
0–100
```

Why use both?

`trend_label` controls the merchandising label displayed to customers.

`trend_score` allows products to be sorted by trend without changing the label.

Example:

```text
Product A
trend_label = TRENDING
trend_score = 92
```

The frontend can display:

```text
TRENDING
```

while product filtering/sorting can use:

```text
trend_score DESC
```

Do not allow the frontend to assign arbitrary trend scores. Admin-only modification.

---

# 13. Product Status

Use:

```text
DRAFT
ACTIVE
ARCHIVED
```

Only `ACTIVE` products should normally appear in the public product listing.

---

# 14. Product Filtering

The API must support server-side filtering.

Recommended endpoint:

```http
GET /api/products
```

Supported query parameters:

```text
category
size
minPrice
maxPrice
trend
search
sort
page
limit
```

Example:

```http
GET /api/products?category=tshirts&size=M&minPrice=999&maxPrice=1999&sort=price_asc&page=1&limit=20
```

Supported sorting:

```text
newest
price_asc
price_desc
trend
name_asc
```

Do not accept arbitrary SQL/order-by values from users.

Map allowed values explicitly.

---

# 15. Pagination

All collection endpoints should be paginated.

Example response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Recommended maximum:

```text
limit <= 100
```

Default:

```text
limit = 20
```

Never allow unlimited product queries.

---

# 16. Cart

A cart belongs to exactly one authenticated user.

```text
carts
-----
id
user_id
created_at
updated_at
```

Constraint:

```text
UNIQUE(user_id)
```

A cart contains:

```text
cart_items
----------
id
cart_id
product_id
variant_id
quantity
created_at
updated_at
```

Constraints:

```text
quantity >= 1
```

The backend must verify:

```text
variant exists
variant is active
variant has sufficient inventory
```

before adding/updating a cart item.

---

# 17. Cart Rules

The frontend must never determine the final price.

When reading the cart:

```text
Cart Item
    ↓
Product/Variant
    ↓
Current valid price
    ↓
Calculate subtotal
```

When checkout occurs, recalculate everything again.

Do not trust:

```json
{
  "price": 999,
  "quantity": 3
}
```

from the browser.

Only accept:

```json
{
  "variantId": "...",
  "quantity": 3
}
```

and obtain the price from the database.

---

# 18. Orders

Orders must be immutable historical records.

```text
orders
------
id
user_id
status
subtotal
discount
shipping_fee
total
currency
shipping_address_snapshot
created_at
updated_at
```

Recommended order statuses:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

Do not calculate old orders from current product prices.

Store the historical purchase information inside `order_items`.

---

# 19. Order Items

```text
order_items
-----------
id
order_id
product_id
variant_id
product_name
sku
size
color
unit_price
quantity
total_price
```

The product name, SKU and price are intentionally duplicated here.

Reason:

If the product changes from:

```text
Oversized Tee
₹1,499
```

to:

```text
Premium Oversized Tee
₹1,999
```

the old order must still show:

```text
Oversized Tee
₹1,499
```

---

# 20. Checkout Transaction

Checkout must be treated as a transactional operation.

Conceptually:

```text
1. Authenticate user
2. Load cart
3. Lock/check inventory
4. Validate each variant
5. Calculate product totals
6. Calculate discounts
7. Calculate shipping
8. Create order
9. Create order items
10. Reduce inventory
11. Clear cart
```

These operations should be performed atomically where possible.

Never:

```text
Create order
↓
Later reduce stock
```

without protecting against concurrent purchases.

Inventory must not become negative.

---

# 21. Testimonials

Recommended table:

```text
testimonials
------------
id
user_id
name
content
rating
image_path
status
is_featured
created_at
updated_at
```

`user_id` may be nullable if testimonials can be submitted without an account.

## Content constraints

```text
name:
2–100 chars

content:
10–1,000 chars

rating:
1–5 integer
```

Recommended status:

```text
PENDING
APPROVED
REJECTED
```

Public API should only return:

```text
APPROVED
```

Testimonials should not immediately become publicly visible unless that is explicitly desired.

Admin controls:

```text
approve
reject
feature/unfeature
edit
delete
```

---

# 22. Offers of the Day

Use an `offers` table.

```text
offers
------
id
title
description
discount_type
discount_value
product_id
category_id
start_at
end_at
is_active
created_at
updated_at
```

Recommended discount types:

```text
PERCENTAGE
FIXED_AMOUNT
```

Examples:

```text
20% OFF
```

or:

```text
₹300 OFF
```

Constraints:

### Percentage

```text
discount_value > 0
discount_value <= 100
```

### Fixed amount

```text
discount_value > 0
```

Do not allow discounts greater than the applicable product/order value.

---

# 23. Offer Scheduling

An offer should be active only when:

```text
is_active = true
AND
start_at <= current_time
AND
end_at >= current_time
```

Use database timestamps in UTC.

Convert to local timezone only for presentation.

Prevent:

```text
end_at <= start_at
```

---

# 24. Admin Authentication

Do not hardcode an admin username/password inside source code.

Do not create:

```text
if username === "admin" && password === "admin123"
```

Instead:

```text
Supabase Auth
      ↓
Authenticated User
      ↓
Profile / Role
      ↓
ADMIN
```

Recommended profile role:

```text
CUSTOMER
ADMIN
```

For stronger security, maintain admin authorization server-side and enforce it with RLS.

---

# 25. Admin Access

There should be one initially seeded admin account.

The admin account should be created through a secure setup/seed process.

Credentials must be provided through environment variables or an administrative setup process:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

Never commit credentials to Git.

Never expose service-role keys to the browser.

After initial setup, the admin should authenticate through Supabase Auth like any other user.

---

# 26. Admin Permissions

Admin-only operations:

```text
CREATE product
UPDATE product
ARCHIVE product
DELETE product
UPDATE inventory
CREATE offer
UPDATE offer
DELETE offer
APPROVE testimonial
REJECT testimonial
FEATURE testimonial
```

Customer operations:

```text
READ active products
READ approved testimonials
READ active offers
MANAGE own cart
READ own orders
MANAGE own profile
MANAGE own addresses
```

A customer must never be able to:

```text
change another user's cart
read another user's orders
modify products
modify offers
approve testimonials
modify inventory
```

---

# 27. API Structure

## Public APIs

### Products

```http
GET /api/products
GET /api/products/:productId
```

### Testimonials

```http
GET /api/testimonials
```

### Offers

```http
GET /api/offers
```

---

## Authenticated APIs

### User

```http
GET /api/auth/me
PATCH /api/auth/me
```

### Cart

```http
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
```

### Orders

```http
POST /api/orders
GET /api/orders
GET /api/orders/:orderId
```

### Addresses

```http
GET /api/addresses
POST /api/addresses
PATCH /api/addresses/:addressId
DELETE /api/addresses/:addressId
```

### Testimonials

If customers can submit testimonials:

```http
POST /api/testimonials
```

---

# 28. Admin APIs

Admin APIs should be protected by `requireAdmin()`.

```http
POST /api/admin/products
PATCH /api/admin/products/:productId
DELETE /api/admin/products/:productId

POST /api/admin/offers
PATCH /api/admin/offers/:offerId
DELETE /api/admin/offers/:offerId

PATCH /api/admin/testimonials/:testimonialId
DELETE /api/admin/testimonials/:testimonialId
```

For inventory:

```http
PATCH /api/admin/products/:productId/inventory
```

or, preferably, inventory should be managed at the variant level:

```http
PATCH /api/admin/variants/:variantId/inventory
```

---

# 29. Request Validation

Use Zod for every external request.

Example:

```ts
const CreateProductSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(5000),
  price: z.number().nonnegative(),
  categoryId: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
});
```

Never directly insert `request.json()` into Supabase.

Always:

```text
Request
↓
Parse
↓
Validate
↓
Business rules
↓
Database
```

---

# 30. API Response Standard

Use a consistent response shape.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

Do not expose:

- SQL errors
- database credentials
- stack traces
- internal implementation details

in production responses.

---

# 31. HTTP Status Codes

Use proper HTTP status codes.

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

Example:

```text
Unauthenticated user → 401
Authenticated customer trying admin action → 403
Product doesn't exist → 404
Duplicate SKU → 409
Invalid request body → 400/422
```

---

# 32. Supabase Client Separation

Create separate Supabase clients.

```text
lib/supabase/server.ts
```

For server-side authenticated requests.

```text
lib/supabase/browser.ts
```

For browser-side Supabase functionality where needed.

```text
lib/supabase/admin.ts
```

For server-only service-role operations.

The service-role client must:

```text
NEVER be imported into client components
NEVER be exposed to browser code
NEVER be included in NEXT_PUBLIC_* variables
```

---

# 33. Environment Variables

Recommended:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Never commit:

```text
.env
.env.local
```

to Git.

Provide:

```text
.env.example
```

with empty placeholders.

---

# 34. Row Level Security

Enable RLS on all application tables.

At minimum:

```text
profiles
addresses
carts
cart_items
orders
order_items
products
product_variants
product_images
categories
testimonials
offers
```

Example principle:

```text
Products:
Public → read active products
Admin → CRUD

Cart:
User → own cart only

Orders:
User → own orders only
Admin → authorized administrative access

Testimonials:
Public → approved only
User → own submissions
Admin → moderation

Offers:
Public → active offers only
Admin → CRUD
```

Do not rely exclusively on API route authorization.

The database must also protect the data.

---

# 35. Database Indexing

Add indexes for frequently queried fields.

Products:

```text
products.slug
products.category_id
products.status
products.trend_label
products.trend_score
products.price
products.created_at
```

Variants:

```text
product_variants.product_id
product_variants.sku
product_variants.size
```

Orders:

```text
orders.user_id
orders.status
orders.created_at
```

Cart:

```text
carts.user_id
cart_items.cart_id
```

Testimonials:

```text
testimonials.status
testimonials.is_featured
```

Offers:

```text
offers.is_active
offers.start_at
offers.end_at
```

Do not add indexes blindly. Add them based on actual query patterns and database performance.

---

# 36. Security Requirements

The implementation must include:

- Supabase Auth
- RLS
- Zod validation
- server-side authorization
- admin-only mutations
- secure cookies/session handling through Supabase
- no plaintext passwords
- no service-role key on client
- no sensitive information in logs
- input length limits
- strict enum validation
- UUID validation
- rate limiting for sensitive endpoints where appropriate
- protection against duplicate checkout requests
- server-side price calculation
- server-side inventory validation
- transaction-safe inventory updates

---

# 37. Idempotency

Order creation must be protected from accidental duplicate submissions.

Support an idempotency mechanism for checkout/order creation.

Example:

```http
POST /api/orders
Idempotency-Key: <unique-request-id>
```

The backend should ensure that retrying the same checkout request does not create multiple orders.

This is especially important when:

```text
Network request
    ↓
Order created
    ↓
Response lost
    ↓
Frontend retries
```

---

# 38. Business Logic Rules

The service layer owns business rules.

Examples:

```text
Product cannot be published without required fields.
Price cannot be negative.
Inventory cannot be negative.
Cart quantity cannot exceed available inventory.
Expired offers cannot be applied.
Inactive products cannot be purchased.
Customer cannot access another customer's order.
Only admin can modify catalog data.
Order price must come from the database.
```

The repository should primarily handle data access.

The service should handle business decisions.

---

# 39. Repository Responsibilities

Repository:

```text
findById()
findMany()
create()
update()
delete()
```

Example:

```ts
productRepository.findById(id)
productRepository.findMany(filters)
productRepository.create(data)
productRepository.update(id, data)
```

Do not put complex business decisions into the repository.

---

# 40. Service Responsibilities

Service:

```text
createProduct()
updateProduct()
getProducts()
getProduct()
addToCart()
updateCartItem()
checkout()
createOffer()
approveTestimonial()
```

Example:

```text
productService.createProduct()
```

should:

```text
validate business rules
↓
generate slug
↓
check SKU uniqueness
↓
create product
↓
create variants
↓
return mapped result
```

---

# 41. DTOs and Database Models

Do not expose raw database rows everywhere.

Use explicit DTOs.

Example:

```ts
type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: {
    id: string;
    name: string;
  };
  variants: ProductVariantDTO[];
  images: ProductImageDTO[];
  trend: {
    label: TrendLabel;
    score: number;
  };
};
```

This allows the database schema to evolve without breaking the frontend API contract.

---

# 42. Product API Example

```http
GET /api/products?category=tshirts&size=M&minPrice=500&maxPrice=2500&sort=trend&page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Oversized Essential Tee",
      "slug": "oversized-essential-tee",
      "price": 1499,
      "currency": "INR",
      "category": {
        "id": "uuid",
        "name": "T-Shirts"
      },
      "variants": [
        {
          "id": "uuid",
          "size": "M",
          "color": "Black",
          "quantity": 15
        }
      ],
      "images": [],
      "trend": {
        "label": "TRENDING",
        "score": 91
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

# 43. Error Handling

Create a centralized application error system.

Example:

```ts
class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}
```

Examples:

```text
PRODUCT_NOT_FOUND
INVALID_PRODUCT
INSUFFICIENT_STOCK
UNAUTHORIZED
FORBIDDEN
OFFER_EXPIRED
CART_EMPTY
ORDER_NOT_FOUND
DUPLICATE_SKU
```

Routes should not contain repeated error formatting logic.

---

# 44. Logging

Use structured server-side logging.

Log:

```text
request ID
route
method
status
duration
error code
```

Do not log:

```text
passwords
auth tokens
service-role keys
full payment information
sensitive user data
```

---

# 45. Testing Strategy

Tests should exist at multiple levels.

### Unit tests

Test:

```text
price calculations
discount calculations
offer validation
cart rules
inventory rules
authorization helpers
```

### Integration tests

Test:

```text
product creation
cart operations
order creation
RLS behavior
admin authorization
```

### API tests

Test:

```text
GET /api/products
POST /api/cart/items
POST /api/orders
GET /api/orders
POST /api/admin/products
```

Include negative cases.

---

# 46. TypeScript Standards

Use strict TypeScript.

Recommended:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Avoid:

```ts
any
```

unless there is a documented reason.

Prefer:

```ts
unknown
```

and narrow the type.

Do not duplicate interfaces between frontend and backend.

Keep shared API types in a reusable types package if the project grows into a monorepo.

---

# 47. API Route Standards

Route handlers should stay thin.

Bad:

```ts
export async function POST(request: Request) {
  // 300 lines of business logic
}
```

Good:

```ts
export async function POST(request: Request) {
  const user = await requireAdmin();
  const body = await request.json();

  const input = CreateProductSchema.parse(body);

  const product = await productService.createProduct(
    user.id,
    input
  );

  return NextResponse.json({
    success: true,
    data: product
  }, { status: 201 });
}
```

The route should coordinate, not implement the entire business domain.

---

# 48. Caching and Performance

Public product/catalog endpoints can use caching where appropriate.

However:

```text
Cart
Orders
User profile
Inventory
Admin data
```

must always be treated as dynamic/private data.

Do not cache user-specific responses publicly.

For product filtering:

- select only required columns
- paginate
- use indexes
- avoid N+1 queries
- avoid fetching unnecessary image metadata
- use appropriate Supabase/Postgres queries

---

# 49. Product Search

For initial implementation:

```text
search
```

can search:

```text
name
description
SKU
```

As the catalog grows, move to PostgreSQL full-text search or another dedicated search mechanism instead of doing unrestricted wildcard queries everywhere.

---

# 50. Recommended Database Relationships

```text
auth.users
    │
    └── profiles
          │
          ├── addresses
          │
          ├── carts
          │     └── cart_items
          │           └── product_variants
          │
          ├── orders
          │     └── order_items
          │
          └── testimonials


categories
    │
    └── products
          │
          ├── product_variants
          │
          └── product_images


products
    │
    └── offers
```

---

# 51. Recommended Initial Implementation Order

Implement in this order:

## Phase 1 — Database

Create:

```text
profiles
categories
products
product_variants
product_images
addresses
```

Then configure:

```text
RLS
indexes
constraints
foreign keys
```

## Phase 2 — Authentication

Implement:

```text
Supabase Auth
profile creation
session handling
requireUser()
requireAdmin()
```

## Phase 3 — Products

Implement:

```text
GET products
GET product
admin create
admin update
admin archive
inventory
categories
images
filters
sorting
pagination
```

## Phase 4 — Cart

Implement:

```text
get cart
add item
update quantity
remove item
inventory validation
```

## Phase 5 — Orders

Implement:

```text
checkout
order creation
order history
order details
inventory decrement
idempotency
```

## Phase 6 — Testimonials

Implement:

```text
submit testimonial
public approved testimonials
admin moderation
featured testimonials
```

## Phase 7 — Offers

Implement:

```text
create offer
update offer
activate/deactivate
date scheduling
discount validation
public active offers
```

---

# 52. Definition of Done

The backend is considered complete for this initial scope when:

### Products

- [ ] Product CRUD exists
- [ ] Categories exist
- [ ] Product variants exist
- [ ] Size-level inventory exists
- [ ] Product images use Supabase Storage
- [ ] Product status exists
- [ ] Trend label exists
- [ ] Trend score exists
- [ ] Product filtering works
- [ ] Product sorting works
- [ ] Pagination works
- [ ] Product validation exists
- [ ] Admin-only product mutations exist

### Users

- [ ] Supabase Auth is implemented
- [ ] Profiles exist
- [ ] Username is unique
- [ ] Passwords are handled only by Supabase Auth
- [ ] Addresses exist
- [ ] Users can only access their own private data

### Cart

- [ ] One active cart per user
- [ ] Variant-level quantities
- [ ] Inventory validation
- [ ] Server-side price calculation
- [ ] Add/update/remove operations

### Orders

- [ ] Order history exists
- [ ] Order items store historical product information
- [ ] Prices are server-calculated
- [ ] Inventory is safely updated
- [ ] Duplicate checkout protection exists
- [ ] Users can only access their own orders

### Testimonials

- [ ] User submission exists
- [ ] Moderation exists
- [ ] Approved testimonials are public
- [ ] Admin can approve/reject
- [ ] Admin can feature testimonials

### Offers

- [ ] Offer creation exists
- [ ] Percentage/fixed discounts exist
- [ ] Start/end dates exist
- [ ] Expired offers are automatically excluded
- [ ] Admin can manage offers

### Security

- [ ] RLS enabled
- [ ] Admin authorization enforced
- [ ] Service-role key server-only
- [ ] Zod validation
- [ ] No plaintext passwords
- [ ] No sensitive secrets committed
- [ ] User data isolation verified

---

# 53. Final Architectural Rule

The backend should remain structured around **business domains**, not around individual pages.

Use:

```text
Products
Cart
Orders
Users
Testimonials
Offers
Admin
Auth
```

rather than:

```text
Homepage
Products Page
Cart Page
Checkout Page
Admin Page
```

The frontend can change completely without requiring the backend architecture to change.

The final system should therefore look like:

```text
                    Next.js
                       │
                 Route Handlers
                       │
          ┌────────────┴────────────┐
          │                         │
   Authentication              Validation
          │                         │
          └────────────┬────────────┘
                       │
                  Service Layer
                       │
                 Repository Layer
                       │
                  Supabase
              ┌────────┴────────┐
              │                 │
          PostgreSQL         Storage
              │
              └── RLS

Domains:
├── Products
├── Categories
├── Variants
├── Cart
├── Orders
├── Users
├── Addresses
├── Testimonials
├── Offers
└── Admin
```

The most important architectural decisions are:

1. **Supabase Auth owns passwords and authentication.**
2. **Postgres owns relational data and constraints.**
3. **RLS provides database-level data isolation.**
4. **Next.js Route Handlers expose the API.**
5. **Services contain business logic.**
6. **Repositories contain database access.**
7. **Zod validates all external input.**
8. **Product variants handle size/color-specific inventory.**
9. **Order items preserve historical purchase data.**
10. **Admin access is role-based, never hardcoded in application logic.**
11. **Money is stored as exact numeric values, never floating point.**
12. **The frontend never determines trusted prices, discounts, inventory or permissions.**
13. **Every collection API is paginated and explicitly filterable.**
14. **The codebase should favor small, reusable modules over large generic utilities.**
