import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import type { CharPosition, LayoutResult } from "./types";

/**
 * Pre-compute all character positions using Pretext.
 * This is the core of the zero-reflow approach: we measure everything
 * before touching the DOM, so the animation loop only writes transforms.
 */
export function computeLayout(
  text: string,
  font: string,
  maxWidth: number,
  lineHeightMultiplier: number = 1.4,
): LayoutResult {
  if (!text) {
    return { chars: [], width: 0, height: 0, lineCount: 0, lineHeightPx: 0 };
  }

  // Extract font size from the CSS font string for line height calculation
  const fontSizeMatch = font.match(/(\d+(?:\.\d+)?)\s*px/);
  const fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 16;
  const lineHeightPx = Math.round(fontSize * lineHeightMultiplier);

  const prepared = prepareWithSegments(text, font);
  const result = layoutWithLines(prepared, maxWidth, lineHeightPx);

  const chars: CharPosition[] = [];
  let charIndex = 0;

  // Extract lines from the layout result
  const lines: Array<{ text: string; width: number }> = [];
  if (Array.isArray(result.lines)) {
    for (const line of result.lines) {
      if (typeof line === "string") {
        lines.push({ text: line, width: 0 });
      } else if (line && typeof line === "object") {
        const l = line as { text?: string; width?: number };
        lines.push({
          text: typeof l.text === "string" ? l.text : String(line),
          width: typeof l.width === "number" ? l.width : 0,
        });
      }
    }
  }

  // Build character positions from lines
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const y = lineIdx * lineHeightPx;

    // Measure each character's x position by measuring substrings
    let xOffset = 0;
    for (let i = 0; i < line.text.length; i++) {
      const ch = line.text[i];

      // Estimate character width from the line width proportionally
      // For more accuracy, we measure prefix widths
      let charWidth: number;
      try {
        const prefixBefore = line.text.slice(0, i);
        const prefixAfter = line.text.slice(0, i + 1);
        const prepBefore = prepareWithSegments(prefixBefore || " ", font);
        const prepAfter = prepareWithSegments(prefixAfter, font);
        const layoutBefore = layoutWithLines(prepBefore, maxWidth * 10, lineHeightPx);
        const layoutAfter = layoutWithLines(prepAfter, maxWidth * 10, lineHeightPx);

        const wBefore = prefixBefore
          ? (Array.isArray(layoutBefore.lines) && layoutBefore.lines[0]
              ? (typeof (layoutBefore.lines[0] as any).width === "number"
                  ? (layoutBefore.lines[0] as any).width
                  : 0)
              : 0)
          : 0;
        const wAfter = Array.isArray(layoutAfter.lines) && layoutAfter.lines[0]
          ? (typeof (layoutAfter.lines[0] as any).width === "number"
              ? (layoutAfter.lines[0] as any).width
              : 0)
          : 0;

        charWidth = wAfter - wBefore;
        if (charWidth <= 0) charWidth = fontSize * 0.6; // fallback
        xOffset = wBefore;
      } catch {
        charWidth = fontSize * 0.6;
      }

      chars.push({
        char: ch,
        x: xOffset,
        y,
        index: charIndex,
        line: lineIdx,
        width: charWidth,
      });

      xOffset += charWidth;
      charIndex++;
    }

    // Account for newline character between lines (except last line)
    if (lineIdx < lines.length - 1) {
      charIndex++; // skip the implicit newline
    }
  }

  const totalWidth = lines.reduce((max, l) => Math.max(max, l.width), 0);

  return {
    chars,
    width: Math.ceil(totalWidth),
    height: result.height ?? lines.length * lineHeightPx,
    lineCount: lines.length,
    lineHeightPx,
  };
}

/**
 * Simpler layout for when Pretext is not available (fallback).
 * Uses canvas measureText as a backup.
 */
export function computeLayoutFallback(
  text: string,
  font: string,
  maxWidth: number,
  lineHeightMultiplier: number = 1.4,
): LayoutResult {
  const fontSizeMatch = font.match(/(\d+(?:\.\d+)?)\s*px/);
  const fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 16;
  const lineHeightPx = Math.round(fontSize * lineHeightMultiplier);
  const avgCharWidth = fontSize * 0.6;

  const chars: CharPosition[] = [];
  let x = 0;
  let y = 0;
  let line = 0;
  let maxLineWidth = 0;
  let charIndex = 0;

  const words = text.split(/(\s+)/);

  for (const word of words) {
    const wordWidth = word.length * avgCharWidth;

    if (x + wordWidth > maxWidth && x > 0) {
      maxLineWidth = Math.max(maxLineWidth, x);
      x = 0;
      y += lineHeightPx;
      line++;
    }

    for (const ch of word) {
      chars.push({
        char: ch,
        x,
        y,
        index: charIndex,
        line,
        width: avgCharWidth,
      });
      x += avgCharWidth;
      charIndex++;
    }
  }

  maxLineWidth = Math.max(maxLineWidth, x);

  return {
    chars,
    width: Math.ceil(maxLineWidth),
    height: y + lineHeightPx,
    lineCount: line + 1,
    lineHeightPx,
  };
}
