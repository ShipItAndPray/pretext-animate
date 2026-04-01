export { TextAnimator, createTextAnimation } from "./animator";
export { computeLayout, computeLayoutFallback } from "./layout";
export { DOMRenderer } from "./renderer";
export { springEffect } from "./effects/spring";
export { scrambleEffect } from "./effects/scramble";
export { typewriterEffect } from "./effects/typewriter";
export { waveEffect } from "./effects/wave";
export { fadeEffect } from "./effects/fade";
export type {
  AnimateOptions,
  EffectType,
  EasingType,
  CharPosition,
  CharState,
  LayoutResult,
  EffectFn,
} from "./types";
