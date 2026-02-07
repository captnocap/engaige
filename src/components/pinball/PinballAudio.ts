/**
 * PinballAudio - Howler.js audio for Cob Cadet Pinball
 *
 * Synthesized WAV tones via Web Audio API → base64 data URLs.
 * Howl instances for each sound effect.
 */

import { Howl } from 'howler';

export interface PinballAudio {
  play(sound: SoundName): void;
  setVolume(v: number): void;
  setMuted(m: boolean): void;
  destroy(): void;
}

export type SoundName =
  | 'flipperUp'
  | 'flipperDown'
  | 'bumperHit'
  | 'slingshotHit'
  | 'drain'
  | 'plungerRelease'
  | 'scoreMilestone';

// ── WAV synthesizer ────────────────────────────────────────────────────────

function generateTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  attack = 0.01,
  decay = 0.1,
  volume = 0.3,
): string {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(samples);

  const attackSamples = Math.floor(sampleRate * attack);
  const decaySamples = Math.floor(sampleRate * decay);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let value = 0;

    switch (type) {
      case 'sine':
        value = Math.sin(2 * Math.PI * frequency * t);
        break;
      case 'square':
        value = Math.sin(2 * Math.PI * frequency * t) >= 0 ? 1 : -1;
        break;
      case 'triangle': {
        const phase = (frequency * t) % 1;
        value = 4 * Math.abs(phase - 0.5) - 1;
        break;
      }
      case 'sawtooth': {
        const phase = (frequency * t) % 1;
        value = 2 * phase - 1;
        break;
      }
    }

    // Envelope
    let env = 1;
    if (i < attackSamples) {
      env = i / attackSamples;
    } else if (i > samples - decaySamples) {
      env = (samples - i) / decaySamples;
    }

    buffer[i] = value * env * volume;
  }

  return encodeWav(buffer, sampleRate);
}

function generateNoise(duration: number, volume = 0.1, decay = 0.1): string {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(samples);
  const decaySamples = Math.floor(sampleRate * decay);

  for (let i = 0; i < samples; i++) {
    let env = 1;
    if (i > samples - decaySamples) {
      env = (samples - i) / decaySamples;
    }
    buffer[i] = (Math.random() * 2 - 1) * env * volume;
  }

  return encodeWav(buffer, sampleRate);
}

function generateChord(
  frequencies: number[],
  duration: number,
  type: OscillatorType = 'sine',
  decay = 0.2,
  volume = 0.2,
): string {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(samples);
  const decaySamples = Math.floor(sampleRate * decay);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let value = 0;
    for (const freq of frequencies) {
      value += Math.sin(2 * Math.PI * freq * t);
    }
    value /= frequencies.length;

    let env = 1;
    if (i > samples - decaySamples) {
      env = (samples - i) / decaySamples;
    }

    buffer[i] = value * env * volume;
  }

  return encodeWav(buffer, sampleRate);
}

function encodeWav(buffer: Float32Array, sampleRate: number): string {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataLength = buffer.length * bytesPerSample;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const wav = new ArrayBuffer(totalLength);
  const view = new DataView(wav);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true);  // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write samples
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  // Convert to base64 data URL
  const bytes = new Uint8Array(wav);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ── Create audio system ────────────────────────────────────────────────────

export function createAudio(): PinballAudio {
  let muted = false;
  let volume = 0.5;

  // Generate sound data URLs
  const sounds: Record<SoundName, Howl> = {
    flipperUp: new Howl({
      src: [generateTone(600, 0.06, 'square', 0.002, 0.04, 0.2)],
      volume: volume * 0.6,
    }),
    flipperDown: new Howl({
      src: [generateTone(300, 0.05, 'square', 0.002, 0.03, 0.15)],
      volume: volume * 0.4,
    }),
    bumperHit: new Howl({
      src: [generateTone(880, 0.08, 'triangle', 0.002, 0.06, 0.25)],
      volume: volume * 0.7,
    }),
    slingshotHit: new Howl({
      src: [generateTone(660, 0.06, 'triangle', 0.002, 0.04, 0.2)],
      volume: volume * 0.5,
    }),
    drain: new Howl({
      src: [generateTone(200, 0.3, 'sawtooth', 0.01, 0.25, 0.25)],
      volume: volume * 0.6,
    }),
    plungerRelease: new Howl({
      src: [generateTone(440, 0.1, 'sine', 0.005, 0.08, 0.3)],
      volume: volume * 0.5,
    }),
    scoreMilestone: new Howl({
      src: [generateChord([523.25, 659.25, 783.99], 0.3, 'sine', 0.25, 0.25)],
      volume: volume * 0.6,
    }),
  };

  // Debounce tracking for flipper sounds
  let lastFlipperUp = 0;
  let lastFlipperDown = 0;
  const FLIPPER_DEBOUNCE = 50;

  return {
    play(sound: SoundName) {
      if (muted) return;

      const now = Date.now();
      if (sound === 'flipperUp' && now - lastFlipperUp < FLIPPER_DEBOUNCE) return;
      if (sound === 'flipperDown' && now - lastFlipperDown < FLIPPER_DEBOUNCE) return;
      if (sound === 'flipperUp') lastFlipperUp = now;
      if (sound === 'flipperDown') lastFlipperDown = now;

      sounds[sound]?.play();
    },

    setVolume(v: number) {
      volume = Math.max(0, Math.min(1, v));
      for (const howl of Object.values(sounds)) {
        howl.volume(volume);
      }
    },

    setMuted(m: boolean) {
      muted = m;
    },

    destroy() {
      for (const howl of Object.values(sounds)) {
        howl.unload();
      }
    },
  };
}
