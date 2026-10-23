import { DualCameraVibe, ARThisOrThatQuestion } from '../types';

// Helper to generate resilient SVG images for front and back camera snaps
function createDualCamSceneSvg(title: string, bgGradient: [string, string], iconSvg: string, detailText: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <defs>
      <linearGradient id="dc-grad-${Math.abs(title.length)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#dc-grad-${Math.abs(title.length)})" />
    
    <!-- Stylized Grid Lines for camera sensor aesthetic -->
    <path d="M133,0 L133,500 M266,0 L266,500 M0,166 L400,166 M0,333 L400,333" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.5" />
    
    <!-- Center Graphic -->
    <g transform="translate(160, 190)" fill="#ffffff" opacity="0.9">
      ${iconSvg}
    </g>

    <!-- Bottom Vignette -->
    <rect y="320" width="400" height="180" fill="black" fill-opacity="0.55" />
    <text x="24" y="420" fill="#ffffff" font-family="sans-serif" font-weight="800" font-size="20">${title}</text>
    <text x="24" y="448" fill="#a29bfe" font-family="sans-serif" font-weight="600" font-size="13">${detailText}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const coffeeIcon = `<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="#FFFFFF" stroke-width="3" fill="none" transform="scale(3.5)"/>`;
const potteryIcon = `<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FFFFFF" transform="scale(3.2)"/>`;
const artIcon = `<circle cx="13.5" cy="6.5" r="1.5" fill="#FFFFFF"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.7-1.6h2c3 0 5.5-2.5 5.5-5.6C22 6 17.5 2 12 2z" stroke="#FFFFFF" stroke-width="2" fill="none" transform="scale(3.2)"/>`;
const soundIcon = `<path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="#FFFFFF" stroke-width="3" fill="none" transform="scale(3.5)"/>`;

export const INITIAL_DUAL_CAMERA_VIBES: DualCameraVibe[] = [
  {
    id: 'vibe_leo',
    userId: 'user_leo',
    userName: 'Leo Vance',
    userAge: 28,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#6C5CE7"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">LV</text></svg>`),
    isVerified: true,
    frontPhotoUrl: createDualCamSceneSvg('Leo • Unfiltered Selfie', ['#2d3436', '#4834D4'], coffeeIcon, 'Drafting pencil behind ear'),
    backPhotoUrl: createDualCamSceneSvg('Drafting Board & Isometric Model', ['#4834D4', '#6C5CE7'], coffeeIcon, 'South Park Studio, SF'),
    caption: 'Testing isometric joinery models & 2nd pour-over. Complete studio chaos today 📐☕',
    locationTag: 'South Park Studio, SF',
    timeAgoLabel: '14m ago',
    promptLabel: "Today's Vibe • Unfiltered Reality",
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    likesCount: 12,
    likedByMe: false,
    commentsCount: 3,
  },
  {
    id: 'vibe_sofia',
    userId: 'user_sofia',
    userName: 'Sofia Chen',
    userAge: 24,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#00B894"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">SC</text></svg>`),
    isVerified: true,
    frontPhotoUrl: createDualCamSceneSvg('Sofia • Clay Apron', ['#1e272e', '#00B894'], potteryIcon, 'Clay smudge on forehead'),
    backPhotoUrl: createDualCamSceneSvg('Pottery Wheel in Motion', ['#00B894', '#009688'], potteryIcon, 'Dogpatch Ceramics Lab'),
    caption: 'Kiln reached 1200°C! Trying not to let this big vase collapse on the wheel 🏺',
    locationTag: 'Dogpatch Ceramics Lab, SF',
    timeAgoLabel: '32m ago',
    promptLabel: "Today's Vibe • In The Zone",
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    likesCount: 24,
    likedByMe: true,
    commentsCount: 7,
  },
  {
    id: 'vibe_elena',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userAge: 26,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#FD79A8"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">ER</text></svg>`),
    isVerified: true,
    frontPhotoUrl: createDualCamSceneSvg('Elena • Rooftop Terrace', ['#2c2c54', '#FD79A8'], artIcon, 'Sunny courtyard espresso'),
    backPhotoUrl: createDualCamSceneSvg('Modern Sculpture Garden', ['#FD79A8', '#6C5CE7'], artIcon, 'SFMOMA 5th Floor'),
    caption: 'Sun break between curating photographic prints. Catching the breeze 🎨☀️',
    locationTag: 'SFMOMA Rooftop Terrace, SF',
    timeAgoLabel: '50m ago',
    promptLabel: "Today's Vibe • Afternoon Break",
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    likesCount: 18,
    likedByMe: false,
    commentsCount: 5,
  },
  {
    id: 'vibe_marcus',
    userId: 'user_marcus',
    userName: 'Marcus Taylor',
    userAge: 29,
    userAvatar: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#6C5CE7"/><text x="50" y="58" font-size="36" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold">MT</text></svg>`),
    isVerified: false,
    frontPhotoUrl: createDualCamSceneSvg('Marcus • Studio Booth', ['#1b1464', '#0652DD'], soundIcon, 'Audio engineer in element'),
    backPhotoUrl: createDualCamSceneSvg('Analog Synthesizer & Cello', ['#0652DD', '#6C5CE7'], soundIcon, 'Mission Sound Lab'),
    caption: 'Tracking acoustic cello through 1970s tape delays. Chills in the monitors 🎧🎶',
    locationTag: 'Mission District, SF',
    timeAgoLabel: '1h 10m ago',
    promptLabel: "Today's Vibe • Sound Session",
    createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    likesCount: 9,
    likedByMe: false,
    commentsCount: 2,
  },
];

export const AR_THIS_OR_THAT_QUESTIONS: ARThisOrThatQuestion[] = [
  {
    id: 'ar_1',
    topic: 'Weekend Morning Ritual',
    optionLeft: { label: '6 AM Trail Run', emoji: '🏃' },
    optionRight: { label: '11 AM Bed Bagels', emoji: '🥯' },
  },
  {
    id: 'ar_2',
    topic: 'Ideal Impromptu Date',
    optionLeft: { label: 'Secret Speakeasy Jazz', emoji: '🍸' },
    optionRight: { label: 'Sunset Beach Tacos', emoji: '🌮' },
  },
  {
    id: 'ar_3',
    topic: 'Communication Chemistry',
    optionLeft: { label: '3-Minute Voice Notes', emoji: '🎙️' },
    optionRight: { label: 'Skip to FaceTime', emoji: '📱' },
  },
  {
    id: 'ar_4',
    topic: 'Spontaneous Travel',
    optionLeft: { label: 'Kyoto Temple Garden', emoji: '⛩️' },
    optionRight: { label: 'Amalfi Coast Boat', emoji: '⛵' },
  },
  {
    id: 'ar_5',
    topic: 'Music & Atmosphere',
    optionLeft: { label: 'Vinyl Listening Lounge', emoji: '🎵' },
    optionRight: { label: 'Rooftop DJ Dancefloor', emoji: '🪩' },
  },
];

export const SAMPLE_DISAPPEARING_SNAPS = [
  {
    id: 'snap_sample_1',
    caption: 'Look who walked into the coffee shop right behind me! ☕👀',
    stickerEmoji: '☕',
    viewDurationSeconds: 5,
    previewUrl: createDualCamSceneSvg('Coffee Counter Secret', ['#6C5CE7', '#FD79A8'], coffeeIcon, 'Disappears in 5 seconds'),
  },
  {
    id: 'snap_sample_2',
    caption: 'Guess which song is playing right now on the record player? 🎶',
    stickerEmoji: '🎷',
    viewDurationSeconds: 5,
    previewUrl: createDualCamSceneSvg('Vinyl Mystery Note', ['#2D3436', '#00B894'], soundIcon, 'Disappears in 5 seconds'),
  },
];
