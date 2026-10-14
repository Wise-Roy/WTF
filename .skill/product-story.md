Build a PRODUCT STORY PAGE for a limited-drop fashion label "WTF®", plus an ADMIN section that manages the product data feeding it. Default: one self-contained HTML file, vanilla HTML/CSS/JS, no backend, no build step (adapt to my stack if I say so).

━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SCOPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build ONLY:
- The product story page, starting at the "← BACK TO COLLECTION" breadcrumb bar and ending JUST ABOVE the "YOU MAY ALSO LIKE" section (leave a clearly commented placeholder there — that section and everything below is out of scope).
- An admin view (create/reuse) that manages this page's content.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. BRAND & DESIGN SYSTEM (match exactly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Navbar: hot pink #FF4E93, 64px tall, 2px ink bottom border. Left: logo "WTF®" (Archivo Black). Center: SHOP / ABOUT / CONTACT (11px uppercase, letter-spacing .16em). Right: "CART (0)" button with 2px ink border. Navbar stays sticky.
- Palette: ink #1B161B, paper #FAF5F0 (page bg), cream #F3ECDF, pink-soft #FFD9E7, pink-deep #E0357C.
- Fonts (Google): Archivo Black (display), Space Grotesk (UI/body), Instrument Serif italic (editorial one-liners).
- Buttons: 2px radius, 2px ink border, uppercase 12px, letter-spacing .14em. Primary = ink fill → hover pink fill. Ghost = transparent → hover pink-soft fill.
- Currency: ₹ with Indian locale formatting (e.g., ₹4,000).
- Microcopy voice: uppercase, dry fashion humor. Toasts = fixed bottom-center ink pills with pink border that slide up and auto-dismiss.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. STORY PAGE — TRIPTYCH LAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
A three-column grid. While the user scrolls the gallery, the TWO SIDE CARDS STAY COMPLETELY STILL AND FULLY VISIBLE — ONLY the center image changes. That is the core experience.

a) BREADCRUMB BAR (static, top): "← BACK TO THE COLLECTION" on the left (returns to the collection grid and restores the previous scroll position); on the right "DROP 001 / {PRODUCT NAME} / 06 LOOKS".

b) LEFT CARD — "The Details" (pinned/static):
- White card, 2px ink border, 5px hard shadow in pink-soft.
- Content: eyebrow "✶ DROP 001 — {CATEGORY}", product name (Archivo Black), one-line italic serif blurb, a SHORT description (1–2 lines max — keep it tight), then a spec list with thin rules: FABRIC / FIT / CARE (labels in pink-deep micro caps, values 12.5px).
- Bottom of card, above a hairline: italic serif hint "Scroll the gallery — the sides stay put, only the look changes."

c) CENTER — The Image Stage (the ONLY thing that reacts to scroll):
- An invisible tall "driver" column (height = number of looks × ~95vh). Inside it a sticky image stage that pins below the navbar and does not move while the user scrolls through the driver.
- The stage holds ALL 6 product images stacked absolutely. As scroll progress advances, images crossfade one into the next (opacity transition ~0.5s). No carousel, no autoplay, no scroll-jacking — native scrollbar only.
- The frame must never move, resize or re-layout. Only the picture inside changes.
- Subtle parallax: the active image's inner content drifts vertically (translate3d, ~±60px) at a different speed than the page; a large ghost look-number behind it drifts the opposite direction.
- Per-look overlays: "LOOK 01" + caption bottom-left (e.g., "The full silhouette", "Detail — the signature bow"), tiny corner crop-marks, "DROP 001 — {NAME}" top-left, "WTF® STUDIO" top-right.
- HUD chip pinned bottom-center of the stage (paper bg, ink border, pill-shaped): ← / → arrows, clickable dots (active dot stretches into a pink pill), counter "01 / 06", thin progress bar filling with scroll.
- One-time hint chip top-center: "SCROLL — ONLY THE LOOK CHANGES ↓" — fades out once scrolling starts.
- Stage size: a bit smaller than full-bleed (~72vh tall, max ~620px wide, vertically centered in the viewport) but ~56px TALLER than both side cards, so it clearly reads as the hero of the three.

d) RIGHT CARD — "The Price" (pinned/static):
- Identical card styling to the left card and the EXACT SAME FIXED HEIGHT (both side cards must match heights perfectly; use a CSS variable, e.g. panel height = stage height − 56px).
- Top: price in Archivo Black 30px with "PRICE / INCL. ALL TAXES" micro caps beside it; a stock line with a pulsing pink dot + urgency copy (e.g., "ONLY 12 LEFT IN THE DROP").
- Middle: "SIZE" label + "SIZE GUIDE" link; size pills in a grid — ONLY the sizes marked available in admin (selected = ink fill); "QUANTITY" label + stepper (− / value / +, clamped 1–9).
- "ADD TO CART — ₹{price × qty}" primary button; below it a 2-column row of ghost buttons: "♡ WISHLIST" and "↗ SHARE".
- Bottom of card above a hairline: "FREE SHIPPING OVER ₹5,000 ✶ 7-DAY RETURNS ✶ NEVER RESTOCKED".

e) PINNING & HEIGHT RULES (critical):
- Both side cards: position: sticky, pinned for the ENTIRE gallery scroll, never extending below the fold. Compute the pin offset in JS (navbar height + vertical centering) and expose it as a CSS variable so CSS and the scroll math always agree.
- Distribute card content with flex space-between so both look balanced at equal heights. On short viewports (height < ~760px) auto-hide footnotes and tighten padding so nothing clips.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. SCROLL ENGINE (exact behaviour)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- progress = how far the driver column has travelled through the viewport; active index = floor(progress × number of looks). Progress must reach 1.0 exactly when the stage unsticks — no dead scrolling at the end. When the driver ends, all three columns release naturally and the page flows on.
- rAF-throttled scroll handler; update only transform/opacity.
- Dot clicks and ←/→ arrows smooth-scroll to the matching look; ArrowLeft/ArrowRight keyboard keys do the same while this page is open; Escape = back to collection.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. INTERACTIONS & STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ADD TO CART with no size chosen → shake the size grid + toast "PICK A SIZE — THEN IT'S YOURS".
- With a size → navbar cart count bumps (scale animation), button flashes "ADDED ✓", toast "ADDED — {name} · {size} × {qty}". Quantity in stock must be respected (from admin data).
- Wishlist toggles a filled heart; Share copies the URL and toasts confirmation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. ADMIN SECTION — product manager (build new, or reuse mine)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reachable at an #admin route or a discreet ADMIN link. A product list + add/edit form that produces EXACTLY the data shape the story page reads. Fields:

- Basics: name, category (TOPS / SKIRTS / DRESSES / CO-ORDS), price (₹), stock/urgency line.
- Description — in the SAME FORMAT the story page displays: one-line blurb (italic serif), short description, FABRIC, FIT, CARE.
- Available sizes: checkboxes XS / S / M / L / XL — only checked sizes render on the story page.
- Quantity: stock per size (or one total if simpler) — used for the stock line and add-to-cart validation.
- Images: EXACTLY 6 slots. Each slot = image upload (file → preview via FileReader/object URL) or URL, a caption ("The full silhouette", "Detail — the hem"…), and optional flags: "detail zoom" (renders as a close-up crop) and "back view". Slots must be re-orderable (up/down or drag). Slot 1 = the cover image.
- Validation: name, price and at least 1 image required; friendly inline errors.
- "PREVIEW STORY PAGE" button opens the rendered story page for that product.
- Persist to localStorage as a JSON array; the story page must render 100% from this data (no hardcoded products), seeded with ONE example product (6 images) so it works on first load:

{
  "id": "...", "name": "STAR 2", "category": "CO-ORDS", "price": 4000, "stock": "ONLY 12 LEFT",
  "blurb": "...", "description": "...",
  "details": { "fabric": "...", "fit": "...", "care": "..." },
  "sizes": [ { "label": "S", "qty": 3 }, { "label": "M", "qty": 2 } ],
  "looks": [ { "image": "...", "caption": "...", "zoom": false, "back": false } ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. RESPONSIVE (mobile is a first-class target)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ≥ ~1080px: the 3-column triptych as described.
- Below ~1080px: stack vertically — compact summary header (name + price + stock) → gallery stage (still scroll-driven, sticky under the navbar, ~56vh, smaller HUD) → buy panel → details card. Same crossfade/parallax behaviour.
- Add a STICKY BOTTOM BUY BAR on mobile: price + compact size pills + "ADD →", always visible, sharing selection state with the main panel (choosing a size in either place syncs both; validation shakes both).
- Fully usable at 360px width; handle short landscape heights; use svh units with vh fallbacks for mobile browser chrome; respect prefers-reduced-motion (kill drift/marquee, keep instant crossfades).

━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. ACCEPTANCE CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Scrolling changes ONLY the center image; both side cards never move and never clip; their heights match exactly; the stage is visibly taller than both.
- 6 images cycle with counter, dots, progress bar and keyboard arrows; progress ends exactly when the stage releases.
- A product created in admin (6 images, description in UI format, price, available sizes, quantity) renders flawlessly on the story page — desktop and mobile.
- No console errors; single file; no external backend.