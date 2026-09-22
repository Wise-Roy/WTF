edesign the product card component on the shop grid to a "ticket-stub" style. 
Reference image: https://static.prod-images.emergentagent.com/jobs/e66d0fa9-c135-47ae-8591-e297e0c39d93/images/d3c18c93c66f3be16e4f849c15416b94ff9e846c45977b0750b067554427de39.jpeg

CONTEXT
- Brand: "WTF — Worship The Fumes", Gen-Z streetwear drop brand.
- Page background is cream (#FBF6D9).
- Existing CTA accent color is neon yellow-green (#DFFF1C).
- Cards render in a responsive grid (3 cols desktop, 2 tablet, 1 mobile).

CARD STRUCTURE
Single card = two zones separated by a dashed perforation line with two semicircle notches on the left/right edges of the card.

1) TOP ZONE — Product image
   - Full-bleed product photo, aspect ratio 4:5.
   - Rounded top corners (radius 12px), no bottom radius.
   - Top-left overlay pill: text "#01" (drop item number), background #DFFF1C, 
     black text, 10px padding, 999px radius, small drop shadow. 12px inset from 
     top-left of the image.

2) PERFORATION DIVIDER
   - Horizontal dashed line, 2px dashes with 4px gaps, color #D9D4B8.
   - On each end, a 12px diameter semicircle cut OUT of the card edge 
     (use two absolutely-positioned circles matching the page background color 
     to fake the notch, or SVG mask).

3) BOTTOM ZONE — Stub (white #FFFFFF, subtle paper grain optional via SVG noise)
   - Padding: 20px.
   - Layout: flex row, space-between, align-items center.
   - LEFT column:
       • Tiny uppercase label: "DROP 01 · #01"
         - font: 11px, letter-spacing 0.08em, color #8A8676, weight 500
       • Product name: e.g. "Acid Rain"
         - font: 20px, weight 700, color #111, line-height 1.15
         - clamp to 2 lines max with ellipsis (-webkit-line-clamp: 2)
   - RIGHT column:
       • Tiny label above price: "USD"
         - font: 10px uppercase, letter-spacing 0.1em, color #8A8676, 
           right-aligned
       • Price: e.g. "$89"
         - font: 32px, weight 800, monospace (JetBrains Mono or IBM Plex Mono),
           color #111, right-aligned, tabular-nums
   - Rounded bottom corners (radius 12px).

CARD CONTAINER
- Background: #FFFFFF
- Border: 1px solid rgba(0,0,0,0.06)
- Shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)
- Border radius: 12px
- Overflow: hidden (except for the notches — handle carefully)

HOVER STATE
- Card lifts 4px (transform: translateY(-4px)), shadow deepens.
- Dashed line animates: background-position shifts left→right over 800ms 
  (marching-ants effect using background-image linear-gradient dashes).
- No color flash on price.
- Transition: 200ms ease-out.

EDGE CASES (must handle)
- Long product names → clamp to 2 lines, do NOT wrap into the price column.
- Long prices (e.g. "$149", "$1,299") → price column has min-width 90px, 
  font-size auto-shrinks to 26px if character count > 5.
- Sale price → show original price struck through in #8A8676 (14px) 
  ABOVE the sale price. Sale price color becomes #DFFF1C only when 
  isOnSale=true. This is the ONLY place neon touches the price.
- Sold out → grayscale filter on image (100%), stub shows "SOLD OUT" 
  in place of price in bold red-brown (#7A2E2E), 20px weight 800. 
  Card becomes non-clickable, cursor default.
- Mobile (<640px) → card image aspect ratio stays 4:5, stub padding 
  reduces to 16px, product name 18px, price 28px, drop label wraps 
  under name if needed.

TECH
- React + TypeScript component named <ProductCard />.
- Props: 
    { id, name, price, currency='USD', imageUrl, dropNumber, itemNumber, 
      salePrice?, isSoldOut? }
- Tailwind classes preferred; use arbitrary values for exact hex colors.
- Component must be pure/presentational, no data fetching inside.
- Add a Storybook-style demo page /shop-preview rendering 6 cards with 
  varied prices ($59, $89, $129, $149, sale example, sold-out example) 
  to verify all edge cases.

DO NOT
- Do not add hover color-flashes on the price.
- Do not use the neon yellow-green as the price background — it stays as 
  the drop-number pill and sale accent only.
- Do not change the page background, header, or existing typography scale.

DELIVERABLES
1. ProductCard.tsx component
2. Updated shop grid page using the new card
3. /shop-preview route showing all 6 edge-case variants
4. Screenshot of the final grid at desktop + mobile widths