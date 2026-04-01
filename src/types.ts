/** Supported animation effects */
export type EffectType = "spring" | "scramble" | "typewriter" | "wave" | "fade";

/** Easing functions available */
export type EasingType = "linear" | "easeOut" | "spring";

/** Options for creating a text animation */
export interface AnimateOptions {
  /** The text to animate */
  text: string;
  /** CSS font string, e.g. "48px Inter" */
  font: string;
  /** Maximum width for text wrapping (px) */
  maxWidth: number;
  /** Which animation effect to use */
  effect: EffectType;
  /** Animation duration in ms (default: 1000) */
  duration?: number;
  /** Delay between characters in ms (default: 30) */
  stagger?: number;
  /** Easing function (default: 'easeOut') */
  easing?: EasingType;
  /** Line height multiplier (default: 1.4) */
  lineHeight?: number;
  /** Text color (default: 'currentColor') */
  color?: string;
}

/** Pre-computed position for a single character */
export interface CharPosition {
  /** The character string */
  char: string;
  /** X offset from container left */
  x: number;
  /** Y offset from container top */
  y: number;
  /** Character index in original text */
  index: number;
  /** Line number (0-based) */
  line: number;
  /** Width of this character */
  width: number;
}

/** Layout result from pre-computation */
export interface LayoutResult {
  /** All character positions */
  chars: CharPosition[];
  /** Total width of the text block */
  width: number;
  /** Total height of the text block */
  height: number;
  /** Number of lines */
  lineCount: number;
  /** Computed line height in px */
  lineHeightPx: number;
}

/** State of a single character during animation */
export interface CharState {
  /** X translation offset */
  tx: number;
  /** Y translation offset */
  ty: number;
  /** Opacity (0-1) */
  opacity: number;
  /** Scale factor */
  scale: number;
  /** Rotation in degrees */
  rotation: number;
  /** Display character (may differ from original during scramble) */
  displayChar: string;
}

/** Effect function signature - returns char states for a given progress (0-1) */
export type EffectFn = (
  chars: CharPosition[],
  progress: number,
  stagger: number,
  duration: number,
) => CharState[];
