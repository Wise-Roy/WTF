# Fix Product Card Reveal Lag

The current product-card image reveal has noticeable lag/jank when scrolling. After scrolling past a certain point, the reveal animation starts behaving slowly or appears delayed.

Do NOT redesign the interaction.

Keep the existing 3-image directional reveal exactly as specified, but rewrite the animation implementation for smooth 60fps performance.

## Root Problem to Investigate

First inspect the existing implementation and identify whether any of the following are causing the lag:

* Scroll event listeners triggering reveal calculations.
* `setState()` being called on every mouse/pointer movement.
* React component re-renders on every pointer movement.
* `getBoundingClientRect()` being called excessively.
* Layout measurements being performed inside every animation frame.
* `mousemove` handlers directly modifying React state.
* Multiple product cards simultaneously processing pointer events.
* Large images being decoded during interaction.
* `clip-path` being recalculated inefficiently.
* CSS transitions fighting against continuously updated pointer positions.
* Multiple `requestAnimationFrame` loops running simultaneously.
* Event listeners not being cleaned up.
* Expensive effects such as blur, filters, shadows or backdrop-filter being repainted during movement.
* Scroll handlers and pointer handlers competing for the main thread.

Fix the actual bottleneck rather than simply increasing transition duration.

---

# Critical Rule

## Scroll must NOT control the image reveal.

The product reveal must respond to:

```text
pointer movement
```

not:

```text
window scroll
```

Scrolling the page should have almost no effect on the reveal animation.

When the user scrolls:

```text
page scroll
    ↓
product cards move
    ↓
NO reveal calculations
```

Only when the pointer moves over an active product card:

```text
pointer movement
    ↓
calculate pointer position
    ↓
update reveal
```

---

# Use Pointer Events

Prefer:

```javascript
onPointerEnter
onPointerMove
onPointerLeave
```

over continuously listening to:

```javascript
window.addEventListener("scroll")
window.addEventListener("mousemove")
```

The card should own its own pointer interaction.

Do not attach a global mousemove listener for every ProductCard.

---

# Do NOT Store Pointer Coordinates in React State

Avoid this pattern:

```javascript
const [mouseX, setMouseX] = useState(0);
const [mouseY, setMouseY] = useState(0);

const handleMouseMove = (e) => {
  setMouseX(e.clientX);
  setMouseY(e.clientY);
};
```

This can cause unnecessary React rendering on every pointer movement.

Instead use:

```text
useRef
+
requestAnimationFrame
+
direct DOM/CSS variable updates
```

Pointer coordinates should live in refs.

Conceptually:

```javascript
const pointerRef = useRef({
  x: 0,
  y: 0
});

const frameRef = useRef(null);
```

---

# requestAnimationFrame Architecture

Pointer movement should only update the latest target position.

Do NOT perform expensive rendering directly inside the pointer event.

Conceptually:

```javascript
const handlePointerMove = (event) => {
  pointerRef.current.x = event.clientX;
  pointerRef.current.y = event.clientY;

  if (!frameRef.current) {
    frameRef.current = requestAnimationFrame(updateReveal);
  }
};
```

Then:

```javascript
const updateReveal = () => {
  frameRef.current = null;

  // calculate reveal
  // update CSS variables

  // schedule another frame only if necessary
};
```

Never create multiple simultaneous animation loops.

---

# Use CSS Variables

The reveal position should preferably be communicated to CSS using CSS custom properties.

Example:

```css
.product-image {
  --reveal-x: 50%;
  --reveal-y: 50%;
}
```

Then use these variables in the clipping/masking system.

For example:

```css
.reveal-image {
  clip-path: inset(
    0
    calc(100% - var(--reveal-x))
    0
    0
  );
}
```

Adapt the exact clipping calculation to the current implementation.

The important architecture is:

```text
Pointer
   ↓
requestAnimationFrame
   ↓
CSS variables
   ↓
GPU/compositor-friendly rendering
```

rather than:

```text
Pointer
   ↓
React setState
   ↓
component render
   ↓
DOM update
   ↓
layout
   ↓
paint
```

---

# Cache Card Dimensions

Do NOT call:

```javascript
element.getBoundingClientRect()
```

on every pointer event or every animation frame.

Measure the card when necessary:

```text
pointer enters
resize
layout changes
```

Cache:

```text
cardWidth
cardHeight
cardLeft
cardTop
```

Then calculate pointer position using the cached values.

If the page scrolls, remember that `clientX/clientY` are viewport coordinates.

Either:

1. refresh the cached bounding rectangle appropriately, or
2. calculate using a coordinate system that remains correct during scrolling.

Do not continuously force layout measurement during scrolling.

---

# Important: Avoid Layout Thrashing

Never mix repeated layout reads and writes like this:

```javascript
const rect = element.getBoundingClientRect();

element.style.transform = ...;

const rect2 = element.getBoundingClientRect();

element.style.clipPath = ...;
```

This can force synchronous layout recalculation.

Instead:

```text
READ
↓
calculate
↓
WRITE
```

Keep DOM reads and writes separated.

---

# Optimize the Three Images

All three product images should be loaded intelligently.

The primary image should load immediately.

The secondary and tertiary reveal images can be:

```text
preloaded
```

or loaded with an appropriate strategy so that they are available before interaction.

Do NOT allow the first pointer movement to trigger a huge image decode that causes a visible frame drop.

Images should also use appropriate dimensions and compression.

Do not load a 5–10MB source image into every card if a smaller optimized version is sufficient.

---

# Prevent Image Layout Shifts

Every product card must have a fixed/known image aspect ratio.

For example:

```css
.product-image-container {
  aspect-ratio: 3 / 4;
  overflow: hidden;
}
```

Do not allow image dimensions to change after loading.

The three images should occupy exactly the same:

```text
width
height
position
```

and should be stacked:

```text
IMAGE 1
IMAGE 2
IMAGE 3
```

using absolute positioning.

---

# Layer Architecture

Use a stable image stack:

```text
ProductCard
│
├── ImageContainer
│   ├── Image 1
│   ├── Image 2
│   └── Image 3
│
└── CenterActions
```

Images:

```css
position: absolute;
inset: 0;
width: 100%;
height: 100%;
object-fit: cover;
```

Do not move the actual image elements around.

Only change their clipping/reveal state.

---

# GPU-Friendly Animation

Use properties that are cheap to animate where possible:

```text
transform
opacity
clip-path
mask
```

Avoid continuously animating:

```text
width
height
top
left
margin
padding
box-shadow
filter: blur(...)
backdrop-filter
```

especially during pointer movement.

If `clip-path` causes excessive repainting in the current browser implementation, test an alternative masking strategy rather than blindly keeping it.

---

# will-change

Use `will-change` carefully.

For the currently interactive reveal layer:

```css
will-change: clip-path;
```

or the appropriate property.

Do NOT put:

```css
will-change: transform;
```

on every product card permanently.

That can unnecessarily consume GPU/compositor resources when there are many cards.

Only promote layers when it provides a measurable benefit.

---

# Only Animate the Active Card

If there are 20 products on the page:

```text
20 ProductCards
```

only the card under the pointer should perform continuous animation calculations.

Do NOT run:

```text
20 requestAnimationFrame loops
```

simultaneously.

Architecture:

```text
Inactive cards
→ static

Active card
→ pointer tracking
→ reveal calculation
→ animation
```

---

# Direction Detection

Keep the existing directional behavior:

```text
TOP    → Image 2 revealed from top
BOTTOM → Image 2 revealed from bottom
LEFT   → Image 3 revealed from left
RIGHT  → Image 3 revealed from right
```

Do not repeatedly recalculate entry direction unnecessarily.

Determine the initial direction when the pointer enters.

Then track the pointer position smoothly.

---

# Smooth Interpolation

Do not make the reveal boundary jump directly to the pointer.

Use interpolation if necessary:

```javascript
current += (target - current) * 0.15;
```

or an equivalent animation approach.

This should create a subtle physical-following effect.

However, do not use a long CSS transition such as:

```css
transition: all 500ms;
```

because pointer movement can continuously change the target and cause lag.

The reveal should feel:

```text
fast
fluid
responsive
```

rather than:

```text
slow
floaty
delayed
```

---

# No transition: all

Never use:

```css
transition: all;
```

on the continuously updated reveal layer.

It can cause multiple properties to animate unnecessarily.

If transitions are required, specify individual properties.

---

# Scroll Performance

Audit the entire Product section for:

```javascript
scroll
wheel
touchmove
```

listeners.

If a scroll listener exists only to update product reveal state, remove it.

If another part of the website genuinely requires scroll animation:

* Use passive listeners where appropriate.
* Throttle expensive work.
* Prefer IntersectionObserver for visibility detection.
* Do not couple scroll animation state with ProductCard pointer state.

The product reveal must remain independent from page scrolling.

---

# IntersectionObserver

If cards need to know whether they are visible:

use:

```javascript
IntersectionObserver
```

instead of continuously checking:

```javascript
getBoundingClientRect()
```

during scroll.

Use IntersectionObserver only for visibility/lazy-loading logic, not for pointer reveal positioning.

---

# React Rendering

Use React state only for actual UI state such as:

```text
isHovered
activeDirection
showActions
```

Even these should not update dozens of times per second.

Continuous values such as:

```text
pointerX
pointerY
revealProgress
```

should use refs/CSS variables.

---

# Mobile

On touch devices, disable the desktop pointer-reveal loop.

Do not run unnecessary pointer animation on mobile.

Use a static/appropriate touch interaction.

Detect pointer capability rather than assuming every device has a mouse.

---

# Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

and disable/reduce the reveal animation.

---

# Debugging Requirement

Before finalizing, test the implementation with browser DevTools Performance tools.

Check:

```text
FPS
Main Thread
Recalculate Style
Layout
Paint
Composite Layers
JavaScript execution
```

Specifically determine what causes the lag during:

```text
1. Normal page scrolling
2. Entering a product card
3. Moving the pointer rapidly
4. Moving the pointer slowly
5. Scrolling while the pointer is over a product card
6. Moving between multiple product cards
```

Fix the underlying expensive operation.

Do not simply reduce animation quality to hide the problem.

---

# Acceptance Criteria

The final implementation should satisfy:

* Scrolling does not trigger product reveal calculations.
* Product reveal is controlled by pointer movement.
* No React state update occurs for every pointer coordinate.
* No global mousemove listener is required.
* No continuous `getBoundingClientRect()` calls during pointer movement.
* Only the active product card performs reveal calculations.
* Only one requestAnimationFrame loop exists per active interaction.
* Pointer movement remains responsive during page scrolling.
* Images are preloaded/optimized sufficiently to avoid first-interaction decoding stutter.
* Reveal movement feels immediate but smoothly interpolated.
* No `transition: all` is used for the reveal.
* No unnecessary layout-triggering properties are animated.
* Product card maintains 60fps as closely as reasonably possible.
* Existing directional reveal behavior remains unchanged.
* Existing colors and design remain unchanged.

Most importantly:

**Do not solve the lag by slowing the animation down. Solve the rendering/performance bottleneck.**
