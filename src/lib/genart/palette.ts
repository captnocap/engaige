/**
 * Color Palette System
 *
 * Ported from audio-canvas palette.js.
 * Maps pitch/tempo/amplitude to colors using HSL color space.
 *
 * Color = f(pitch, tempo):
 *   Pitch determines base hue (low = warm reds, high = cool blues/purples)
 *   Tempo modulates saturation and shifts hue (fast = vibrant, slow = muted)
 *   Amplitude affects lightness (loud = bright, quiet = dark)
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function pitchTempoToColor(
  normalizedPitch: number,
  normalizedTempo: number,
  amplitude: number = 1
): string {
  let baseHue: number;
  if (normalizedPitch < 0.3) {
    // Bass: red to orange-yellow (0-60)
    baseHue = (normalizedPitch / 0.3) * 60;
  } else if (normalizedPitch < 0.6) {
    // Mid: yellow to cyan (60-180)
    baseHue = 60 + ((normalizedPitch - 0.3) / 0.3) * 120;
  } else {
    // High: cyan to magenta, wrapping back toward red (180-360)
    baseHue = 180 + ((normalizedPitch - 0.6) / 0.4) * 180;
  }

  // Tempo shifts hue slightly
  const tempoHueShift = (normalizedTempo - 0.5) * 40;
  let hue = baseHue + tempoHueShift;
  if (hue < 0) hue += 360;
  if (hue > 360) hue -= 360;

  // Saturation: tempo increases vibrancy
  const baseSaturation = 40 + normalizedTempo * 40;
  const saturation = baseSaturation + amplitude * 20;

  // Lightness based on amplitude
  const lightness = 20 + amplitude * 50;

  return `hsl(${hue.toFixed(1)}, ${Math.min(saturation, 100).toFixed(1)}%, ${Math.min(lightness, 90).toFixed(1)}%)`;
}

export function pitchTempoToRGB(
  normalizedPitch: number,
  normalizedTempo: number,
  amplitude: number = 1
): RGB {
  const hsl = pitchTempoToColor(normalizedPitch, normalizedTempo, amplitude);
  return hslToRgb(hsl);
}

export function frequencyToColor(normalizedFreq: number, amplitude: number = 1): string {
  return pitchTempoToColor(normalizedFreq, 0.5, amplitude);
}

export function frequencyToRGB(normalizedFreq: number, amplitude: number = 1): RGB {
  return pitchTempoToRGB(normalizedFreq, 0.5, amplitude);
}

function hslToRgb(hslString: string): RGB {
  const match = hslString.match(/hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
  if (!match) return { r: 255, g: 255, b: 255 };

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function spectrumToColorArray(
  frequencies: Uint8Array,
  normalizedTempo: number = 0.5,
  sampleCount: number = 32
): Array<{ color: string; rgb: RGB; magnitude: number; pitch: number }> {
  const colors: Array<{ color: string; rgb: RGB; magnitude: number; pitch: number }> = [];
  const step = Math.floor(frequencies.length / sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const idx = i * step;
    const magnitude = frequencies[idx] / 255;
    const normalizedPitch = i / sampleCount;
    colors.push({
      color: pitchTempoToColor(normalizedPitch, normalizedTempo, magnitude),
      rgb: pitchTempoToRGB(normalizedPitch, normalizedTempo, magnitude),
      magnitude,
      pitch: normalizedPitch,
    });
  }

  return colors;
}

export function getDominantColor(
  dominantFrequency: number,
  normalizedTempo: number,
  amplitude: number
): { color: string; rgb: RGB } {
  return {
    color: pitchTempoToColor(dominantFrequency, normalizedTempo, amplitude),
    rgb: pitchTempoToRGB(dominantFrequency, normalizedTempo, amplitude),
  };
}
