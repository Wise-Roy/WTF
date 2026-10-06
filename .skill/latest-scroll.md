Create a **responsive horizontal 3D card carousel** for the UI.

### Core Interaction

* The cards must be arranged **horizontally**, not vertically.
* The carousel should contain multiple cards that can be browsed by **horizontal scrolling/swiping**.
* **Do NOT make the cards move based on the page's vertical scroll.**
* The horizontal card movement should happen when the user **horizontally scrolls/swipes the carousel itself**.
* On desktop, support:

  * Mouse drag / click-and-drag
  * Trackpad horizontal scrolling
  * Horizontal wheel gestures where appropriate
* On mobile, support natural **touch swipe gestures**.

### 3D Positioning

Display **3 cards prominently at a time**:

```text
        BACK             CENTER             BACK
      ┌───────┐         ┌─────────┐       ┌───────┐
      │ Card  │         │  CARD   │       │ Card  │
      │       │         │  ACTIVE │       │       │
      └───────┘         └─────────┘       └───────┘
        smaller            larger            smaller
        behind             closest           behind
```

* The **center card should appear closest to the camera**.
* The center card should be:

  * Slightly larger
  * Fully opaque
  * Slightly elevated
  * More visually prominent
  * Have a stronger shadow/depth
* The two neighboring cards should appear **slightly behind the center card**:

  * Smaller scale
  * Slightly reduced opacity
  * Lower visual prominence
  * Positioned slightly farther back using `translateZ()` / scale / perspective where appropriate.
* As the user swipes horizontally, the cards should smoothly transition:

  * Left card → center
  * Center card → right/back
  * Right card → center
* The 3D depth effect should continuously interpolate during the swipe rather than abruptly changing after the swipe.

### Important Scrolling Behavior

The carousel should behave like an **independent horizontal scrolling component**.

**Do NOT implement:**

```text
Page vertical scroll
       ↓
Cards automatically move horizontally
```

Instead implement:

```text
User horizontally swipes/scrolls carousel
                →
       ┌─────────────────┐
       │ ← Card Card Card → │
       └─────────────────┘
                ↓
       Cards move horizontally
```

The rest of the page should remain vertically scrollable **independently**.

### Responsiveness

The number and size of visible cards must adapt automatically to the viewport.

#### Desktop

* Show approximately **3 cards**.
* Center card should be large and dominant.
* Neighboring cards should partially overlap/peek from behind.
* Maintain the 3D perspective effect.

#### Tablet

* Show approximately **2–3 cards**, depending on available width.
* Keep the active card clearly dominant.
* Reduce card dimensions and spacing proportionally.

#### Mobile

* Prioritize **one main card**.
* Allow the neighboring cards to partially peek from the sides.
* Use touch/swipe gestures.
* Cards should never overflow the viewport horizontally.
* The active card should remain centered.
* Do not shrink the cards so much that their content becomes difficult to read.

### Animation

Make the interaction feel **smooth, premium and physical**.

Use:

* Smooth transform interpolation
* `transform: translateX() scale() translateZ()`
* CSS perspective
* GPU-accelerated transforms
* `will-change: transform`
* Spring-like or ease-out snapping after the user releases the drag/swipe

Avoid:

* Heavy JavaScript animations running continuously
* Animating `width`, `height`, `top`, `left`, or other layout properties
* Large background videos or expensive effects
* Anything that causes frame drops during scrolling

### Carousel Behavior

* Infinite looping is preferred.
* When the user reaches the last card, smoothly continue to the first card.
* Add optional pagination indicators below the carousel.
* The active/center card should always be clearly identifiable.
* The carousel should snap naturally to the nearest card after the gesture ends.

### Visual Direction

The overall appearance should feel like a **premium 3D product/member showcase**, with the center card visually coming toward the user while neighboring cards recede into the background.

Think of the interaction as:

**Swipe → cards physically travel through a 3D horizontal space → new card comes forward → previous card moves backward.**

The carousel must remain **fully responsive, touch-friendly, performant, and independent from the page's vertical scrolling.**
