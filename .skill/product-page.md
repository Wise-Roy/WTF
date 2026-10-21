Build a mobile-responsive product description page (PDP) for a limited-edition
fashion editorial brand called "WTF". Same pink + lime-green + black color
theme as the rest of the site. Subtle scroll-driven parallax on every image.
3 image+description chapters per product.

=== BRAND ===
Name: WTF
Tagline: "Numbered. Limited. Never restocked."
Color palette (exact):
  - Pink navbar/CTA background: #FFC2D4
  - Pink deep (last-call accent): #FF9BB8
  - Lime green (CTA / tags / progress): #C8FF3D
  - Lime green deep: #A8E600
  - Ink black (text + hairlines): #0A0A0A
  - Cream paper (body background): #FFFAF6
Typography:
  - Display (headlines, wordmarks): Archivo Black, uppercase, letter-spacing
    -0.04em, line-height 0.85
  - Body: Inter, 16-18px, relaxed leading
  - Mono labels (badges, specs, captions): Geist Mono, 10-12px, uppercase,
    letter-spacing 0.2-0.25em
Motifs: 4-pointed star (✦) used as bullet, divider, and rotating decoration;
thin 1.5px black hairlines as section dividers; subtle grid pattern overlay
on pink sections; faint noise texture optional.

=== PAGE STRUCTURE (top to bottom) ===

1. STICKY TOP BAR
   - Frosted pink glass: background rgba(255,194,212,0.78) + 20px
     backdrop-blur + saturate(140%); 1px hairline border-bottom in
     rgba(10,10,10,0.15)
   - 3-column flex: [back arrow + "Back" mono label] [center: ✦ star +
     product title in display font + "/ Drop 021" mono label] [right: lime
     green "Add" button with shopping bag icon + price]
   - Sticks to top while scrolling. On mobile, hide the "Back" text and
     price, keep icons only.

2. INTRO HERO (90vh)
   - Full-bleed cover image, object-cover, dark gradient overlay
     (from-black/40 via-black/30 to-black/85)
   - Parallax: image drifts 0% → 20% vertically and scales 1.05 → 1.18 as
     you scroll past
   - Content anchored bottom-left, max-width 1600px, padding 24-40px:
     · Row of 2 tags: lime "◆ Drop 021" pill + status pill (green
       "Available" / pink "Last Call" / black "Sold Out")
     · Giant product title in display font, white, size 11vw mobile / 12vw
       desktop, whitespace-nowrap so it never wraps
     · 2-column row: left = intro paragraph (white/85%, max-width xl),
       right = 3 specs stacked horizontally (Price / Pieces / Drop) — each
       with mono label above and display-font value below
   - Bottom 1.5px white/30 hairline

3. CHAPTER 1 — SPLIT (image LEFT, text RIGHT)
   - 2-column grid on desktop (lg), single column stacked on mobile
   - Left: aspect-[4/5] image, 1.5px black border, object-cover
     · Parallax: image drifts -6% → 6% vertically + scales 1.12 → 1.18
       inside the frame (overflow hidden)
     · Top overlay row: left chip "Ch. 01" (cream bg) + right chip
       "CONCEPT" (black bg, white text)
   - Right: text block
     · Mono label "§01 / CONCEPT" (60% opacity)
     · Display headline "CONCEPT" (4-6xl, black, uppercase)
     · 2px × 16-wide lime underline below headline
     · Body paragraph (16-18px, black/80%, relaxed leading, max-width xl)
   - Parallax on text: opacity 0.2 → 1 + slide 40px → 0 as it enters
     viewport
   - Vertical padding: py-16 mobile / py-24 tablet / py-32 desktop

4. CHAPTER 2 — SPLIT (text LEFT, image RIGHT) — alternating
   - Same structure as Chapter 1 but mirrored. Image on the right on
     desktop, stacks above text on mobile (image-first rhythm preserved).
   - Same parallax intensities.
   - Chapter number "02", title "MATERIAL"

5. CHAPTER 3 — FULL-BLEED POSTER
   - Full-bleed image with stronger parallax: drifts -8% → 8%, scales
     1.15 → 1.25
   - Dark gradient overlay (from-black/70 via-black/50 to-black/85)
   - Text anchored bottom-left, max-width 2xl:
     · Lime "◆ 03 — PROVENANCE" pill
     · Display headline "PROVENANCE" (4-7xl, white, uppercase)
     · Body paragraph (white/85%, 16-20px)
   - Min-height 60vh mobile / 70vh desktop
   - Vertical padding: py-20 mobile / py-32 tablet / py-40 desktop

6. CTA STRIP (pink background)
   - Star-pattern overlay at 30% opacity
   - 2-column flex on desktop, stacked on mobile:
     · Left: mono "◆ Drop 021 — 187 pieces, numbered" label above a
       giant status-aware display heading:
         - Available → "Open now."
         - Last Call → "Last call."
         - Sold Out  → "Gone."
       Followed by a status-aware paragraph explaining the current state.
     · Right: 2 buttons stacked or side-by-side:
         - "Other drops" — outline (1.5px black border, black text),
           back arrow icon, returns to collections
         - "Add to cart" — solid black bg, white text, shopping bag icon,
           price in mono, up-right arrow. Disabled state (Sold Out):
           greyed bg (black/30), checkmark icon + "Sold out" text,
           cursor-not-allowed
   - Padding: py-16 mobile / py-20 tablet / py-24 desktop

=== INTERACTION & MOTION ===
- Use Framer Motion for all scroll-driven transforms (useScroll +
  useTransform).
- Page transition: fade in/out (0.3s) when entering/leaving the PDP.
- On opening a product, instantly scroll to top.
- Card click → PDP opens; back button → returns to collections list.
- All parallax is subtle — images drift 6-8% max, never jarring.
- Text reveals: opacity 0.2 → 1 + 40px horizontal slide as each block
  enters the viewport (once: true).
- Buttons: whileHover scale 1.03, whileTap scale 0.97.

=== MOBILE RESPONSIVE (≤640px) ===
- All 2-column splits collapse to 1 column (image first, text below)
- Top bar: hide "Back" text label and price; keep icons + product name
- Intro title: 11vw with whitespace-nowrap so 10-char titles fit on one
  line
- Specs row: stays horizontal but tighter
- CTA buttons: stack vertically, full-width
- Touch targets: minimum 44px (buttons use py-4)
- No horizontal scroll on any viewport

=== ACCESSIBILITY ===
- Back button and all CTAs are real <button> elements
- Collection cards that open the PDP: role="button", tabIndex=0,
  keyboard activatable (Enter + Space), aria-label="Open [product]
  product page"
- Images have descriptive alt text
- Focus ring on keyboard nav (lime, 4px ring at 60% opacity)
- Semantic HTML: <main>, <section>, <h1>/<h2>/<h3>

=== DATA MODEL ===
Each product = {
  id, index (drop number like "021"), title, subtitle,
  coverImage, coverAlt, pieces (int), price (string like "$245"),
  status ("Available" | "Last Call" | "Sold Out"), intro (1-2 sentences),
  chapters: [{number, title, body, image, alt}, ×3]
}

=== TONE ===
Editorial, confident, scarce. Copy is short and declarative — no marketing
fluff. Examples:
  - "We do not restock. We do not reprint. We do not apologize."
  - "When the run is done, the run is done."
  - "Once 187 is shipped, the print files are deleted."