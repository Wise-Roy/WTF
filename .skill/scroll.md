Create a sleek horizontal scrolling card experience driven by the user's vertical scroll. The cards should not behave like a conventional carousel with arrows or discrete slide changes. Instead, convert the user's scroll progress into continuous horizontal movement across a card track.

The horizontal movement must be extremely smooth and fluid, using interpolation/inertia so cards never abruptly jump or snap. As the user scrolls, cards continuously travel horizontally through the viewport.

The card closest to the viewport center should automatically become the active card. The active card should appear larger, slightly closer to the camera, sharper and more prominent, while neighboring cards should appear smaller and slightly farther away. As the user continues scrolling, the next card should smoothly move toward the center and transition into the active position while the previous card moves away.

Add a subtle 3D/depth/parallax effect based on each card's distance from the center. Scale, opacity, rotation and translate-Z should change progressively rather than switching suddenly. The transition between cards must feel continuous and cinematic.

The horizontal section should behave as a scroll-driven sequence: while the user is within this section, vertical scroll progress controls horizontal card movement. Once all cards have passed through the sequence, normal vertical page scrolling resumes.

Do not make the entire page horizontally scrollable. Only the card track should move horizontally. Do not use abrupt scroll snapping.

Make the interaction fully responsive. On desktop, show the active card prominently with portions of neighboring cards visible on both sides. On mobile, reduce card width appropriately while maintaining the same center-focused depth effect.

Prioritize 60fps performance: use transform-based animations (translate3d, scale, etc.) instead of repeatedly changing layout properties such as left, width, or margin. Use requestAnimationFrame and avoid expensive DOM calculations on every scroll event. Respect prefers-reduced-motion.

Overall visual feeling: premium, cinematic, smooth, interactive AI/product showcase — cards should feel like they are traveling through a 3D horizontal space as the user scrolls.