# Task: Add Spotify Playlist Embed to the `/designer` Page

Implement a new Spotify playlist section **immediately below the existing `DesignerHero` component** on the `/designer` page.

## 1. Inspect Before Implementing

Before making changes, inspect:
- The `/designer` page and its component hierarchy.
- The existing `DesignerHero` component.
- The footer component where the Spotify link is currently displayed.
- The admin settings and database/API logic responsible for storing and retrieving that Spotify URL.

Understand the existing implementation before writing code. Reuse the existing configuration and data-fetching logic wherever possible.

## 2. Spotify Playlist Integration

Use Spotify's official playlist embed player rather than building a custom music player.

Reference playlist URL:
https://open.spotify.com/playlist/13bXkJFzbHqT2LTw5rkD3O

The playlist must be embedded using an iframe pointing to Spotify's embed URL. Derive the embed URL from the configured Spotify playlist URL instead of hardcoding the playlist ID in the component.

For example, the embed URL for the reference playlist is:

`https://open.spotify.com/embed/playlist/13bXkJFzbHqT2LTw5rkD3O`

Spotify should handle the playlist artwork, song listing, playback controls and playback functionality supported by its embed player. Do not create a separate custom audio player.

## 3. Reuse the Existing Admin-Managed Spotify URL

The footer already uses a Spotify URL configured through the admin panel.

**Reuse that exact same data source for the `/designer` playlist section.**

Requirements:
- Do not create a new Spotify setting.
- Do not add a duplicate database column or environment variable.
- Do not hardcode the reference playlist URL as the permanent source of truth.
- Use the existing admin-managed URL to generate the Spotify embed URL.
- When an admin updates the Spotify URL, the footer and designer section must both use the updated value.
- Handle missing or invalid URLs gracefully without crashing the page.
- If the existing configuration is empty, follow the project's established fallback behavior. Do not introduce a separate fallback configuration.

Only support valid Spotify playlist URLs for this section. Do not blindly transform arbitrary URLs into iframe sources.

## 4. Section Layout and Styling

Place the new section directly after `DesignerHero` without changing the hero itself.

Design requirements:
- Use a **grey background** for the entire Spotify section.
- Choose a suitable neutral grey that fits the existing website's design system.
- Keep the section visually clean, modern and minimal.
- Display a clear section heading, such as "Listen Along" or "The Playlist".
- On desktop, arrange the section in two columns:
  - **Left:** A visual playlist preview or cover area.
  - **Right:** The embedded Spotify playlist player.
- On mobile, stack the two areas vertically.
- Give the section appropriate padding, spacing and responsive widths.
- Ensure the Spotify player fits its container without horizontal overflow.
- Use the existing website fonts and styling conventions.
- Avoid unnecessary animations, decorative elements or new dependencies.

The official Spotify iframe must remain responsible for displaying the playlist and its tracks. Do not fabricate a separate song list or duplicate the Spotify interface.

If Spotify's embed already displays the artwork adequately, do not fetch or recreate the same artwork unnecessarily.

## 5. Embed Implementation Details

- Use the existing React/Next.js conventions in the project.
- Render the iframe with a responsive width and an appropriate height.
- Include a descriptive `title` attribute for accessibility.
- Use lazy loading where appropriate.
- Allow only the iframe permissions required for Spotify playback and related supported functionality.
- Ensure the embed URL is validated before rendering.
- Handle unavailable embeds or blocked third-party content gracefully.
- Do not expose secrets or introduce unnecessary Spotify API credentials.

The iframe should display Spotify's own player. Do not assume that the website can directly control Spotify playback or read the iframe's internal track data.

## 6. Strict Scope Restrictions

**Do not change anything else anywhere in the project.**

Specifically:
- Do not modify `DesignerHero`.
- Do not change the existing navbar or footer layout.
- Do not modify the admin panel or its Spotify settings.
- Do not change database schemas, API contracts, authentication or authorization.
- Do not modify global CSS, shared themes, fonts or other page components unless an absolutely necessary, narrowly scoped change is required for this section.
- Do not refactor unrelated code.
- Do not install new dependencies unless absolutely necessary.
- Do not alter any other route or existing functionality.

Reuse the existing admin-managed Spotify URL without changing how administrators configure it.

## 7. Verification Checklist

After implementation, verify that:

1. The new section appears immediately below `DesignerHero`.
2. The section has a grey background.
3. The playlist is displayed through Spotify's official embedded player.
4. The playlist URL comes from the same admin-managed source as the footer.
5. Updating that URL updates the playlist embed as well.
6. The layout works on desktop and mobile.
7. Invalid or missing playlist URLs do not crash the page.
8. The existing footer, navbar, hero and all unrelated pages remain unchanged.

Implement only this feature. Review the final diff and remove any unrelated modifications before finishing.

At completion, report which files were changed, how the existing Spotify URL was reused, and the verification performed.`