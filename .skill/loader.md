## Logo Loader → Navbar Shared-Element Animation

Implement the website intro as a **true shared-element / FLIP-style logo transition**. The animation must feel like the exact same logo physically travels from the center of the screen into its final position inside the navbar.

### 1. Initial Loader State

Create a full-screen loader overlay that appears above the entire website.

* The loader must cover the entire viewport: `position: fixed; inset: 0;`.
* The navbar must already be mounted and rendered underneath the loader.
* The navbar must **not** be unmounted, recreated, or conditionally rendered during the animation.
* The loader contains the **same logo element** that will visually travel into the navbar.
* Place the logo exactly at the center of the viewport.
* The logo should initially be large.
* Center it using a reliable positioning method such as:

  * `position: absolute`
  * `left: 50%`
  * `top: 50%`
  * `transform: translate(-50%, -50%)`
* Do not use arbitrary hardcoded pixel coordinates for the final navbar position.

### 2. Stars Around the Logo

While the logo is displayed in the center, create stars that revolve around it.

The stars must form an **exact circular orbit**, not an approximate random movement.

Requirements:

* Use a fixed orbital radius relative to the logo.
* Stars should remain distributed around the circumference of the circle.
* Each star should rotate around the logo's center.
* The entire orbital system should rotate smoothly.
* Stars should maintain their circular distance from the logo while orbiting.
* Do not animate each star independently with unrelated random movement.
* The result should visually feel like stars revolving around a central planet/logo.

Conceptually:

```text
              ★
         ★         ★

       ★    LOGO     ★

         ★         ★
              ★
```

The logo remains stationary during this initial phase while the stars revolve around it.

Use GPU-friendly transforms such as:

```css
transform: translate3d(...) rotate(...);
```

Avoid expensive layout-triggering animations.

### 3. Logo Must Travel to the REAL Navbar Logo Position

When the loader animation finishes, do **not** simply fade the loader logo out and fade the navbar logo in.

The logo must physically travel from the center of the screen to the navbar.

The transition should visually communicate:

```text
FULL-SCREEN CENTER
        ↓
      LARGE
        ↓
   moves toward navbar
        ↓
      shrinks
        ↓
exact navbar position
        ↓
navbar logo size
```

The destination must be the **actual existing navbar logo element**.

Before starting the transition:

```js
const targetRect = navbarLogo.getBoundingClientRect();
```

Measure:

* `x`
* `y`
* `width`
* `height`

from the actual navbar logo.

Do NOT guess these values.

Do NOT use values such as:

```js
translateX(500)
translateY(-300)
scale(0.2)
```

unless those values are dynamically calculated from the measured DOM positions.

### 4. True Shared-Element Behavior

The most important requirement:

**The animation must look like one continuous logo moving from the loader into the navbar.**

Avoid:

```text
Loader logo → fade out
Navbar logo → fade in
```

Instead:

```text
Loader logo
    ↓
same visual element travels
    ↓
same dimensions become navbar dimensions
    ↓
navbar logo position
    ↓
loader disappears
```

The navbar logo should remain mounted underneath the loader throughout the animation.

During the travel animation, the navbar logo can temporarily be visually hidden using opacity/visibility, but it must remain mounted in the DOM.

At the end:

1. The travelling logo reaches the exact navbar logo position.
2. Its size matches the navbar logo exactly.
3. The loader overlay is removed/hidden.
4. The navbar logo becomes visible seamlessly.

There must be no visible jump, flash, double logo, or crossfade.

### 5. FLIP / getBoundingClientRect Implementation

Use a FLIP-style implementation or Framer Motion's shared-layout capabilities.

Preferred approach:

#### First

Measure the navbar destination:

```js
const targetRect = navbarLogo.getBoundingClientRect();
```

Also determine the starting rectangle of the loader logo.

For example:

```js
const sourceRect = loaderLogo.getBoundingClientRect();
```

Then calculate the required translation and scale.

Conceptually:

```js
const translateX =
  targetRect.left + targetRect.width / 2 -
  (sourceRect.left + sourceRect.width / 2);

const translateY =
  targetRect.top + targetRect.height / 2 -
  (sourceRect.top + sourceRect.height / 2);

const scaleX = targetRect.width / sourceRect.width;
const scaleY = targetRect.height / sourceRect.height;
```

If the logo must preserve its aspect ratio, use the appropriate uniform scale while ensuring the final rendered dimensions match the navbar logo.

The animation should use:

```css
transform:
  translate3d(x, y, 0)
  scale(s);
```

rather than animating `top`, `left`, `width`, and `height` directly.

This keeps the animation GPU-friendly and prevents unnecessary layout recalculation.

### 6. Logo Scaling

The logo starts significantly larger in the center.

Example conceptual state:

```text
CENTER
Logo width: ~large viewport-relative size

              ↓

NAVBAR
Logo width: exact navbar logo width
```

As the logo travels toward the navbar:

* position changes continuously
* scale decreases continuously
* no sudden size change
* no separate resize animation after arrival

The logo should reach its **exact final navbar dimensions at the exact moment it reaches the navbar position**.

### 7. Animation Curve

The movement should feel premium and cinematic rather than mechanical.

Use a smooth easing curve.

For example:

```js
ease: [0.22, 1, 0.36, 1]
```

or an appropriate spring with carefully controlled damping/stiffness.

Avoid linear movement.

The animation should feel like:

```text
center → accelerate slightly → smoothly travel → decelerate → perfectly lock into navbar
```

The final few frames are especially important.

The logo should settle naturally into the navbar position rather than stopping abruptly.

### 8. Coordinate System

Be careful with coordinate systems.

`getBoundingClientRect()` returns viewport-relative coordinates.

Therefore, the travelling logo must also be positioned relative to the viewport when performing the transition.

The loader logo should preferably use:

```css
position: fixed;
```

during the shared-element movement.

This ensures that:

```js
getBoundingClientRect()
```

coordinates correspond correctly to the animation coordinate system.

Do not accidentally mix:

* document coordinates
* viewport coordinates
* parent-relative coordinates

because this will cause the logo to land a few pixels away from the navbar.

### 9. Navbar Must Already Exist

The page structure should conceptually be:

```text
Application
│
├── Navbar
│     └── Navbar Logo
│
├── Page Content
│
└── Loader Overlay
      └── Travelling Logo
```

The navbar is rendered from the beginning.

The loader is simply placed above it using a high `z-index`.

Example:

```css
.navbar {
  position: relative;
  z-index: 10;
}

.loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
```

Do not mount the navbar only after the loader finishes.

### 10. Prevent Interaction During Animation

While the loader and logo transition are active:

```css
pointer-events: none;
```

should prevent interaction with the travelling logo.

Also prevent page scrolling.

For example, temporarily lock the document:

```js
document.body.style.overflow = "hidden";
```

Restore it after the loader finishes.

The user should not be able to:

* scroll
* click buttons
* interact with navbar elements
* accidentally move the page

during the transition.

### 11. Resize Handling

The destination position must not be hardcoded.

If the viewport changes size before the transition begins, recalculate:

```js
navbarLogo.getBoundingClientRect()
```

again.

Also account for responsive navbar changes.

For example:

```js
window.addEventListener("resize", updateTargetPosition);
```

If the resize happens while the animation is running, handle it safely so the logo does not finish at an outdated position.

Prefer recalculating the destination immediately before starting the travel animation.

### 12. Mobile Responsiveness

The exact same concept must work on:

* desktop
* tablet
* mobile

Do not use desktop-only hardcoded coordinates.

The navbar logo's actual DOM dimensions determine:

* destination X
* destination Y
* final width
* final height

Therefore, the animation automatically adapts to responsive navbar layouts.

### 13. Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

or:

```js
window.matchMedia("(prefers-reduced-motion: reduce)")
```

When reduced motion is enabled:

* do not perform the orbital animation
* do not perform the logo travel animation
* do not show a long loader
* immediately show the normal navbar/page state
* ensure the navbar logo is visible
* remove the loader overlay

Accessibility takes priority over the animation.

### 14. Loader Exit Sequence

The exact sequence should be:

#### Phase 1 — Initial Loader

```text
Page mounted
↓
Navbar already mounted underneath
↓
Loader covers viewport
↓
Large logo appears in center
```

#### Phase 2 — Star Orbit

```text
Logo remains centered
↓
Stars orbit in a precise circle
↓
Smooth continuous rotation
```

#### Phase 3 — Prepare Transition

```text
Stop/slow the star orbit
↓
Measure navbar logo getBoundingClientRect()
↓
Calculate destination translation
↓
Calculate destination scale
↓
Lock page scrolling/interactions
```

#### Phase 4 — Shared Element Travel

```text
Large center logo
        ↓
translate3d toward navbar
        +
scale down continuously
        ↓
exact navbar position
        ↓
exact navbar dimensions
```

#### Phase 5 — Handoff

```text
Logo perfectly aligned with navbar logo
↓
Reveal navbar logo
↓
Hide travelling loader logo / remove loader
↓
Restore pointer events
↓
Restore page scrolling
```

The handoff must happen at the same visual frame so the user cannot detect that the DOM element changed.

### 15. Important: Avoid Double Logo

Do not allow this state to become visible:

```text
        [travelling logo]

             +

       [navbar logo]
```

For the handoff:

```text
travelling logo → reaches exact target
navbar logo → becomes visible
loader → disappears
```

The two logos must be pixel-aligned before the loader disappears.

### 16. Performance Requirements

The animation must remain smooth at 60fps wherever possible.

Animate only compositor-friendly properties:

```text
transform
opacity
```

Prefer:

```css
translate3d()
scale()
```

Avoid continuously animating:

```text
top
left
width
height
margin
padding
```

Do not trigger React state updates on every animation frame.

Do not use unnecessary `requestAnimationFrame` loops for the logo travel if Framer Motion/CSS transforms can handle it.

The star orbit should also use transforms rather than repeatedly modifying layout properties.

### 17. Final Visual Result

The user should perceive this as **one physical logo**.

The intended experience is:

```text
┌───────────────────────────────┐
│                               │
│                               │
│              ★                │
│         ★    LOGO    ★        │
│              ★                │
│                               │
│                               │
└───────────────────────────────┘

              ↓

┌───────────────────────────────┐
│  LOGO                         │
│───────────────────────────────│
│                               │
│          WEBSITE              │
│                               │
└───────────────────────────────┘
```

But the transition must NOT feel like two separate screens.

It should feel like:

**"The large logo from the center physically flies into its exact navbar position and becomes the navbar logo."**

### 18. Implementation Priority

Prioritize correctness in this order:

1. Navbar is mounted from the beginning.
2. Loader overlays navbar.
3. Logo starts centered and large.
4. Stars orbit in an exact circular formation.
5. Measure the real navbar logo using `getBoundingClientRect()`.
6. Calculate the exact translation and scale dynamically.
7. Animate using `translate3d()` + `scale()`.
8. Keep the transition smooth and GPU-friendly.
9. Make the logo land pixel-perfectly on the navbar logo.
10. Seamlessly remove the loader.
11. Restore scrolling and pointer interactions.
12. Recalculate on responsive resize.
13. Support `prefers-reduced-motion`.
14. Test desktop and mobile.

**Do not implement this as a fade transition. Do not use hardcoded final coordinates. Do not mount/unmount the navbar during the animation. The defining requirement is that the logo visually travels from the center of the screen into the navbar as one continuous shared element.**
