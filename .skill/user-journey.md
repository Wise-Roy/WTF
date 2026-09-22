USER JOURNEY (strict sequence)
1. Signed-out state (Sign In view)
 Right: SIGN IN (with person icon), CART (0) buttonw ith yellow bag icon (this is the only yellow-filled button in the navbar).

Centered card: lime "CULT PASS" badge → "SIGN IN" heading → subtitle"NO PASSWORDS. EVER. MAGIC LINK ONLY." → EMAIL input (placeholder you@email.com)→ SEND MAGIC LINK button. Button is DISABLED (grayed) until a valid email is entered.
Footer: "WTF CULT APPAREL" + "FLAT $8 US • $25 INTL • FREE OVER $100 • PRICES TAX-INCLUSIVE"
2. Magic link — MOCKED, returned via API
On submit → POST /api/auth/magic-link. Backend generates a single-use token andRETURNS THE MAGIC LINK IN THE API RESPONSE itself (no real email provider).
Frontend then renders a dashed-border box inside the sign-in card:"SIMULATED EMAIL — MOCKED. YOUR LINK:" with a lime "OPEN MAGIC LINK" buttonthat navigates to the returned verify URL.
Verification validates + burns the token, creates a session, and lands the useron their profile page. Navbar button now reads PROFILE instead of SIGN IN.
3. Signed-in state — "YOUR CULT FILE" (profile)
Heading: "YOUR CULT FILE" with the user's email below in mono uppercase.
Tab row: ORDERS | INFO | SUPPORT, plus LOGOUT on the far right.Active tab = black bg + lime text; inactive = cream bg + black border.
ORDERS tab (default): empty state "NO ORDERS ON THIS ACCOUNT YET."(fetch from GET /api/orders so real orders render later).
INFO tab: form — NAME, PHONE, ADDRESS LINE 1, CITY, ZIP, COUNTRY (default "US")→ SAVE DETAILS (black button, lime text) persists via API and re-hydrates on next login.
SUPPORT tab: "NEW QUERY" card — SUBJECT input, RELATED ORDER (OPTIONAL) dropdown("None" + user's orders), MESSAGE textarea, lime SEND QUERY button.Below: "PAST QUERIES" section listing submitted queries; empty state"NOTHING LOGGED YET."
LOGOUT kills the session and returns to state 1.
4. Bag drawer (available in any state)
Clicking CART opens a right-side slide-over: "YOUR BAG" with × close.
Empty state: "BAG IS EMPTY. GO GET SOMETHING."
Bottom summary: SUBTOTAL $0.00 / SHIPPING EST. FREE / dashed divider /TOTAL $0.00 / CHECKOUT button (disabled while empty). Bag lives in client state.

FRONTEND IMPLEMENTATION
AuthContext holds session; restore on refresh via GET /api/auth/me.
Components: Navbar, TickerMarquee, SignInCard, MockEmailBox, ProfileTabs,OrdersTab, InfoForm, SupportQueryForm, PastQueries, BagDrawer, Footer.
Email regex validation gates the SEND MAGIC LINK button; show loading + sent states.
Bag state in Context + localStorage, checkout-ready.

BACKEND IMPLEMENTATION

Endpoints:
POST /api/auth/magic-link {email} → store token doc (token, email,expires_at = now+15min, used:false) → 200 { "magic_link": "/auth/verify?token=...","expires_in": 900 } ← link is IN the response (mocked email)
GET /api/auth/verify?token= → reject if used/expired; mark used; set JWT session cookie; redirect to profile
GET /api/auth/me · POST /api/auth/logout
GET /api/orders (auth)
GET /api/profile · PUT /api/profile (auth; upsert name/phone/address/city/zip/country)
POST /api/support/queries · GET /api/support/queries (auth; status:"open", created_at)
Single-use tokens, 15-min expiry, basic rate-limit per email.
UI / COLOR THEME ALIGNMENT (STRICT)
Align the UI 1:1 with the codebase's existing color theme and design tokens —do NOT introduce new colors, gradients, or rounded corners:

Page background cream: #F7F3DE · cards: #FCFAF0
Ink black (text/borders/buttons): #0A0A0A
Neon lime accent (badges, cart icon, OPEN MAGIC LINK, active tab text): #E4FF3F
Pale lime secondary button (SEND QUERY): #F1FFA8
Typography: monospace (JetBrains Mono / Space Mono) for labels, buttons, ticker,inputs; heavy grotesk (Archivo Black) for headings. All uppercase mono labels.
Every interactive element: 2px solid black border, hard offset shadow(4px 4px 0 #0A0A0A), square corners (border-radius: 0).
Marquee: black strip, lime mono text, continuous loop.
Focus state on inputs: black/lime outline (no default browser blue).
Why it's structured this way:

Journey-locked — the agent can't drift into inventing products, checkout payments, or extra pages; it builds only the 4 states visible in your screenshots.
Magic link via API — the mocked email box ("SIMULATED EMAIL — MOCKED. YOUR LINK:") is explicitly tied to the API response shape, so the flow is testable end-to-end without an email provider.
Theme section last & strict — putting exact hex tokens + "align with the code's color theme" as a hard constraint prevents agents from regenerating with their default shadcn/Tailwind palette.
