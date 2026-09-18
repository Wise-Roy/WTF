1. The parallax (image moves, content stays stable)
The trick: two layers inside the same hero section scroll at different speeds.
The hero section is position: relative with a fixed height (full screen) and overflow: hidden.
The image layer is position: absolute behind everything, oversized (inset: -15% + scale(1.1)) so it never shows empty edges while it moves.
The text/content layer is a separate element with position: relative and a higher z-index. It sits in the normal document flow, so it scrolls away naturally with the page — that's what makes it feel "stable" while the image drifts.

How the movement is calculated:
On every scroll event, measure the image's position relative to the viewport center: distance = elementCenter − viewportCenter.
Multiply that distance by a speed factor (e.g. 0.35). Positive speed = image moves slower than the page (classic depth effect); negative speed = it moves faster or opposite.
Apply the result as transform: translate3d(0, offset, 0) directly to the image layer.
The scroll handler runs through requestAnimationFrame (so it fires at most once per frame, not on every scroll tick), and everything is disabled when the visitor has "reduce motion" turned on. On small screens the speed is halved instead of removed.

Formula to reuse:
offset = (elementCenterY - viewportCenterY) * speed
image.style.transform = `translate3d(0, ${offset}px, 0)`
Multiple layers with different speeds (e.g. +0.35 for the photo, −0.3 and +0.4 for the floating "WTF" / "07" background text) is what creates the layered depth — closer-feeling layers get bigger speed numbers, background layers get negative ones.

2. The "Weird Is A Choice" horizontal band
It's a scroll-linked horizontal marquee sitting in a thin full-width strip right below the hero:
The text is repeated 8 times inside one long, non-wrapping row (whitespace-nowrap), separated by ✱ marks, inside an overflow: hidden strip.
Instead of a time-based CSS animation, its horizontal position is tied to scroll position using the same parallax math but in the horizontal direction: offset = distance * speed applied as translate3d(offset, 0, 0) — so the band slides sideways only while you scroll vertically, and it feels connected to the page's motion rather than looping on its own.
Same rAF + reduced-motion handling as the parallax.