import type { CharPosition, CharState } from "../types";

/**
 * Fade in by word (characters on the same line between spaces fade together).
 * Each word fades and slides up slightly.
 */
export function fadeEffect(
  chars: CharPosition[],
  progress: number,
  stagger: number,
  duration: number,
): CharState[] {
  const totalChars = chars.length;
  if (totalChars === 0) return [];

  // Group characters into words (by spaces)
  let wordIndex = 0;
  const charWordMap: number[] = [];
  let totalWords = 0;

  for (const char of chars) {
    if (char.char === " ") {
      charWordMap.push(wordIndex);
      wordIndex++;
    } else {
      charWordMap.push(wordIndex);
    }
    totalWords = Math.max(totalWords, wordIndex + 1);
  }

  return chars.map((char, i) => {
    const myWord = charWordMap[i];
    const wordDelay = (myWord / totalWords) * (stagger * totalWords) / duration;
    const localProgress = Math.max(0, Math.min(1, (progress - wordDelay) / (1 - wordDelay + 0.001)));

    if (localProgress <= 0) {
      return { tx: 0, ty: 12, opacity: 0, scale: 1, rotation: 0, displayChar: char.char };
    }

    // Ease out cubic
    const eased = 1 - Math.pow(1 - localProgress, 3);

    return {
      tx: 0,
      ty: 12 * (1 - eased),
      opacity: eased,
      scale: 1,
      rotation: 0,
      displayChar: char.char,
    };
  });
}
