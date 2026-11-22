# Modern CSS techniques

Native CSS features worth reaching for before a JS library (ladder: CSS over JS). Check current browser support before relying on the newer ones, and always ship them behind `@supports` with a working fallback.

## Scroll-Driven Animations

Replace JS scroll libraries with native CSS:

```css
/* Fade in on scroll */
.reveal-on-scroll {
  animation: fadeInUp linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 30%;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Container Queries

Truly modular components:

```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

## Scroll State Queries (New 2025)

Detect scroll states without JS:

```css
.scroll-container {
  container-type: scroll-state;
}

@container scroll-state(scrolled: top) {
  .navbar {
    background: transparent;
  }
}

@container scroll-state(scrolled: bottom) {
  .scroll-indicator {
    opacity: 0;
  }
}
```

## Native CSS Nesting

No preprocessor required:

```css
.card {
  padding: 1.5rem;

  & .title {
    font-weight: 600;
  }

  &:hover {
    transform: translateY(-2px);

    & .title {
      color: var(--accent);
    }
  }
}
```

## Text Wrap Balance

Better typography for free:

```css
h1, h2, h3 {
  text-wrap: balance;
}

p {
  text-wrap: pretty;
}
```

## Anchor Positioning

Tooltips without JS:

```css
.tooltip {
  position: absolute;
  position-anchor: --trigger;
  top: anchor(bottom);
  left: anchor(center);
}
```

## Native Carousel (2025)

CSS-only carousels:

```css
.carousel {
  overflow-x: scroll;
  scroll-snap-type: x mandatory;

  &::scroll-button(inline-start) {
    content: "←";
  }

  &::scroll-button(inline-end) {
    content: "→";
  }
}

.slide {
  scroll-snap-align: center;

  &::scroll-marker {
    content: "●";
  }
}
```

## Sibling Index (New 2026)

Stagger animations without JS:

```css
.stagger-item {
  animation-delay: calc(sibling-index() * 100ms);
}
```

---


## Progressive enhancement

```css
/* Always add progressive enhancement */
@supports (animation-timeline: view()) {
  .scroll-animate {
    animation-timeline: view();
  }
}

@supports (container-type: inline-size) {
  .modular-card {
    container-type: inline-size;
  }
}
```

## Sources

- [Chrome Dev - CSS Wrapped 2025](https://chrome.dev/css-wrapped-2025/)
- [Frontend Masters - Modern CSS 2025](https://frontendmasters.com/blog/what-you-need-to-know-about-modern-css-2025-edition/)
- [State of CSS 2025](https://2025.stateofcss.com/en-US/features/)
- [MDN - CSS Scroll-driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
