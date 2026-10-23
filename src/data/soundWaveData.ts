import { SoundWaveProfile, AmbientSyncTrack } from '../types';

export const AMBIENT_TRACK_OPTIONS: Array<{
  id: AmbientSyncTrack;
  label: string;
  emoji: string;
  desc: string;
}> = [
  {
    id: 'lofi_vinyl',
    label: 'Lo-Fi Beats & Vinyl',
    emoji: '☕',
    desc: 'Warm chords, vinyl crackle & mellow study cadence',
  },
  {
    id: 'rain_outside',
    label: 'Gentle Rain on Window',
    emoji: '🌧️',
    desc: 'Cozy rainfall acoustic resonance',
  },
  {
    id: 'cafe_jazz',
    label: 'Café Jazz & Pour-Over',
    emoji: '🎷',
    desc: 'Upright bass, piano tinkles & coffeehouse chatter',
  },
  {
    id: 'ocean_waves',
    label: 'Sunset Ocean Waves',
    emoji: '🌊',
    desc: 'Rhythmic tide wash & coastal breeze',
  },
  {
    id: 'summer_crickets',
    label: 'Summer Night Porch',
    emoji: '🦗',
    desc: 'Twilight air & gentle cricket chorus',
  },
  {
    id: 'city_hum',
    label: 'City Skyline Hum',
    emoji: '🌆',
    desc: 'Nighttime metropolitan calm reverberation',
  },
];

export const SOUNDWAVE_PROMPTS = [
  'The story behind my most contagious laugh',
  'What my studio or room sounds like at 2 AM',
  'A song or sound that instantly resets my mood',
  'My most controversial harmless opinion said out loud',
  'What my ideal Sunday morning sounds like',
  'The most spontaneous decision I ever made',
];

// Helper to generate normalized waveform heights for visual bar rendering
function generateSampleWaveform(length = 32, seed = 1): number[] {
  const bars: number[] = [];
  for (let i = 0; i < length; i++) {
    const val = 0.2 + 0.7 * Math.abs(Math.sin((i + seed) * 0.45) * Math.cos(i * 0.25));
    bars.push(Math.min(1.0, Math.max(0.18, Number(val.toFixed(2)))));
  }
  return bars;
}

export const INITIAL_SOUNDWAVE_PROFILES: SoundWaveProfile[] = [
  {
    id: 'sw_leo',
    userId: 'user_leo',
    userName: 'Leo Vance',
    userAge: 28,
    userOccupation: 'Architect & Spatial Designer',
    isVerified: true,
    distanceKm: 1.2,
    photoUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#2d3436"/><circle cx="200" cy="180" r="140" fill="#6C5CE7" opacity="0.3"/><ellipse cx="200" cy="220" rx="70" ry="90" fill="#1e272e"/><rect x="175" y="280" width="50" height="70" fill="#1e272e"/><path d="M100,450 C100,350 150,330 200,330 C250,330 300,350 300,450 Z" fill="#0984e3"/><circle cx="175" cy="210" r="6" fill="#6C5CE7"/><circle cx="225" cy="210" r="6" fill="#6C5CE7"/><text x="200" y="475" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">Leo Vance</text></svg>`),
    promptQuestion: 'What my studio sounds like at 2 AM',
    promptAnswerTranscript:
      "Right now it's 2 AM in SoMa. The rain is tapping rhythmically against the loft skylight, and I have Miles Davis on the turntable while sketching wood joints. Honestly... there's no better feeling.",
    audioDurationSeconds: 20,
    waveform: generateSampleWaveform(32, 3),
    ambientTrack: 'lofi_vinyl',
    ambientTrackLabel: 'Lo-Fi Beats & Vinyl',
    ambientTrackEmoji: '☕',
    voiceCadenceLabel: 'Warm, Raspy & Thoughtful',
    createdAt: new Date().toISOString(),
    voiceRepliesCount: 1, // Stage 2: 50% revealed
    isUnlocked: false,
    hasListened: false,
  },
  {
    id: 'sw_sofia',
    userId: 'user_sofia',
    userName: 'Sofia Chen',
    userAge: 24,
    userOccupation: 'Ceramicist & Coffee Roaster',
    isVerified: true,
    distanceKm: 2.5,
    photoUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#1e272e"/><circle cx="200" cy="180" r="140" fill="#00B894" opacity="0.35"/><ellipse cx="200" cy="220" rx="65" ry="85" fill="#2d3436"/><rect x="175" y="280" width="50" height="70" fill="#2d3436"/><path d="M105,450 C105,350 150,330 200,330 C250,330 295,350 295,450 Z" fill="#00B894"/><circle cx="178" cy="210" r="6" fill="#00B894"/><circle cx="222" cy="210" r="6" fill="#00B894"/><text x="200" y="475" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">Sofia Chen</text></svg>`),
    promptQuestion: 'The story behind my most contagious laugh',
    promptAnswerTranscript:
      "So I was throwing this giant clay vase on the wheel, totally concentrated, and sneezed... it flew off like a ceramic frisbee across the studio and landed cleanly inside the recycling bin! Everyone was laughing so hard we cried.",
    audioDurationSeconds: 19,
    waveform: generateSampleWaveform(32, 7),
    ambientTrack: 'cafe_jazz',
    ambientTrackLabel: 'Café Jazz & Pour-Over',
    ambientTrackEmoji: '🎷',
    voiceCadenceLabel: 'Bubbly, Melodic & Playful',
    createdAt: new Date().toISOString(),
    voiceRepliesCount: 0, // Stage 1: Waveform Scrim / Pixelated (25%)
    isUnlocked: false,
    hasListened: false,
  },
  {
    id: 'sw_elena',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userAge: 26,
    userOccupation: 'Art Curator & Violinist',
    isVerified: true,
    distanceKm: 0.9,
    photoUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#2c2c54"/><circle cx="200" cy="180" r="140" fill="#FD79A8" opacity="0.35"/><ellipse cx="200" cy="220" rx="65" ry="85" fill="#40407a"/><rect x="175" y="280" width="50" height="70" fill="#40407a"/><path d="M105,450 C105,350 150,330 200,330 C250,330 295,350 295,450 Z" fill="#FD79A8"/><circle cx="178" cy="210" r="6" fill="#FD79A8"/><circle cx="222" cy="210" r="6" fill="#FD79A8"/><text x="200" y="475" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">Elena Rostova</text></svg>`),
    promptQuestion: 'A secret sound that immediately calms me down',
    promptAnswerTranscript:
      "The quiet hush of an empty museum gallery right before the doors open in the morning, with rain pouring outside against the glass. You can hear your own heartbeat... it feels completely timeless.",
    audioDurationSeconds: 21,
    waveform: generateSampleWaveform(32, 11),
    ambientTrack: 'rain_outside',
    ambientTrackLabel: 'Gentle Rain Outside',
    ambientTrackEmoji: '🌧️',
    voiceCadenceLabel: 'Calm, Resonant & Velvety',
    createdAt: new Date().toISOString(),
    voiceRepliesCount: 2, // Stage 3: 75% revealed (frosted glass)
    isUnlocked: false,
    hasListened: false,
  },
  {
    id: 'sw_marcus',
    userId: 'user_marcus',
    userName: 'Marcus Taylor',
    userAge: 29,
    userOccupation: 'Audio Engineer',
    isVerified: false,
    distanceKm: 3.4,
    photoUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#1b1464"/><circle cx="200" cy="180" r="140" fill="#6C5CE7" opacity="0.35"/><ellipse cx="200" cy="220" rx="65" ry="85" fill="#0652DD"/><rect x="175" y="280" width="50" height="70" fill="#0652DD"/><path d="M105,450 C105,350 150,330 200,330 C250,330 295,350 295,450 Z" fill="#6C5CE7"/><circle cx="178" cy="210" r="6" fill="#6C5CE7"/><circle cx="222" cy="210" r="6" fill="#6C5CE7"/><text x="200" y="475" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">Marcus Taylor</text></svg>`),
    promptQuestion: 'Guess what instrument I just recorded',
    promptAnswerTranscript:
      "I spent three hours blending an old 1970s analog synthesizer with a bowing cello in the sound booth. The warmth on the low end is unbelievable. Put on good headphones!",
    audioDurationSeconds: 18,
    waveform: generateSampleWaveform(32, 17),
    ambientTrack: 'city_hum',
    ambientTrackLabel: 'City Skyline Hum',
    ambientTrackEmoji: '🌆',
    voiceCadenceLabel: 'Deep, Steady & Grounded',
    createdAt: new Date().toISOString(),
    voiceRepliesCount: 3, // Stage 4: 100% UNBLURRED & UNLOCKED!
    isUnlocked: true,
    hasListened: true,
  },
  {
    id: 'sw_chloe',
    userId: 'user_chloe',
    userName: 'Chloe Bennett',
    userAge: 25,
    userOccupation: 'Sommelier & Natural Wine Maker',
    isVerified: true,
    distanceKm: 2.1,
    photoUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#2c2c54"/><circle cx="200" cy="180" r="140" fill="#FD79A8" opacity="0.4"/><ellipse cx="200" cy="220" rx="65" ry="85" fill="#b33939"/><rect x="175" y="280" width="50" height="70" fill="#b33939"/><path d="M105,450 C105,350 150,330 200,330 C250,330 295,350 295,450 Z" fill="#FD79A8"/><circle cx="178" cy="210" r="6" fill="#FD79A8"/><circle cx="222" cy="210" r="6" fill="#FD79A8"/><text x="200" y="475" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">Chloe Bennett</text></svg>`),
    promptQuestion: 'My ultimate Friday night soundtrack',
    promptAnswerTranscript:
      "Popping a pet-nat sparkling cider on Ocean Beach right as the fog starts rolling in, listening to the waves crashing and laughing with good friends. That’s my whole vibe.",
    audioDurationSeconds: 20,
    waveform: generateSampleWaveform(32, 23),
    ambientTrack: 'ocean_waves',
    ambientTrackLabel: 'Sunset Ocean Waves',
    ambientTrackEmoji: '🌊',
    voiceCadenceLabel: 'Quick-Witted & Energetic',
    createdAt: new Date().toISOString(),
    voiceRepliesCount: 0,
    isUnlocked: false,
    hasListened: false,
  },
];
