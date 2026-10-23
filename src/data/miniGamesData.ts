import { TwoTruthsGameData, MusicBlindTestData, QuickTriviaData } from '../types';

export interface TwoTruthsPreset {
  id: string;
  theme: string;
  statements: [string, string, string];
  lieIndex: number;
  lieExplanation: string;
}

export const TWO_TRUTHS_PRESETS: TwoTruthsPreset[] = [
  {
    id: 'tt_wanderlust',
    theme: 'Wild Travel Stories ✈️',
    statements: [
      'I got lost in the Tokyo subway for 3 hours and accidentally joined a karaoke party with salarymen.',
      'I have backpacked across 14 countries carrying only a 20-liter carry-on bag.',
      'I once spent a night in an igloo in Greenland while watching the Northern Lights.',
    ],
    lieIndex: 2,
    lieExplanation: 'The igloo trip was actually cancelled because of a blizzard! I ended up eating cup noodles at a Reykjavik hostel instead 😂',
  },
  {
    id: 'tt_foodie',
    theme: 'Kitchen Crimes & Cravings 🍕',
    statements: [
      'I genuinely believe pineapple and jalapeño on pizza is a culinary masterpiece.',
      'I once made pasta from scratch and accidentally used powdered sugar instead of flour.',
      'I can blindfold taste-test and identify over 20 artisanal hot sauces without flinching.',
    ],
    lieIndex: 1,
    lieExplanation: 'I’ve never confused powdered sugar with flour—though I DID once set off my apartment smoke alarm boiling water 😅',
  },
  {
    id: 'tt_talents',
    theme: 'Odd Skills & Habits 🎸',
    statements: [
      'I can solve a classic Rubik’s cube in under 55 seconds.',
      'I was an uncredited background extra in a famous sci-fi blockbuster.',
      'I have never once hit the "Snooze" button on my alarm clock in my entire life.',
    ],
    lieIndex: 2,
    lieExplanation: 'Never hit snooze? That’s a total lie—my alarm rings at 7:00, 7:05, 7:10, and 7:15 every single morning! ⏰',
  },
  {
    id: 'tt_confessions',
    theme: 'Guilty Pleasures & Rom-Coms 🍿',
    statements: [
      'I cry every single time I rewatch the airport scene in Love Actually.',
      'I know every single lyric to rap god Eminem from start to finish without pausing.',
      'I have a secret Spotify playlist entirely dedicated to 2000s pop-punk anthems.',
    ],
    lieIndex: 1,
    lieExplanation: 'Nobody can rap Rap God without passing out for oxygen halfway through! 🎤',
  },
];

export interface MusicScenarioPreset {
  id: string;
  prompt: string;
  description: string;
  songs: MusicBlindTestData['songs'];
}

export const MUSIC_SCENARIOS: MusicScenarioPreset[] = [
  {
    id: 'ms_night_drive',
    prompt: 'Midnight Neon City Drive 🌃',
    description: 'Windows cracked, city lights blurring past, 1:00 AM on the highway. What track are you queuing?',
    songs: [
      {
        id: 'song_midnight_city',
        title: 'Midnight City',
        artist: 'M83',
        genre: 'Synthwave / Indie',
        vibeEmoji: '🎷',
        color: 'from-purple-500 to-indigo-600',
      },
      {
        id: 'song_nightcall',
        title: 'Nightcall',
        artist: 'Kavinsky',
        genre: 'Electro Retro',
        vibeEmoji: '🏎️',
        color: 'from-pink-500 to-rose-600',
      },
      {
        id: 'song_after_hours',
        title: 'After Hours',
        artist: 'The Weeknd',
        genre: 'Dark R&B / Pop',
        vibeEmoji: '🕶️',
        color: 'from-red-600 to-amber-700',
      },
      {
        id: 'song_resonance',
        title: 'Resonance',
        artist: 'HOME',
        genre: 'Chillwave / Ambient',
        vibeEmoji: '🌌',
        color: 'from-cyan-500 to-blue-600',
      },
    ],
  },
  {
    id: 'ms_sunday_coffee',
    prompt: 'Sunday Morning Coffee & Vinyl ☕',
    description: 'Sun streaming through plants, fresh pour-over brewing, easy morning. What is spinning?',
    songs: [
      {
        id: 'song_japanese_denim',
        title: 'Japanese Denim',
        artist: 'Daniel Caesar',
        genre: 'Neo-Soul / R&B',
        vibeEmoji: '☕',
        color: 'from-amber-600 to-yellow-700',
      },
      {
        id: 'song_mystery_of_love',
        title: 'Mystery of Love',
        artist: 'Sufjan Stevens',
        genre: 'Acoustic Folk',
        vibeEmoji: '🌿',
        color: 'from-emerald-500 to-teal-700',
      },
      {
        id: 'song_sunflower',
        title: 'Sunflower',
        artist: 'Rex Orange County',
        genre: 'Indie Pop',
        vibeEmoji: '🌻',
        color: 'from-yellow-400 to-amber-500',
      },
      {
        id: 'song_coffee',
        title: 'Coffee',
        artist: 'beabadoobee',
        genre: 'Lo-Fi Bedroom Pop',
        vibeEmoji: '📻',
        color: 'from-orange-400 to-rose-400',
      },
    ],
  },
  {
    id: 'ms_guilty_pleasure',
    prompt: 'Guilty Pleasure Karaoke Jam 🎤',
    description: 'You’ve had one drink and grabbed the microphone. Which certified banger takes over your body?',
    songs: [
      {
        id: 'song_mr_brightside',
        title: 'Mr. Brightside',
        artist: 'The Killers',
        genre: 'Indie Rock Anthem',
        vibeEmoji: '🎸',
        color: 'from-blue-600 to-indigo-800',
      },
      {
        id: 'song_toxic',
        title: 'Toxic',
        artist: 'Britney Spears',
        genre: '2000s Pop Classic',
        vibeEmoji: '✨',
        color: 'from-violet-500 to-purple-800',
      },
      {
        id: 'song_tongue_tied',
        title: 'Tongue Tied',
        artist: 'Grouplove',
        genre: 'Indie Dance Energy',
        vibeEmoji: '🎉',
        color: 'from-lime-500 to-emerald-600',
      },
      {
        id: 'song_dancing_queen',
        title: 'Dancing Queen',
        artist: 'ABBA',
        genre: 'Timeless Disco',
        vibeEmoji: '🪩',
        color: 'from-pink-400 to-fuchsia-600',
      },
    ],
  },
];

export interface TriviaPreset {
  id: string;
  title: string;
  category: QuickTriviaData['category'];
  description: string;
  questions: QuickTriviaData['questions'];
}

export const TRIVIA_PRESETS: TriviaPreset[] = [
  {
    id: 'triv_chemistry',
    title: 'First Date Chemistry & Vibe Check ⚡',
    category: 'dating_chemistry',
    description: '3 quick questions to discover if you share the same dating frequency.',
    questions: [
      {
        id: 'q1',
        question: 'What is your ideal first date venue?',
        options: [
          'Dimly-lit speakeasy bar with jazz',
          'Retro arcade bar with air hockey & pinball',
          'Sunset hike or coastal walk with iced drinks',
          'Tucked-away counter ramen & dessert walk',
        ],
        emoji: '🍸',
      },
      {
        id: 'q2',
        question: 'How do you prefer texting between dates?',
        options: [
          'Rapid-fire voice notes & updates',
          'Thoughtful evening recap messages',
          'Absurd memes with minimal context',
          'Brief plans only; talk in person',
        ],
        emoji: '📱',
      },
      {
        id: 'q3',
        question: 'Spontaneous getaway or structured itinerary?',
        options: [
          'Zero plans: throw bags in trunk and drive',
          'Color-coded Notion spreadsheet with backups',
          'Loose list of 3 cafes and wandering freely',
          'Book a cozy cabin and do nothing',
        ],
        emoji: '🗺️',
      },
    ],
  },
  {
    id: 'triv_lifestyle',
    title: 'Weekend Chaos vs Chill Scale 🛋️',
    category: 'lifestyle',
    description: 'Find out whether your Saturdays align or balance each other out.',
    questions: [
      {
        id: 'q_life_1',
        question: 'Saturday night at 11:30 PM, where are you?',
        options: [
          'Dancing on a rooftop or DJ set',
          'Deep into a 3rd episode with takeout',
          'Cooking dinner with friends & great wine',
          'Asleep after an exhausting workout',
        ],
        emoji: '🌙',
      },
      {
        id: 'q_life_2',
        question: 'Your pet philosophy:',
        options: [
          'Obsessed dog parent (dog goes everywhere)',
          'Independent cat guardian',
          'Love animals, but keep my space quiet',
          'Looking to adopt a furry friend soon',
        ],
        emoji: '🐾',
      },
      {
        id: 'q_life_3',
        question: 'Cook together at home or explore new food carts?',
        options: [
          'Cook a gourmet meal together with music',
          'Hunt down the newest secret taco cart',
          'Order delivery and eat on the floor',
          'Dessert crawl only!',
        ],
        emoji: '🍜',
      },
    ],
  },
];
