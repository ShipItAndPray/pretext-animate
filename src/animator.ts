import type { AnimateOptions, CharState, EffectFn, LayoutResult } from "./types";
import { computeLayout } from "./layout";
import { DOMRenderer } from "./renderer";
import { springEffect } from "./effects/spring";
import { scrambleEffect } from "./effects/scramble";
import { typewriterEffect } from "./effects/typewriter";
import { waveEffect } from "./effects/wave";
import { fadeEffect } from "./effects/fade";

const EFFECT_MAP: Record<string, EffectFn> = {
  spring: springEffect,
  scramble: scrambleEffect,
  typewriter: typewriterEffect,
  wave: waveEffect,
  fade: fadeEffect,
};

/**
 * Main TextAnimator class.
 * Pre-computes all character positions via Pretext, then runs
 * a rAF loop that only writes transform/opacity (zero reflows).
 */
export class TextAnimator {
  private options: Required<AnimateOptions>;
  private layout: LayoutResult;
  private renderer: DOMRenderer | null = null;
  private container: HTMLElement | null = null;
  private effectFn: EffectFn;
  private animationId: number = 0;
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private pauseTime: number = 0;
  private isReversed: boolean = false;
  private resolvePlay: (() => void) | null = null;

  constructor(container: HTMLElement, options: AnimateOptions) {
    this.container = container;
    this.options = {
      text: options.text,
      font: options.font,
      maxWidth: options.maxWidth,
      effect: options.effect,
      duration: options.duration ?? 1000,
      stagger: options.stagger ?? 30,
      easing: options.easing ?? "easeOut",
      lineHeight: options.lineHeight ?? 1.4,
      color: options.color ?? "currentColor",
    };

    this.effectFn = EFFECT_MAP[this.options.effect] || springEffect;

    // Pre-compute layout via Pretext (the key innovation)
    this.layout = computeLayout(
      this.options.text,
      this.options.font,
      this.options.maxWidth,
      this.options.lineHeight,
    );

    // Create DOM renderer with pre-computed positions
    this.renderer = new DOMRenderer(
      container,
      this.layout,
      this.options.font,
      this.options.color,
    );

    // Start hidden
    this.renderer.hide();
  }

  /** Play the animation forward */
  play(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.resolvePlay = resolve;
      this.isReversed = false;
      this.isPlaying = true;
      this.isPaused = false;
      this.startTime = performance.now();
      this.tick();
    });
  }

  /** Pause the animation */
  pause(): void {
    if (this.isPlaying && !this.isPaused) {
      this.isPaused = true;
      this.pauseTime = performance.now();
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = 0;
      }
    }
  }

  /** Reset animation to initial state */
  reset(): void {
    this.stop();
    this.renderer?.hide();
  }

  /** Play the animation in reverse */
  reverse(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.resolvePlay = resolve;
      this.isReversed = true;
      this.isPlaying = true;
      this.isPaused = false;
      this.startTime = performance.now();
      this.tick();
    });
  }

  /** Clean up all DOM elements and stop animation */
  destroy(): void {
    this.stop();
    this.renderer?.destroy();
    this.renderer = null;
    this.container = null;
  }

  /** Get the pre-computed layout (useful for sizing containers) */
  getLayout(): LayoutResult {
    return this.layout;
  }

  private stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  private tick = (): void => {
    if (!this.isPlaying || this.isPaused || !this.renderer) return;

    const now = performance.now();
    const elapsed = now - this.startTime;
    let rawProgress = Math.min(1, elapsed / this.options.duration);

    // Apply easing
    let progress = this.applyEasing(rawProgress);

    // Reverse if needed
    if (this.isReversed) {
      progress = 1 - progress;
    }

    // Compute character states from the effect function
    const states = this.effectFn(
      this.layout.chars,
      progress,
      this.options.stagger,
      this.options.duration,
    );

    // Write to DOM (only transform + opacity = zero reflows)
    this.renderer.update(states);

    if (rawProgress < 1) {
      this.animationId = requestAnimationFrame(this.tick);
    } else {
      this.isPlaying = false;
      if (this.resolvePlay) {
        this.resolvePlay();
        this.resolvePlay = null;
      }
    }
  };

  private applyEasing(t: number): number {
    switch (this.options.easing) {
      case "linear":
        return t;
      case "easeOut":
        return 1 - Math.pow(1 - t, 3);
      case "spring": {
        // Damped spring easing
        const w = 8;
        const d = 6;
        return 1 - Math.exp(-d * t) * Math.cos(w * t);
      }
      default:
        return t;
    }
  }
}

/**
 * Factory function for creating text animations.
 */
export function createTextAnimation(
  container: HTMLElement,
  options: AnimateOptions,
): TextAnimator {
  return new TextAnimator(container, options);
}
