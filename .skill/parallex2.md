1. "The latest weird" appearing on first scroll (the reveal effect)
The trick: each section/card starts invisible and slightly shifted, then animates in the moment it enters the viewport.
Each wrapped element sits in a container with initial styles: opacity: 0, a transform offset (e.g. translate3d(0, 48px, 0) for "slide up"), and filter: blur(6px).
A IntersectionObserver watches it with threshold: 0.12 and rootMargin: "0px 0px -8% 0px" — meaning it triggers when ~12% of the element is visible and it's at least 8% up from the bottom edge, so the animation starts just after it peeks in, not the instant it touches the edge.
When it intersects, a single CSS transition runs everything at once: opacity 0→1, transform → none, blur 6px→0, over 700ms with easing cubic-bezier(0.16, 1, 0.3, 1) (a strong "ease-out" — fast start, soft landing).
observer.unobserve() fires after the first trigger, so it animates once and never re-hides.
Staggering: each product card in the grid gets delay = index * 90ms, so on first scroll the four cards pop in one after another like a wave instead of simultaneously.

Generic CSS recipe:
.reveal {
  opacity: 0;
  transform: translate3d(0, 48px, 0);
  filter: blur(6px);
  transition: opacity 700ms cubic-bezier(0.16,1,0.3,1),
              transform 700ms cubic-bezier(0.16,1,0.3,1);
}
.reveal.visible { opacity: 1; transform: none; filter: blur(0); }
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));



2. The image moving while the frame stays put (the parallax)
The trick: the image is a separate layer from its frame, and only the image layer translates.
The frame is a normal in-flow element with position: relative; overflow: hidden — it scrolls normally with the page and never moves itself.
Inside it, the image wrapper is position: absolute; inset: -12% — oversized 12% on every side — so there's bleed room and you never see an empty gap while it moves.
On every scroll (throttled to one update per animation frame via requestAnimationFrame), measure the element's center vs. the viewport center: distance = elementCenter - viewportCenter, then set transform: translate3d(0, distance * speed, 0).
speed is the intensity: at 0.18 the image drifts at ~18% of scroll speed in the same direction (appears to lag behind, deep/slow feel); negative speeds make it move opposite to scroll (floats toward you). The value hits 0 when the element is exactly centered in the viewport, so it's perfectly aligned at mid-screen and drifts apart toward the edges — that's why it feels anchored, not random.
Only ever set transform: translate3d(...), never top/margin — transforms run on the GPU and stay smooth.

Generic recipe:
const img = document.querySelector('.parallax-img');
const frame = img.closest('.parallax-frame');
function update() {
  const r = frame.getBoundingClientRect();
  const dist = (r.top + r.height / 2) - window.innerHeight / 2;
  img.style.transform = `translate3d(0, ${dist * 0.18}px, 0)`;
}
addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
update();
One shared rule for both: never animate top/left — always transform: translate3d(), and drive it from scroll position inside a requestAnimationFrame loop. That's what keeps both effects buttery.