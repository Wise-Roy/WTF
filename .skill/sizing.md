ROLE
You are a senior front-end engineer building WXRSHIP THE FVMES (WTF), a brutalist
streetwear brand website. Stack: Next.js 16 App Router, TypeScript strict,
Tailwind CSS 4, framer-motion, lucide-react. Do NOT add dependencies.

TASK
Build the "THE NUMBERS — SIZE CHART" section of the /sizing page as one client
component (src/components/sections/SizeChart.tsx) plus a shared data file
(src/lib/sizes.ts). A fixed pink navbar (h-16) already exists above it.

DESIGN SYSTEM (exact — do not deviate)
- Palette: lime #C6FF00 (section bg) · light lime #d4ff33 (hover) · hot pink
  #DF2877 (accents, hard shadows) · ink #1a1a1a (table bg / text) · cream #FFF9D6 · white
- Display font: Bebas Neue (already available via .font-bebas class). Body copy:
  default sans, bold, UPPERCASE, wide tracking.
- Motif: 5-point star SVG, black/pink, used sparingly (footnote flanks only).
- Brutalist rules: NO border-radius anywhere · thick 2px borders · hard offset
  shadows, e.g. shadow-[10px_10px_0_#DF2877] · uppercase · tracking-widest / [0.3em].
- Forbidden: blue/indigo hues, gradients, rounded corners, global CSS edits.
  Use Tailwind arbitrary values (bg-[#C6FF00], text-[#DF2877]).

DATA — create src/lib/sizes.ts and export:
  export type SizeRow = { label: string; bust: number; waist: number; hips: number }
  export const SIZES: SizeRow[] = [
    { label: "XS",  bust: 32, waist: 24, hips: 34 },
    { label: "S",   bust: 34, waist: 26, hips: 36 },
    { label: "M",   bust: 36, waist: 28, hips: 38 },
    { label: "L",   bust: 38, waist: 30, hips: 40 },
    { label: "XL",  bust: 40, waist: 32, hips: 42 },
    { label: "2XL", bust: 42, waist: 34, hips: 44 },
    { label: "3XL", bust: 44, waist: 36, hips: 46 },
    { label: "4XL", bust: 46, waist: 38, hips: 48 },
  ]
(Values step by 2. Units: inches. These are BODY measurements.)

SECTION SPEC
1. <section id="chart" class="bg-[#C6FF00] scroll-mt-20"> with container
   max-w-7xl px-6 md:px-12 lg:px-20 py-16 md:py-24.
2. Header row (flex, stacks on mobile): kicker "THE NUMBERS" (text-xs font-bold
   uppercase tracking-[0.3em] text-[#1a1a1a]/70) above heading "SIZE CHART"
   (font-bebas text-[#1a1a1a] text-6xl md:text-8xl leading-[0.85]). Right side:
   unit toggle group.
3. Unit toggle: inline-flex, border-2 border-[#1a1a1a], bg-white,
   shadow-[4px_4px_0_#1a1a1a]. Two buttons "INCHES" | "CM" (font-bebas text-xl
   tracking-widest px-8 py-3). Active: bg-[#1a1a1a] text-[#C6FF00]. Inactive:
   bg-white text-[#1a1a1a], hover bg-[#FFF9D6]. Default INCHES. Set aria-pressed
   on both; wrap group with role="group" aria-label="Measurement unit".
4. Table card: border-2 border-[#1a1a1a] bg-[#1a1a1a] shadow-[10px_10px_0_#DF2877]
   mt-10. Inside: overflow-x-auto wrapper (custom scrollbar: 8px, black track,
   #C6FF00 thumb) with <table class="w-full min-w-[560px] text-center
   border-collapse"> so it scrolls horizontally on small screens.
5. Columns: SIZE | BUST | WAIST | HIPS. <th scope="col">: font-bebas
   text-[#DF2877] text-2xl md:text-3xl tracking-widest, px-4 py-5,
   border-b-2 border-[#C6FF00]/60, each with a unit sub-label ("(in)" / "(cm)")
   rendered as text-sm text-[#C6FF00]/70 tracking-[0.3em] block — it must react
   to the toggle.
6. Body rows: border-b border-white/10 (last: none), hover:bg-[#DF2877]/25
   transition-colors. Size cell: font-bebas text-[#C6FF00] text-2xl md:text-3xl,
   turns white on row hover (group-hover). Measurement cells: font-bebas
   text-white text-2xl md:text-3xl, px-4 py-4.
7. Unit conversion (display-only state):
   INCHES → raw integer as string.
   CM     → (in × 2.54), round to 1 decimal, strip trailing ".0".
   Expected: 32→"81.3", 24→"61", 34→"86.4", 36→"91.4", 38→"96.5", 40→"101.6".
8. Footnote (mt-6): flanked by two pink star icons, text-[#1a1a1a]/70 text-xs
   md:text-sm font-bold uppercase tracking-widest:
   "Body measurements, not garment measurements. The tape doesn't lie."
9. Star component (local): svg viewBox "0 0 24 24" fill currentColor aria-hidden,
   path "M12 1.7l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14
   2 9.27l6.91-1.31L12 1.7z".
10. Motion: framer-motion whileInView (once: true, margin: "-80px") — header
    fades/slides up 30px; table slides up 40px with 0.15s delay.

DEFINITION OF DONE
- Toggling CM converts all 24 measurement cells AND the 4 unit sub-labels;
  INCHES restores raw values. Pure client state, no re-fetch.
- Semantic <table> with scope="col" headers; keyboard-scrollable on mobile.
- No border-radius, no blue/indigo, no `any`. Lint-clean.


ROLE
You are a senior front-end engineer building WXRSHIP THE FVMES (WTF), a brutalist
streetwear brand website. Stack: Next.js 16 App Router, TypeScript strict,
Tailwind CSS 4, framer-motion, lucide-react. Do NOT add dependencies.

TASK
Build the "FIND YOUR SIZE" interactive section of the /sizing page as one client
component (src/components/sections/SizeFinder.tsx).

DESIGN SYSTEM (exact — do not deviate)
- Palette: lime #C6FF00 (bg) · light lime #d4ff33 (hover) · hot pink #DF2877
  (labels, shadows) · ink #1a1a1a (card bg) · cream #FFF9D6 (inputs) · white.
- Display font: Bebas Neue via .font-bebas class. Body: sans, bold, UPPERCASE.
- Brutalist rules: NO border-radius · 2px borders · hard shadows
  (shadow-[10px_10px_0_#DF2877]) · uppercase · tracking-widest.
- Forbidden: blue/indigo, gradients, rounded corners, global CSS edits.
- Star SVG (local component): viewBox "0 0 24 24" fill currentColor aria-hidden,
  path "M12 1.7l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14
  2 9.27l6.91-1.31L12 1.7z".

DATA — import if src/lib/sizes.ts exists, otherwise create it:
  SIZES: { label, bust, waist, hips }[] = XS 32/24/34 · S 34/26/36 · M 36/28/38 ·
  L 38/30/40 · XL 40/32/42 · 2XL 42/34/44 · 3XL 44/36/46 · 4XL 46/38/48
  (bust/waist/hips in inches; body measurements; steps of 2)

SECTION SPEC
1. <section id="finder" class="bg-[#C6FF00] border-t-2 border-[#1a1a1a]
   scroll-mt-20">; container max-w-7xl px-6 md:px-12 lg:px-20 py-16 md:py-24.
2. Centered header: kicker "SKIP THE MATH" (black/70, xs, tracking-[0.3em]),
   heading "FIND YOUR SIZE" (font-bebas black text-6xl md:text-8xl
   leading-[0.85]), sub-line "Punch in your numbers. We'll do the cult math."
   (bold uppercase tracking-widest, xs/sm).
3. Tool card: max-w-3xl mx-auto mt-10, bg-[#1a1a1a] border-2 border-[#1a1a1a]
   shadow-[10px_10px_0_#DF2877] p-6 md:p-10.
4. Form (onSubmit, grid grid-cols-1 md:grid-cols-3 gap-5):
   - Three number inputs: BUST / WAIST / HIPS. Each <label> (htmlFor): pink
     #DF2877 font-bold uppercase tracking-widest text-xs + tiny lime star icon +
     "(inches)" hint in text-white/40. Input: w-full bg-[#FFF9D6] border-2
     border-white/20 focus:border-[#C6FF00] font-bebas text-3xl tracking-wider
     text-center px-4 py-3 outline-none, placeholder "—", type="number",
     inputMode="decimal", min 18, max 70, step 0.5.
   - Submit button (md:col-span-3): w-full bg-[#C6FF00] hover:bg-[#d4ff33]
     text-[#1a1a1a] font-bold uppercase tracking-widest py-4 px-6,
     active:translate-y-0.5, star icon on each side of "REVEAL MY SIZE".
5. EMPTY SUBMIT (zero valid inputs): shake the form via framer-motion
   (animate x: [0,-10,10,-6,6,0], 0.5s) and show pink #DF2877 error line
   "Give us at least one number, weirdo." (text-xs font-bold uppercase
   tracking-widest, centered) that auto-hides after 700ms. Each input is
   individually optional — at least ONE is required.
6. RESULT (renders below form, border-t-2 border-white/10 pt-8 mt-8, text-center,
   framer-motion pop-in from {opacity:0, scale:0.9, y:10}):
   a) SIZE RESULT: "YOU'RE A" (text-white/50 font-bold uppercase
      tracking-[0.3em] text-xs) → the size label in giant font-bebas
      text-[#C6FF00] text-8xl md:text-9xl leading-none → driver chips (flex
      wrap, gap-2): one per provided measurement, inline-flex border
      border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest
      px-3 py-1.5 with pink star, format: "BUST 36″ → M" (double-prime for
      inches) → verdict line (text-white/60 text-sm md:text-base max-w-md
      mx-auto leading-relaxed):
        · deadOn === true  → "Dead on. The tape doesn't lie and neither do you."
        · deadOn === false → "Between sizes? Size up — oversized is the point."
   b) OFF THE CHART (any measurement exceeds the 4XL row): font-bebas
      text-[#DF2877] text-5xl md:text-6xl "OFF THE CHART" + text-white/70 copy:
      "You're beyond the chart — in a good way. Email hello@wxrshipthefumes.com
      and we'll hook you up with something that fits like it was made for you.
      Because it will be." (email = lime link).
   c) Reset link "MEASURE AGAIN" (mt-6, text-white/50 hover:text-[#C6FF00]
      text-xs font-bold uppercase tracking-widest, button) — clears all inputs
      and the result.
7. Key the result container (e.g. result.status + size label + driver values)
   so re-submissions re-animate.

RECOMMENDATION ALGORITHM — implement exactly:
  recommendSize({bust?, waist?, hips?}) →
    { status: "error" }
  | { status: "off-chart" }
  | { status: "size"; size: SizeRow; drivers: {field, value, fits}[]; deadOn: boolean }

  1. provided = the (field, value) pairs where value parses to a positive
     finite number (ignore empty / 0 / negative).
  2. provided.length === 0 → status "error".
  3. For each (field, value):
       match = the FIRST row in SIZES (ascending) with value <= row[field]
       (smallest size that fits this measurement; values below the XS row map
       to XS).
       If no row satisfies it (value > 46 bust / 38 waist / 48 hips) →
       status "off-chart" (stop).
       Record driver { field, value, fits: match.label }.
  4. recommendedIndex = MAX index among the matched rows.
     Rationale: the garment must fit the largest measurement, so the max index
     guarantees every provided measurement fits.
  5. deadOn = every driver where value === its matched row's field value
     (exact equality, e.g. bust 36 matches the M row whose bust is exactly 36).
  6. Return { status: "size", size: SIZES[recommendedIndex], drivers, deadOn }.

  Verify these cases:
  - 36 / 28 / 38 → M, deadOn true
  - 35 / 24 / 36 → M (bust→M, waist→XS, hips→S; max index), deadOn false
  - 50 / - / -   → off-chart (50 > 46)
  - 35.5 bust    → M (35.5 ≤ 36; halves allowed)
  - waist 30 only → L

DEFINITION OF DONE
- All four states reachable & correct (size, dead-on variant, between-sizes
  variant, off-chart, error shake). Submit via click AND Enter key.
- Proper label/htmlFor pairs, visible focus states, no `any`, lint-clean.
- No border-radius, no blue/indigo, lime/pink/black only.