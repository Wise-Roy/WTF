# Hero Scroll Animation — Three Images Expanding from a Central Stack

Reference: https://www.gradwear.ca/pages/about-us

Implement a scroll-driven hero animation inspired by the reference. The animation must use exactly three photographs managed through the existing admin panel and the central text “Designer”.

### 1. Initial arrangement

At the top of the page, before the user scrolls:

- Position all three photographs around the exact horizontal and vertical center of the hero.
- Stack the photographs on top of one another, with their centers initially very close together.
- Image 1 is the frontmost image, centered in the viewport.
- Image 2 sits immediately behind Image 1, offset slightly toward the left so a small portion of its edge is visible.
- Image 3 sits immediately behind Image 1, offset slightly toward the right so a small portion of its edge is visible.
- The three images must visibly read as one overlapping central stack, not as three independent cards spread across the screen.
- Place the word “Designer” prominently over the central image, centered horizontally and vertically. Keep the text readable above the image layers.
- Establish the correct stacking order using CSS positioning and `z-index`.

All images must be loaded from the three image slots in Admin → Hero Section Settings.

### 2. Scroll-driven separation

As the user scrolls downward, progressively expand the three-image stack outward from its central position.

The movement must be directly linked to scroll progress, rather than a timer or a one-time entrance animation.

**Image 1 — Center**

- Begin at the center of the stack.
- Remain near the horizontal center throughout the reveal.
- Gradually move toward its intended final vertical or slightly adjusted position if needed to match the reference composition.
- Keep it visually prominent as the central photograph.

**Image 2 — Left**

- Begin directly behind Image 1, with a small visible offset to the left.
- As scrolling progresses, move horizontally toward the left side of the viewport.
- Gradually reveal the entire photograph as it separates from the central stack.
- Do not make it suddenly appear or teleport to its final position.

**Image 3 — Right**

- Begin directly behind Image 1, with a small visible offset to the right.
- As scrolling progresses, move horizontally toward the right side of the viewport.
- Gradually reveal the entire photograph as it separates from the central stack.
- Synchronize its movement with Image 2, but allow slightly different movement distances or timing if that improves the visual composition.

The left image must travel left, the right image must travel right, and the center image must retain its central identity. The reveal should feel as if the original stack is physically opening apart.

### 3. Reveal progression

Divide the animation into one continuous scroll-controlled sequence.

- At 0% progress: all three photographs are almost completely overlapped at the center.
- At approximately 25% progress: the left and right photographs begin separating, exposing more of their edges.
- At approximately 50% progress: both outer photographs are visibly moving outward and becoming independently recognizable.
- At approximately 75% progress: the photographs are nearly in their final positions.
- At 100% progress: all three photographs are clearly visible in a balanced three-image composition.

These percentages are initial tuning targets, not mandatory timings. Adjust them after inspecting the reference and testing the result.

Do not implement the reveal as three independent fade-ins. The key visual effect is the progressive spatial separation of the photographs.

### 4. Text movement

Coordinate the “Designer” text with the same scroll-driven animation.

- Start with the word centered over the initial image stack.
- Animate its horizontal position from left to right from the viewer's perspective, following the movement observed in the reference.
- Synchronize the text movement with the outward separation of the photographs.
- Preserve readability and the intended visual hierarchy.
- Do not allow the text to collide awkwardly with the photographs or disappear before the image reveal completes.

If inspection of the reference shows that the text follows a different path, reproduce the observed path rather than inventing a conflicting motion.

### 5. Hero pinning and scroll behavior

If required to reproduce the reference's scroll effect, pin the hero temporarily while the images separate.

- Keep the hero scene stationary in the viewport while its animation progresses.
- Use the scroll distance to control animation progress.
- Release the pinned hero naturally when the animation completes so the rest of the website scrolls normally.
- Scrolling upward must reverse the animation smoothly and restore the original stacked arrangement.

### 6. Technical implementation

- Inspect the existing framework, image storage, admin settings, and animation dependencies before making changes.
- Prefer GSAP with ScrollTrigger for a synchronized, scrubbed animation if appropriate for the existing project.
- Animate `transform` properties, particularly `translate` and `scale`, instead of continuously changing layout dimensions.
- Use one shared scroll timeline to coordinate all three photographs and the “Designer” text.
- Maintain consistent image dimensions and use `object-fit: cover`.
- Make the final composition responsive across desktop, tablet, and mobile.
- Respect reduced-motion preferences.
- Avoid unnecessary changes to unrelated sections, routes, or admin functionality.

### 7. Completion criteria

The implementation must reproduce this exact core transformation:

CENTRAL OVERLAPPED STACK → THREE IMAGES SEPARATING → LEFT IMAGE MOVES LEFT, CENTER IMAGE STAYS CENTRAL, RIGHT IMAGE MOVES RIGHT → THREE DISTINCT VISIBLE IMAGES.

The three photographs must be editable through the admin panel, and replacing an image must not require changing the animation code.

Test the initial state, intermediate scroll positions, completed state, reverse scrolling, mobile layout, and normal page scrolling after the animation ends.