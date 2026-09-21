Update the homepage hero section of the **Worship the Fumes** website with a bold, immersive typography animation.

### Hero Text

Display the main headline as:

**WORSHIP THE [FUMES]**

The word inside the brackets should be an animated rotating word sequence:

**FUMES → NOISE → CHAOS → RHYTHM → ENERGY → VIBE**

The words should continuously transition one after another using a **vertical slide-up animation**.

### Animation Behavior

* Keep **“WORSHIP THE”** completely static.
* Only the final word should animate.
* The changing word should slide **upward and out of view**.
* Simultaneously, the next word should enter **from below**.
* Use a smooth, premium **parallax-style vertical transition** rather than a basic text fade.
* The outgoing and incoming words should have a slight vertical displacement and easing to create depth.
* The animation should feel organic, cinematic and slightly unpredictable rather than like a standard carousel.
* Pause briefly on each word before transitioning.
* Use a smooth `ease-in-out` or custom cubic-bezier easing.
* Avoid excessive bounce or elastic effects.

### Visual Direction

Make the hero feel like an **Awwwards-style creative agency / music / culture website**.

Use:

* Large oversized typography
* Strong contrast
* Generous negative space
* Subtle movement in the background
* Smooth scrolling
* Layered parallax depth
* Premium typography
* Minimal UI around the hero

The changing word should be visually dominant and feel like it is physically moving through the page.

### Scroll Interaction

Also connect the hero animation subtly with scroll position:

* As the user scrolls, the hero typography should move at a slightly different speed from the background.
* Introduce subtle vertical parallax between the headline, background imagery and secondary elements.
* Do not make the effect distracting or reduce readability.
* The first viewport should immediately communicate the brand identity.

### Technical Requirements

Build the animation using the project's existing framework and animation libraries where available.

Prefer:

* CSS transforms / `translateY`
* `overflow: hidden`
* GPU-friendly transforms
* `requestAnimationFrame` only where necessary
* Framer Motion / GSAP if already installed

Do **not** introduce a heavy animation dependency if an existing project library can handle it.

The animation must:

* Be responsive
* Work smoothly on mobile and desktop
* Respect `prefers-reduced-motion`
* Avoid layout shifts
* Keep the headline accessible to screen readers
* Maintain consistent word width/positioning during transitions

### Desired Experience

The final result should feel like the phrase itself is continuously evolving:

**WORSHIP THE FUMES**
↓
**WORSHIP THE NOISE**
↓
**WORSHIP THE CHAOS**
↓
**WORSHIP THE RHYTHM**
↓
**WORSHIP THE ENERGY**
↓
**WORSHIP THE VIBE**

The transition should feel like a **physical vertical displacement of typography**, integrated into the overall parallax experience rather than a simple text-changing animation.
