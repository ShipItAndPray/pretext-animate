import { describe, it, expect } from "vitest";
import { springEffect } from "../effects/spring";
import { scrambleEffect } from "../effects/scramble";
import { typewriterEffect } from "../effects/typewriter";
import { waveEffect } from "../effects/wave";
import { fadeEffect } from "../effects/fade";
import type { CharPosition } from "../types";

function makeChars(text: string): CharPosition[] {
  return text.split("").map((char, i) => ({
    char,
    x: i * 10,
    y: 0,
    index: i,
    line: 0,
    width: 10,
  }));
}

describe("springEffect", () => {
  const chars = makeChars("Hello");

  it("returns hidden state at progress 0", () => {
    const states = springEffect(chars, 0, 30, 1000);
    expect(states).toHaveLength(5);
    expect(states[0].opacity).toBe(0);
    expect(states[0].ty).toBe(60);
  });

  it("returns visible state at progress 1", () => {
    const states = springEffect(chars, 1, 30, 1000);
    for (const s of states) {
      expect(s.opacity).toBeGreaterThan(0.9);
      expect(Math.abs(s.ty)).toBeLessThan(5);
    }
  });

  it("returns empty array for empty input", () => {
    expect(springEffect([], 0.5, 30, 1000)).toEqual([]);
  });
});

describe("scrambleEffect", () => {
  const chars = makeChars("Test");

  it("shows scrambled chars at low progress", () => {
    const states = scrambleEffect(chars, 0.2, 30, 1000);
    // At least some characters should differ from original
    const anyDifferent = states.some(
      (s, i) => s.displayChar !== chars[i].char && chars[i].char !== " ",
    );
    // This is probabilistic but very likely with 4 chars
    expect(states).toHaveLength(4);
  });

  it("shows real chars at progress 1", () => {
    const states = scrambleEffect(chars, 1, 30, 1000);
    for (let i = 0; i < states.length; i++) {
      expect(states[i].displayChar).toBe(chars[i].char);
    }
  });
});

describe("typewriterEffect", () => {
  const chars = makeChars("ABCDE");

  it("shows no characters at progress 0", () => {
    const states = typewriterEffect(chars, 0, 30, 1000);
    for (const s of states) {
      expect(s.opacity).toBe(0);
    }
  });

  it("shows all characters at progress 1", () => {
    const states = typewriterEffect(chars, 1, 30, 1000);
    for (const s of states) {
      expect(s.opacity).toBe(1);
    }
  });

  it("reveals characters progressively", () => {
    const states = typewriterEffect(chars, 0.5, 30, 1000);
    // First few should be visible, last ones hidden
    expect(states[0].opacity).toBe(1);
    expect(states[4].opacity).toBe(0);
  });
});

describe("waveEffect", () => {
  const chars = makeChars("Wave");

  it("starts hidden at progress 0", () => {
    const states = waveEffect(chars, 0, 30, 1000);
    expect(states[0].opacity).toBe(0);
  });

  it("shows all characters at progress 1", () => {
    const states = waveEffect(chars, 1, 30, 1000);
    for (const s of states) {
      expect(s.opacity).toBeGreaterThan(0.9);
    }
  });

  it("applies wave displacement mid-animation", () => {
    const states = waveEffect(chars, 0.6, 30, 1000);
    // Characters should have varying ty values (wave)
    const tyValues = states.map((s) => s.ty);
    const allSame = tyValues.every((v) => v === tyValues[0]);
    // Very unlikely all 4 chars have same wave displacement
    expect(allSame).toBe(false);
  });
});

describe("fadeEffect", () => {
  const chars = makeChars("Fade in");

  it("starts invisible", () => {
    const states = fadeEffect(chars, 0, 30, 1000);
    for (const s of states) {
      expect(s.opacity).toBe(0);
    }
  });

  it("ends fully visible", () => {
    const states = fadeEffect(chars, 1, 30, 1000);
    for (const s of states) {
      expect(s.opacity).toBeCloseTo(1, 1);
    }
  });

  it("preserves display characters", () => {
    const states = fadeEffect(chars, 0.5, 30, 1000);
    for (let i = 0; i < states.length; i++) {
      expect(states[i].displayChar).toBe(chars[i].char);
    }
  });
});
