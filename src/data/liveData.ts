import { GoingNowBroadcast, RapidPrompt } from '../types';

// Helper to generate resilient SVG snapshots for venues
function createVenueSnapshot(title: string, bgGradient: [string, string], iconSvg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <defs>
      <linearGradient id="v-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
      <linearGradient id="v-overlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.75" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#v-grad)" />
    
    <!-- Ambient shapes -->
    <circle cx="500" cy="80" r="140" fill="#ffffff" fill-opacity="0.08" />
    <circle cx="100" cy="320" r="160" fill="#ffffff" fill-opacity="0.05" />
    
    <!-- Center Graphic Icon -->
    <g transform="translate(260, 130)" fill="#ffffff" opacity="0.9">
      ${iconSvg}
    </g>

    <!-- Overlay Scrim -->
    <rect width="600" height="400" fill="url(#v-overlay)" />

    <!-- Title Label -->
    <text x="32" y="355" fill="#ffffff" font-family="sans-serif" font-weight="700" font-size="24" letter-spacing="0.5">${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const coffeeIcon = `<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="scale(3)"/>`;
const bookIcon = `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" transform="scale(3.2)"/>`;
const drinksIcon = `<path d="M8 22h8M12 15v7M19 3H5l7 8 7-8z" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="scale(3)"/>`;
const artIcon = `<circle cx="13.5" cy="6.5" r=".5" fill="#FFFFFF"/><circle cx="17.5" cy="10.5" r=".5" fill="#FFFFFF"/><circle cx="8.5" cy="7.5" r=".5" fill="#FFFFFF"/><circle cx="6.5" cy="12.5" r=".5" fill="#FFFFFF"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" stroke="#FFFFFF" stroke-width="3" fill="none" transform="scale(3.2)"/>`;
const parkIcon = `<path d="M12 2L3 17h6v5h6v-5h6L12 2z" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linejoin="round" transform="scale(3)"/>`;
const musicIcon = `<path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="scale(3)"/>`;

export const INITIAL_GOING_NOW_BROADCASTS: GoingNowBroadcast[] = [
  {
    id: 'gn_1',
    userId: 'user_leo',
    userName: 'Leo Vance',
    userAge: 28,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#6C5CE7"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">LV</text></svg>`),
    userOccupation: 'Architect & Designer',
    isVerified: true,
    category: 'coffee',
    venueName: 'Sightglass Coffee (SoMa)',
    neighborhood: 'South of Market, SF',
    distanceKm: 1.2,
    photoUrl: createVenueSnapshot('Sightglass Coffee Bar', ['#4834D4', '#6C5CE7'], coffeeIcon),
    note: 'Sketching floor plans & testing their Ethiopian pour-over. Window counter seat has good vibes — come grab a latte and say hi!',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    tags: ['Ethiopian Pour-over', 'Architecture Sketching', 'Chill Ambient'],
    rsvps: [
      {
        userId: 'user_maya',
        userName: 'Maya Patel',
        userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#FD79A8"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">MP</text></svg>`),
        status: 'on_my_way',
        etaMinutes: 12,
        customMessage: 'Grabbing an iced oat cortado in 10 mins!',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'gn_2',
    userId: 'user_sofia',
    userName: 'Sofia Chen',
    userAge: 24,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#00B894"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">SC</text></svg>`),
    userOccupation: 'Ceramicist & Barista',
    isVerified: true,
    category: 'bookstore',
    venueName: 'City Lights Booksellers',
    neighborhood: 'North Beach, SF',
    distanceKm: 2.4,
    photoUrl: createVenueSnapshot('City Lights Booksellers', ['#2D3436', '#636E72'], bookIcon),
    note: 'Hunting for rare poetry & Japanese woodwork books in the basement room. Coffee afterward on Columbus Ave?',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
    tags: ['Beat Poetry', 'Bookworms', 'North Beach Walk'],
    rsvps: [],
  },
  {
    id: 'gn_3',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userAge: 26,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#FD79A8"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">ER</text></svg>`),
    userOccupation: 'Art Curator & Violinist',
    isVerified: true,
    category: 'art',
    venueName: 'SFMOMA Rooftop Sculpture Terrace',
    neighborhood: 'Yerba Buena, SF',
    distanceKm: 0.8,
    photoUrl: createVenueSnapshot('SFMOMA Sculpture Terrace', ['#6C5CE7', '#FD79A8'], artIcon),
    note: 'Sunny afternoon on the 5th floor living wall terrace. Contemplating Calder sculptures. Say hi if you love modern art!',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
    tags: ['Modern Art', 'Living Wall', 'Rooftop Vibes'],
    rsvps: [],
  },
  {
    id: 'gn_4',
    userId: 'user_marcus',
    userName: 'Marcus Taylor',
    userAge: 29,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#00B894"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">MT</text></svg>`),
    userOccupation: 'Audio Engineer',
    isVerified: false,
    category: 'outdoor',
    venueName: 'Mission Dolores Park (South Slope)',
    neighborhood: 'Mission District, SF',
    distanceKm: 3.1,
    photoUrl: createVenueSnapshot('Dolores Park South Slope', ['#00B894', '#009688'], parkIcon),
    note: 'Brought an acoustic guitar and blankets on the sunny grass. Great panoramic city views right now!',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
    tags: ['Sunny Grass', 'Music Jam', 'Golden Hour'],
    rsvps: [],
  },
  {
    id: 'gn_5',
    userId: 'user_chloe',
    userName: 'Chloe Bennett',
    userAge: 25,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#FD79A8"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">CB</text></svg>`),
    userOccupation: 'Sommelier',
    isVerified: true,
    category: 'drinks',
    venueName: 'The Page Bar & Vinyl Lounge',
    neighborhood: 'Lower Haight, SF',
    distanceKm: 2.8,
    photoUrl: createVenueSnapshot('The Page Vinyl Lounge', ['#2D3436', '#4834D4'], drinksIcon),
    note: 'Spinning vintage jazz 45s and sipping craft ciders. Cozy booth in the back if anyone wants to chat music!',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 95 * 60 * 1000).toISOString(),
    tags: ['Vinyl Records', 'Craft Cider', 'Cozy Booth'],
    rsvps: [],
  },
];

export const LIVE_ROULETTE_ICEBREAKERS = [
  'What is the most delightfully spontaneous trip you have ever taken?',
  'Pineapple on pizza: dealbreaker, culinary masterpiece, or harmless debate?',
  'What song do you secretly know every single lyric to without fail?',
  'What is your go-to comfort food after an exhausting week?',
  'Two truths and a lie: Guess my most unusual secret hobby!',
  'If you could teleport to any city right this second for dinner, where are we eating?',
  'What is your ultimate Sunday morning: 6am trail run or 11am French toast in bed?',
  'What is an unpopular movie or music opinion that you will defend with your life?',
];

export const RAPID_MATCH_PROMPTS: RapidPrompt[] = [
  {
    id: 'rm_1',
    question: 'Our first impromptu date vibe:',
    emoji: '🥂',
    options: [
      'Secret candlelit speakeasy with jazz',
      'Sunset food truck tacos on the beach',
      'Indie bookstore hunt & hot matcha lattes',
      'Interactive clay pottery or cooking workshop',
    ],
  },
  {
    id: 'rm_2',
    question: 'Ideal weekend superpower:',
    emoji: '⚡',
    options: [
      'Wake up early for fresh sourdough & farmers market',
      'Sleep until noon, slow vinyl listening session',
      'Spontaneous road trip with no destination',
      'Cozy movie marathon & homemade gourmet ramen',
    ],
  },
  {
    id: 'rm_3',
    question: 'How do you text when there are sparks?',
    emoji: '💬',
    options: [
      '3-minute voice notes with sound effects',
      'Rapid-fire hilarious memes and TikToks',
      'Deep 1 AM conversations that last for hours',
      'Skip texting, let’s meet up in person ASAP!',
    ],
  },
];

export const VENUE_PRESETS = [
  {
    category: 'coffee' as const,
    name: 'Blue Bottle Coffee',
    neighborhood: 'Ferry Building, SF',
    icon: coffeeIcon,
    gradient: ['#4834D4', '#6C5CE7'] as [string, string],
  },
  {
    category: 'coffee' as const,
    name: 'Sightglass Coffee Bar',
    neighborhood: 'SoMa, SF',
    icon: coffeeIcon,
    gradient: ['#6C5CE7', '#a29bfe'] as [string, string],
  },
  {
    category: 'bookstore' as const,
    name: 'Green Apple Books on the Park',
    neighborhood: 'Inner Sunset, SF',
    icon: bookIcon,
    gradient: ['#2D3436', '#636E72'] as [string, string],
  },
  {
    category: 'drinks' as const,
    name: 'Charmaine’s Rooftop Bar',
    neighborhood: 'Market St, SF',
    icon: drinksIcon,
    gradient: ['#FD79A8', '#6C5CE7'] as [string, string],
  },
  {
    category: 'art' as const,
    name: 'SFMOMA Modern Art Gallery',
    neighborhood: 'SoMa, SF',
    icon: artIcon,
    gradient: ['#00B894', '#4834D4'] as [string, string],
  },
  {
    category: 'outdoor' as const,
    name: 'Mission Dolores Park Sun Lawn',
    neighborhood: 'Mission, SF',
    icon: parkIcon,
    gradient: ['#00B894', '#55efc4'] as [string, string],
  },
];

export function getVenuePresetSnapshot(presetName: string, gradient: [string, string], category: string): string {
  let icon = coffeeIcon;
  if (category === 'bookstore') icon = bookIcon;
  if (category === 'drinks') icon = drinksIcon;
  if (category === 'art') icon = artIcon;
  if (category === 'outdoor') icon = parkIcon;
  if (category === 'music') icon = musicIcon;
  return createVenueSnapshot(presetName, gradient, icon);
}
