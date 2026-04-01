import type { CharPosition, CharState } from "../types";

/**
 * Sine wave propagating through the text.
 * Characters bob up and down in a traveling wave pattern.
 */
export function waveEffect(
  chars: CharPosition[],
  progress: number,
  stagger: number,
  duration: number,
): CharState[] {
  const totalChars = chars.length;
  if (totalChars === 0) return [];

  // Fade in first, then wave
  const fadeInEnd = 0.2;

  return chars.map((char) => {
    // Fade in phase
    const fadeProgress = Math.min(1, progress / fadeInEnd);
    const charFadeDelay = (char.index / totalChars) * fadeInEnd * 0.5;
    const charFadeProgress = Math.max(0, Math.min(1, (progress - charFadeDelay) / (fadeInEnd * 0.5)));

    if (charFadeProgress <= 0) {
      return { tx: 0, ty: 20, opacity: 0, scale: 1, rotation: 0, displayChar: char.char };
    }

    // Wave phase: continuous sine wave
    const waveFrequency = 3; // number of complete waves
    const waveAmplitude = 15; // pixels
    const waveSpeed = 4; // how fast the wave moves

    const phase = (char.index / totalChars) * waveFrequency * Math.PI * 2;
    const timePhase = progress * waveSpeed * Math.PI * 2;
    const waveY = Math.sin(phase + timePhase) * waveAmplitude;

    // Wave intensity ramps up after fade-in
    const waveIntensity = progress > fadeInEnd ? Math.min(1, (progress - fadeInEnd) / 0.2) : 0;

    const ty = waveY * waveIntensity + 20 * (1 - charFadeProgress);
    const opacity = charFadeProgress;

    return {
      tx: 0,
      ty,
      opacity,
      scale: 1,
      rotation: 0,
      displayChar: char.char,
    };
  });
}
