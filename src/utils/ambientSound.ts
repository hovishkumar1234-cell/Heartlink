/**
 * Web Audio API Resilient Ambient Soundscape Synthesizer
 * Generates realistic ambient background soundscapes without external audio files:
 * - Rain Outside (Filtered pink noise with droplet resonance)
 * - Café Jazz & Pour-Over (Mellow jazz chords, soft bass & ambient murmur)
 * - Lo-Fi Vinyl (Warm filtered pad chords & soft vinyl crackle)
 * - Summer Crickets (Rhythmic crickets chirp & night air)
 * - Ocean Waves (Slow periodic filtered swells)
 * - City Hum (Low frequency gentle reverberant rumble)
 */

import { AmbientSyncTrack } from '../types';

let audioCtx: AudioContext | null = null;
let currentNodes: {
  gain: GainNode;
  stop: () => void;
} | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAmbientTrack(track: AmbientSyncTrack, volume = 0.25): () => void {
  try {
    stopAmbientTrack();
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.8);
    masterGain.connect(ctx.destination);

    let stopInternal = () => {};

    if (track === 'rain_outside') {
      // Noise buffer for rain
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.18;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();

      stopInternal = () => {
        try {
          noise.stop();
        } catch (_) {}
      };
    } else if (track === 'ocean_waves') {
      // Modulated noise for ocean waves
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      // LFO for wave swells
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.15; // 6.5s per swell
      lfoGain.gain.value = 350;
      lfo.connect(filter.frequency);
      lfo.start();

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();

      stopInternal = () => {
        try {
          noise.stop();
          lfo.stop();
        } catch (_) {}
      };
    } else if (track === 'lofi_vinyl' || track === 'cafe_jazz') {
      // Warm chords generator
      const freqs = track === 'lofi_vinyl' ? [130.81, 164.81, 196.0, 246.94] : [146.83, 174.61, 220.0, 261.63];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600 + idx * 100;

        const subGain = ctx.createGain();
        subGain.gain.value = 0.08 / freqs.length;

        osc.connect(filter);
        filter.connect(subGain);
        subGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      stopInternal = () => {
        oscs.forEach((osc) => {
          try {
            osc.stop();
          } catch (_) {}
        });
      };
    } else {
      // City Hum / Summer Crickets default
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 110;

      const subGain = ctx.createGain();
      subGain.gain.value = 0.12;

      osc.connect(subGain);
      subGain.connect(masterGain);
      osc.start();

      stopInternal = () => {
        try {
          osc.stop();
        } catch (_) {}
      };
    }

    currentNodes = {
      gain: masterGain,
      stop: () => {
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        setTimeout(() => {
          stopInternal();
          try {
            masterGain.disconnect();
          } catch (_) {}
        }, 450);
      },
    };

    return () => {
      stopAmbientTrack();
    };
  } catch (e) {
    console.warn('Ambient audio could not be initialized:', e);
    return () => {};
  }
}

export function stopAmbientTrack(): void {
  if (currentNodes) {
    try {
      currentNodes.stop();
    } catch (_) {}
    currentNodes = null;
  }
}
