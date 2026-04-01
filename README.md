# @shipitandpray/pretext-animate

**[Live Demo](https://shipitandpray.github.io/pretext-animate/)**

Physics-based text animations with zero layout reflows. 120fps on mid-range devices. Powered by [Pretext](https://github.com/chenglou/pretext).

```
npm install @shipitandpray/pretext-animate @chenglou/pretext
```

## Why

Every text animation library does it wrong. They change `font-size`, `letter-spacing`, `margin`, `width` — properties that force the browser to recalculate layout on every frame. That's 10–50ms of layout thrashing per frame, capping you at 30fps and causing visible jank.

`pretext-animate` pre-computes **all character positions** before touching the DOM. The animation loop only writes `transform` and `opacity` — the two CSS properties GPUs can handle without any layout recalculation.

Result: 120fps on devices that struggle to hit 60fps with traditional approaches.

## Effects

| Effect | Description |
|---|---|
| `spring` | Characters bounce in from below with damped spring physics |
| `scramble` | Random glyphs resolve into the real text |
| `typewriter` | Characters pop in left-to-right with a scale bump |
| `wave` | Sine wave propagates through the text continuously |
| `fade` | Words fade and slide up, word by word |

## Usage

```ts
import { TextAnimator } from "@shipitandpray/pretext-animate";

const animator = new TextAnimator(document.getElementById("my-container"), {
  text: "Zero layout reflows.",
  font: "700 48px Inter",
  maxWidth: 800,
  effect: "spring",        // spring | scramble | typewriter | wave | fade
  duration: 1200,          // ms
  stagger: 30,             // ms between characters
  easing: "easeOut",       // linear | easeOut | spring
  lineHeight: 1.4,
  color: "#ffffff",
});

await animator.play();
// later:
animator.pause();
animator.reset();
await animator.reverse();
animator.destroy();
```

## API

### `new TextAnimator(container, options)`

Pre-computes all character positions via Pretext and creates absolutely-positioned spans. The container gets populated with a single `div` wrapper; no layout reflows happen after this point.

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | required | Text to animate |
| `font` | `string` | required | CSS font string (e.g. `"700 48px Inter"`) |
| `maxWidth` | `number` | required | Max line width in px for wrapping |
| `effect` | `EffectType` | required | Animation effect |
| `duration` | `number` | `1000` | Total animation duration in ms |
| `stagger` | `number` | `30` | Per-character delay in ms |
| `easing` | `EasingType` | `"easeOut"` | Easing function |
| `lineHeight` | `number` | `1.4` | Line height multiplier |
| `color` | `string` | `"currentColor"` | Text color |

### Methods

| Method | Returns | Description |
|---|---|---|
| `play()` | `Promise<void>` | Play animation forward, resolves when complete |
| `pause()` | `void` | Pause mid-animation |
| `reset()` | `void` | Jump to initial (hidden) state |
| `reverse()` | `Promise<void>` | Play in reverse |
| `destroy()` | `void` | Remove all DOM elements and cancel rAF |
| `getLayout()` | `LayoutResult` | Get pre-computed char positions and dimensions |

## Low-level API

```ts
import { computeLayout, DOMRenderer, springEffect } from "@shipitandpray/pretext-animate";

// Measure all character positions (uses Pretext)
const layout = computeLayout("Hello World", "700 48px Inter", 800);
// layout.chars[i] → { char, x, y, index, line, width }
// layout.width, layout.height, layout.lineCount, layout.lineHeightPx

// Render to DOM
const renderer = new DOMRenderer(container, layout, "700 48px Inter", "#fff");

// Run your own effect
const states = springEffect(layout.chars, progress, stagger, duration);
renderer.update(states); // only writes transform + opacity
```

## Writing custom effects

An effect is just a pure function:

```ts
import type { CharPosition, CharState, EffectFn } from "@shipitandpray/pretext-animate";

export const myEffect: EffectFn = (chars, progress, stagger, duration) => {
  return chars.map((char) => ({
    tx: 0,             // x translation (px)
    ty: 0,             // y translation (px)
    opacity: progress, // 0–1
    scale: 1,          // scale factor
    rotation: 0,       // degrees
    displayChar: char.char, // change for scramble-style effects
  }));
};
```

`progress` runs 0 → 1 over `duration` ms. All rendering is handled by the `DOMRenderer` — your effect just returns state.

## How Pretext works

Pretext is a zero-dependency text measurement library that computes glyph metrics without touching the DOM. It gives `pretext-animate` the exact x/y position of every character before any elements are created. Once layout is pre-computed:

1. Spans are created at their final positions (no reflows after this)
2. The rAF loop only writes `transform` and `opacity`
3. The GPU composites transforms without involving the CPU layout engine

## Development

```bash
npm run build    # tsup — builds ESM + CJS + types to dist/
npm run check    # tsc --noEmit
npm run test     # vitest run
```

## License

MIT
