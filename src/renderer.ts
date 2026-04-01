import type { CharPosition, CharState, LayoutResult } from "./types";

/**
 * DOM renderer that creates absolutely-positioned spans for each character.
 * Animation loop only writes transform + opacity — zero layout reflows.
 */
export class DOMRenderer {
  private container: HTMLElement;
  private wrapper: HTMLElement;
  private spans: HTMLSpanElement[] = [];
  private layout: LayoutResult;

  constructor(container: HTMLElement, layout: LayoutResult, font: string, color: string) {
    this.container = container;
    this.layout = layout;

    // Create wrapper with explicit dimensions (set once, never changes)
    this.wrapper = document.createElement("div");
    this.wrapper.style.cssText = `
      position: relative;
      width: ${layout.width}px;
      height: ${layout.height}px;
      font: ${font};
      color: ${color};
      overflow: visible;
    `;

    // Create one span per character, absolutely positioned
    for (const char of layout.chars) {
      const span = document.createElement("span");
      span.style.cssText = `
        position: absolute;
        left: ${char.x}px;
        top: ${char.y}px;
        will-change: transform, opacity;
        transform-origin: center center;
        white-space: pre;
        pointer-events: none;
        display: inline-block;
      `;
      span.textContent = char.char;
      this.wrapper.appendChild(span);
      this.spans.push(span);
    }

    container.appendChild(this.wrapper);
  }

  /**
   * Apply character states to the DOM.
   * ONLY writes transform and opacity — guaranteed zero layout reflows.
   */
  update(states: CharState[]): void {
    for (let i = 0; i < this.spans.length && i < states.length; i++) {
      const span = this.spans[i];
      const state = states[i];

      // Batch all visual changes into a single transform + opacity write
      span.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale}) rotate(${state.rotation}deg)`;
      span.style.opacity = String(state.opacity);

      // Only update textContent if it changed (scramble effect)
      if (span.textContent !== state.displayChar) {
        span.textContent = state.displayChar;
      }
    }
  }

  /** Reset all characters to their natural positions */
  reset(): void {
    for (const span of this.spans) {
      span.style.transform = "translate(0, 0) scale(1) rotate(0deg)";
      span.style.opacity = "1";
    }
  }

  /** Hide all characters */
  hide(): void {
    for (const span of this.spans) {
      span.style.opacity = "0";
    }
  }

  /** Remove all DOM elements */
  destroy(): void {
    if (this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
    this.spans = [];
  }

  getWrapper(): HTMLElement {
    return this.wrapper;
  }
}
