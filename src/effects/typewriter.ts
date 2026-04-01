import type { CharPosition, CharState } from "../types";

/**
 * Classic typewriter: characters appear one by one left-to-right.
 * Each character pops in with a slight scale bump.
 */
export function typewriterEffect(
  chars: CharPosition[],
  progress: number,
  stagger: number,
  duration: number,
): CharState[] {
  const totalChars = chars.length;
  if (totalChars === 0) return [];

  return chars.map((char) => {
    // Linear reveal: character appears when progress passes its threshold
    const threshold = char.index / totalChars;
    const visible = progress > threshold;

    if (!visible) {
      return { tx: 0, ty: 0, opacity: 0, scale: 0, rotation: 0, displayChar: char.char };
    }

    // Just appeared: slight pop
    const timeSinceReveal = progress - threshold;
    const popDuration = 0.05;
    const popProgress = Math.min(1, timeSinceReveal / popDuration);

    // Overshoot then settle
    const scale = popProgress < 1 ? 1 + 0.3 * Math.sin(popProgress * Math.PI) : 1;

    return {
      tx: 0,
      ty: 0,
      opacity: 1,
      scale,
      rotation: 0,
      displayChar: char.char,
    };
  });
}
