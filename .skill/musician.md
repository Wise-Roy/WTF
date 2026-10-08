## Musicians Page — Full Implementation Specification

Build a dedicated **Musicians** page with a cinematic introduction followed by an interactive 3D revolving musician carousel.

The page should be fully data-driven from the admin panel.

---

# 1. Admin — Musician Management

Add a new **Musician** subsection inside the existing Admin dashboard.

Admin should be able to:

* Add a musician
* Upload musician photo
* Enter musician name
* Edit musician
* Delete musician
* View all existing musicians

### Musician Data

Each musician should have:

```text
id
name
photo
created_at
updated_at
```

The frontend must fetch musicians dynamically from the backend/API.

Do NOT hardcode musician data inside the frontend.

---

# 2. Supabase Storage

Create a dedicated Supabase Storage bucket for musician images.

Use a structure similar to the existing image-storage implementation.

Example:

```text
musicians/
  musician-id/
    image.webp
```

The musician image should be uploaded to Supabase Storage and stored/retrieved using the **same signed URL approach already used elsewhere in the project**.

Important:

* Do not make the bucket unnecessarily public.
* Generate signed URLs when fetching/displaying musician images.
* Store the storage path/reference in the database rather than permanently storing a temporary signed URL.
* Handle expired signed URLs by generating a fresh URL when required.

The API should handle:

```text
POST   /musicians
GET    /musicians
GET    /musicians/:id
PUT    /musicians/:id
DELETE /musicians/:id
```

Use the project's existing authentication, authorization, API and database patterns.

Only authorized admins should be able to create, edit or delete musicians.

---

# 3. Navbar Navigation

Keep the existing navbar design exactly as it currently is.

Add/use the **Musicians** navbar item.

When the user clicks:

```text
Musicians
```

navigate to:

```text
/musician
```

Do not redesign the navbar.

The navbar should initially remain **transparent**, preserving the existing visual behavior of the website.

---

# 4. `/musician` Page — Hero Introduction

The page should begin with a cinematic black section.

Use a deep black background.

At the center of the initial viewport, display this exact text:

> Music plays a central role in igniting my fumes and these artists aren't just inspos but dream collaborators.
> Their creativity lives on in the clothes I create, every track, every EP, every LP.

The typography should feel editorial, artistic and premium.

Center-align the text.

Give it enough breathing room so it feels like an intentional introduction rather than a normal website heading.

---

# 5. Cloud Transition

At the bottom-left and bottom-right edges of the initial viewport, place **large soft white clouds**.

The clouds should partially enter the viewport from both bottom corners.

They should feel atmospheric and organic rather than like simple CSS circles.

The initial composition should look approximately like:

```text
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│        Music plays a central role...        │
│                                             │
│        ...every track, every EP, every LP.  │
│                                             │
│                                             │
│  ☁️                                     ☁️  │
└─────────────────────────────────────────────┘
```

The clouds are part of the transition into the musician section.

---

# 6. Scroll Transition

As the user starts scrolling:

### Initial state

* Black background
* Centered introductory text
* Clouds visible at bottom-left and bottom-right

### During scroll

Keep the overall text position visually controlled so it initially feels anchored/static.

As scrolling progresses:

* The introductory text should eventually move upward and out of the viewport.
* The clouds should move upward/reveal the content below them.
* The musician cards should begin appearing from underneath the cloud layer.
* The transition should feel like the clouds are **revealing another world underneath**.

Do not simply fade everything out.

The desired effect is:

```text
INITIAL

       INTRO TEXT

   ☁️             ☁️


SCROLL ↓


       INTRO TEXT ↑


   ☁️             ☁️
────────────────────────
      3D CARDS BEGIN
       APPEARING


SCROLL ↓


       INTRO TEXT
             ↑


        3D MUSICIAN
          CAROUSEL
```

The cloud layer should act as a visual bridge between the intro and the carousel.

Use GSAP ScrollTrigger for the scroll choreography.

---

# 7. Musician 3D Carousel

After the introductory section, display all musicians fetched from the API inside an interactive **3D circular/ring carousel**.

All entered musician cards should exist simultaneously in a 3D circular/ring arrangement around a central camera/viewpoint.

The cards should appear to revolve around the user in a circular path rather than simply sliding horizontally.

Each musician card contains:

* Musician photo
* Musician name

The name displayed beneath/around the active card should use the site's **neon accent color**.

---

# 8. 3D Ring

Arrange the musician cards around an invisible circular ring using:

* `perspective`
* `transform-style: preserve-3d`
* `translateZ()`
* `rotateY()`
* GSAP transforms

Cards farther around the ring should visually move into the background and become smaller/dimmer.

The card closest to the camera becomes the **active/front musician**.

The active card should:

* Be largest
* Be sharp
* Be visually dominant
* Face directly toward the user
* Sit at the center of the viewport
* Have the strongest visual emphasis

Cards behind it should maintain proper 3D depth.

---

# 9. Card Interaction

Support three interaction methods.

### Drag

Users can drag left/right to rotate the entire ring.

The movement should have:

* Momentum
* Inertia
* Smooth deceleration
* Natural physical feeling

When the user releases the mouse/touch, the ring should continue moving briefly and then settle.

---

### Mouse Wheel / Trackpad

Scrolling while interacting with the carousel should rotate the ring horizontally.

Do not make it behave like a conventional horizontal slider.

Convert wheel movement into smooth rotational movement.

Avoid unwanted vertical page movement while the carousel interaction is active.

---

### Click

Clicking any musician card should rotate the entire ring until that musician reaches the front.

Do not instantly change the active card.

The clicked card should physically travel around the ring into the camera position.

Animate the shortest rotational path using GSAP.

---

# 10. Active Card Rotation

When a musician reaches the front:

* Rotate the card so its photo faces the camera.
* Never allow the active photo to appear backwards.
* Maintain readable orientation throughout the movement.
* Use billboard-style orientation or dynamically calculate the Y rotation.

The transition should feel like the musician photo is physically travelling around a 3D circular track.

---

# 11. Active Musician Information

When a musician becomes the active/front card, display their name below the carousel.

Example:

```text
MUSICIAN NAME
```

The musician name must use the site's **neon color**.

Use a large editorial typography treatment.

Animate the name when the active musician changes:

1. Existing name moves/fades out.
2. New musician name enters.
3. Use subtle GSAP motion.
4. Do not abruptly replace the text.

The displayed name must always correspond to the musician currently positioned at the front.

---

# 12. Card Visual Hierarchy

The carousel should feel cinematic and dimensional.

Example:

```text
             BACKGROUND
        [ ]       [ ]       [ ]

                  ↓

             [ ACTIVE ]
              MUSICIAN

           MUSICIAN NAME
```

Use:

* Scale based on depth
* Opacity based on depth
* Perspective
* Shadows
* Depth-based positioning
* Subtle blur for distant cards if appropriate

Avoid excessive visual effects.

The active musician should feel physically closer to the camera.

---

# 13. Mathematical Ring Positioning

Use an angle-based system for the ring.

Conceptually:

```text
angle = index × (360 / totalCards) + currentRotation
```

Calculate each card's position based on its angle around the ring.

This should make:

* Dragging
* Momentum
* Wheel rotation
* Click-to-front
* Snapping

work from the same underlying rotation state.

When the carousel stops, automatically snap the nearest musician precisely into the front-center position.

There should always be exactly one clearly active musician.

---

# 14. Ambient Background

When the active musician changes, sample the active musician's image color.

Use the sampled color to create a very subtle ambient blurred glow behind the carousel.

Transition the background glow smoothly with GSAP.

Do not allow the background effect to overpower the musician photo.

---

# 15. Responsive Design

### Desktop

Show:

* Large active musician
* Several neighboring musicians
* Strong 3D depth
* Large circular composition

### Tablet

Reduce:

* Card size
* Ring radius
* Depth spacing

### Mobile

Maintain the 3D concept while simplifying the composition.

* Show fewer neighboring cards
* Keep active musician prominent
* Support touch/swipe
* Maintain momentum
* Keep name readable
* Ensure no horizontal page overflow
* Ensure the carousel fits the viewport

The intro text and clouds must also scale correctly on mobile.

---

# 16. Performance

Do not use:

* Three.js
* WebGL
* Canvas 3D
* Heavy 3D libraries

Use:

* HTML
* CSS
* JavaScript/TypeScript
* GSAP
* GSAP ScrollTrigger

Use GPU-friendly transforms:

```text
translate3d()
rotateY()
scale3d()
```

Avoid continuously animating:

```text
top
left
width
height
```

Use transforms and opacity wherever possible.

---

# 17. Data Flow

The final architecture should be:

```text
ADMIN
   ↓
Musician Management
   ↓
Upload Photo + Name
   ↓
Supabase Storage
   ↓
Database
   ↓
Musician API
   ↓
/musician page
   ↓
Fetch musicians
   ↓
Generate signed image URLs
   ↓
3D Carousel
```

If the admin adds a new musician, that musician should automatically appear on `/musician` after the frontend fetches the updated API data.

If a musician is deleted, it should no longer appear on the page.

---

# 18. Empty State

If there are no musicians yet, do not render an empty carousel.

Show a tasteful empty state such as:

```text
No musicians yet.
```

Only render the 3D carousel once musician data is available.

---

# 19. Final Experience

The complete experience should feel like a **fashion editorial / music-inspired cinematic experience**, not a conventional CRUD page.

The user journey should be:

```text
Navbar
   ↓
Musicians
   ↓
/musician
   ↓
Black cinematic intro
   ↓
Centered music statement
   ↓
White clouds at bottom corners
   ↓
User scrolls
   ↓
Text moves upward
   ↓
Clouds reveal the content underneath
   ↓
3D musician cards emerge
   ↓
Cards revolve around the camera
   ↓
User drags / scrolls / clicks
   ↓
Selected musician rotates to front
   ↓
Musician photo faces camera
   ↓
Musician name appears in C6FF00
```

The final implementation should be **fully connected to the existing admin/API/Supabase architecture**, not a standalone mockup.

Reuse existing project components, authentication, API conventions, Supabase configuration, styling system, fonts and design tokens wherever possible. Do not unnecessarily rewrite existing functionality.
