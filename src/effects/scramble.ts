import type { CharPosition, CharState } from "../types";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

function randomChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Random character scramble that resolves to the real text.
 * Each character cycles through random glyphs before settling.
 */
export function scrambleEffect(
  chars: CharPosition[],
  progress: number,
  stagger: number,
  duration: number,
): CharState[] {
  const totalChars = chars.length;
  if (totalChars === 0) return [];

  return chars.map((char) => {
    const charDelay = (char.index / totalChars) * (stagger * totalChars) / duration;
    const localProgress = Math.max(0, Math.min(1, (progress - charDelay) / (1 - charDelay + 0.001)));

    if (localProgress <= 0) {
      return { tx: 0, ty: 0, opacity: 0.3, scale: 1, rotation: 0, displayChar: randomChar() };
    }

    // Character is scrambling until 70% through, then resolves
    const resolvePoint = 0.7;
    let displayChar: string;

    if (char.char === " ") {
      displayChar = " ";
    } else if (localProgress >= resolvePoint) {
      displayChar = char.char;
    } else {
      // Scramble phase: cycle through random characters
      displayChar = randomChar();
    }

    const opacity = Math.min(1, localProgress * 2);

    return {
      tx: 0,
      ty: 0,
      opacity,
      scale: 1,
      rotation: 0,
      displayChar,
    };
  });
}
