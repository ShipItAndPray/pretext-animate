import { describe, it, expect } from "vitest";
import { computeLayoutFallback } from "../layout";

// We test the fallback layout since Pretext requires a browser font context.
// The real computeLayout is integration-tested in the demo.

describe("computeLayoutFallback", () => {
  it("returns empty layout for empty text", () => {
    const result = computeLayoutFallback("", "16px sans-serif", 400);
    expect(result.chars).toEqual([]);
    expect(result.width).toBe(0);
    expect(result.lineCount).toBe(1);
  });

  it("computes character positions for simple text", () => {
    const result = computeLayoutFallback("Hello", "16px sans-serif", 400);
    expect(result.chars).toHaveLength(5);
    expect(result.chars[0].char).toBe("H");
    expect(result.chars[0].x).toBe(0);
    expect(result.chars[0].y).toBe(0);
    expect(result.chars[0].index).toBe(0);
    expect(result.chars[0].line).toBe(0);
  });

  it("assigns increasing x positions", () => {
    const result = computeLayoutFallback("ABC", "16px sans-serif", 400);
    expect(result.chars[1].x).toBeGreaterThan(result.chars[0].x);
    expect(result.chars[2].x).toBeGreaterThan(result.chars[1].x);
  });

  it("wraps to next line when exceeding maxWidth", () => {
    // With 16px font, avgCharWidth ~= 9.6px, so 5 chars ~= 48px
    // maxWidth of 30 should cause wrapping
    const result = computeLayoutFallback("Hello World", "16px sans-serif", 50);
    expect(result.lineCount).toBeGreaterThanOrEqual(2);
    // Characters on line 1 should have y > 0
    const line1Chars = result.chars.filter((c) => c.line > 0);
    expect(line1Chars.length).toBeGreaterThan(0);
  });

  it("preserves character indices", () => {
    const result = computeLayoutFallback("Hi there", "16px sans-serif", 400);
    for (let i = 0; i < result.chars.length; i++) {
      expect(result.chars[i].index).toBe(i);
    }
  });

  it("calculates line height from font size", () => {
    const result = computeLayoutFallback("Test", "24px sans-serif", 400, 1.5);
    expect(result.lineHeightPx).toBe(36); // 24 * 1.5
  });

  it("returns positive width and height", () => {
    const result = computeLayoutFallback("Some text here", "16px sans-serif", 400);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });
});
