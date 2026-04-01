import type { CharPosition, CharState } from "../types";

/**
 * Spring physics per character.
 * Characters bounce in from below with damped spring motion.
 */
export function springEffect(
  chars: CharPosition[],
  progress: number,
  stagger: number,
  duration: number,
): CharState[] {
  const totalChars = chars.length;
  if (totalChars === 0) return [];

  return chars.map((char) => {
    // Stagger: each character starts slightly later
    const charDelay = (char.index / totalChars) * (stagger * totalChars) / duration;
    const localProgress = Math.max(0, Math.min(1, (progress - charDelay) / (1 - charDelay + 0.001)));

    if (localProgress <= 0) {
      return { tx: 0, ty: 60, opacity: 0, scale: 0.5, rotation: 0, displayChar: char.char };
    }

    // Damped spring: y = A * e^(-bt) * cos(wt)
    const dampening = 8;
    const frequency = 4;
    const t = localProgress;
    const springValue = 1 - Math.exp(-dampening * t) * Math.cos(frequency * Math.PI * t);

    const ty = 60 * (1 - springValue);
    const opacity = Math.min(1, localProgress * 3);
    const scale = 0.5 + 0.5 * springValue;

    return {
      tx: 0,
      ty,
      opacity,
      scale,
      rotation: 0,
      displayChar: char.char,
    };
  });
}
