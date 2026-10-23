import { User, UserReport, VerificationRequest, Message, Match } from '../types';

// Helper to create high-resolution modern SVG portraits for 100% resilient offline rendering
export function createSvgPortrait(name: string, bgGradient: [string, string], accentColor: string, seed: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bg-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
      <linearGradient id="glow-${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="halo-${seed}" cx="50%" cy="30%" r="50%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" />
        <stop offset="100%" stop-color="transparent" />
      </radialGradient>
    </defs>
    
    <!-- Background Canvas -->
    <rect width="400" height="500" fill="url(#bg-${seed})" />
    <circle cx="200" cy="180" r="160" fill="url(#halo-${seed})" />

    <!-- Ambient Geometric Lighting -->
    <path d="M0,350 Q100,280 200,320 T400,290 L400,500 L0,500 Z" fill="${accentColor}" fill-opacity="0.08" />
    
    <!-- Stylized Portrait Silhouette -->
    <g transform="translate(200, 240)">
      <!-- Shoulders & Torso -->
      <path d="M-110,190 C-110,130 -80,95 -45,85 L45,85 C80,95 110,130 110,190 Z" fill="#121318" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="2" />
      
      <!-- Neck -->
      <rect x="-24" y="25" width="48" height="65" rx="10" fill="#22232d" />
      
      <!-- Head -->
      <ellipse cx="0" cy="-20" rx="60" ry="75" fill="#1e202a" stroke="#2e3244" stroke-width="2" />
      
      <!-- Hair Silhouette -->
      ${
        seed % 2 === 0
          ? `<path d="M-65,-40 C-70,-100 0,-115 65,-40 C75,0 70,50 62,80 C50,20 40,0 35,-30 C10,-45 -10,-45 -35,-30 C-40,0 -50,20 -62,80 C-70,50 -75,0 -65,-40 Z" fill="#0d0e12" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5" />`
          : `<path d="M-62,-30 C-65,-95 -10,-110 50,-85 C65,-50 68,-10 60,10 C50,-20 30,-50 -5,-55 C-35,-60 -50,-20 -58,0 Z" fill="#0d0e12" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5" />`
      }

      <!-- Eyes & Subtle Facial Accents -->
      <circle cx="-22" cy="-18" r="4" fill="${accentColor}" />
      <circle cx="22" cy="-18" r="4" fill="${accentColor}" />
      <path d="M-30,-28 Q-22,-34 -14,-28" stroke="#8b949e" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M14,-28 Q22,-34 30,-28" stroke="#8b949e" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M-12,16 Q0,26 12,16" stroke="${accentColor}" stroke-width="2" fill="none" stroke-linecap="round" />
    </g>

    <!-- Bottom Vignette Gradient Scrim for legible text -->
    <rect y="300" width="400" height="200" fill="url(#glow-${seed})" opacity="0.8" />
    <rect y="280" width="400" height="220" fill="url(#black-vignette)" opacity="0.6" />
    <defs>
      <linearGradient id="black-vignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#050505" stop-opacity="0" />
        <stop offset="100%" stop-color="#050505" stop-opacity="0.95" />
      </linearGradient>
    </defs>

    <!-- Aesthetic Watermark / Label inside card -->
    <text x="24" y="470" fill="#f3f4f6" font-family="sans-serif" font-weight="700" font-size="20" letter-spacing="0.5">${name}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user_maya',
    name: 'Maya Patel',
    age: 25,
    birthDate: '2001-04-14',
    gender: 'woman',
    lookingFor: 'men',
    relationshipGoal: 'long-term',
    bio: 'Product designer by day, analog photographer on weekends. Looking for someone who gets excited about art galleries, spontaneous road trips, and finding the best pour-over in the city.',
    phoneNumber: '+15552345678',
    occupation: 'UX Designer',
    company: 'Studio Form',
    education: 'Rhode Island School of Design',
    height: "5'7\" (170cm)",
    location: { city: 'San Francisco, CA', distanceKm: 4 },
    interests: ['Analog Photography', 'Specialty Coffee', 'Bouldering', 'Indie Films', 'Architecture', 'Ceramics'],
    photos: [
      createSvgPortrait('Maya Patel', ['#0f172a', '#1e293b'], '#00FF66', 101),
      createSvgPortrait('Maya at Gallery', ['#18181b', '#27272a'], '#10B981', 102),
      createSvgPortrait('Weekend Coffee', ['#1c1917', '#292524'], '#00FF66', 103),
    ],
    prompts: [
      { question: 'A boundary of mine is', answer: 'Clear communication and listening without trying to fix everything immediately.' },
      { question: 'Together we could', answer: 'Build an epic vinyl collection and find the best hidden rooftop jazz spots.' },
      { question: 'My Sunday routine', answer: 'Farmer’s market sourdough, chemex brew, and a slow bike ride along the bay.' },
    ],
    isVerified: true,
    verificationStatus: 'verified',
    isPremium: false,
    role: 'user',
    accountStatus: 'active',
    settings: {
      incognito: false,
      hideDistance: false,
      readReceipts: true,
      notifications: true,
      ageRange: [22, 34],
      maxDistanceKm: 35,
    },
    likedUserIds: ['user_leo', 'user_elena'],
    passedUserIds: [],
    superLikedUserIds: [],
    blockedUserIds: [],
    karmaScore: 96,
    karmaBadges: ['prompt_responder', 'zero_ghost_karma', 'intentional_dater'],
    responseRatePercent: 98,
    avgResponseMinutes: 12,
    irlDatesCompleted: 3,
  },
  {
    id: 'user_leo',
    name: 'Leo Vance',
    age: 28,
    birthDate: '1998-08-22',
    gender: 'man',
    lookingFor: 'women',
    relationshipGoal: 'serious',
    bio: 'Architect working on sustainable timber high-rises. Big fan of Scandinavian minimalism, handmade pasta, and high-energy trail runs. Let’s talk about your favorite city.',
    phoneNumber: '+15558765432',
    occupation: 'Architect',
    company: 'Kjaer & Co',
    education: 'Columbia GSAPP',
    height: "6'1\" (185cm)",
    location: { city: 'San Francisco, CA', distanceKm: 6 },
    interests: ['Architecture', 'Trail Running', 'Vinyl Records', 'Handmade Pasta', 'Design', 'Bouldering'],
    photos: [
      createSvgPortrait('Leo Vance', ['#09090b', '#18181b'], '#00FF66', 201),
      createSvgPortrait('Leo on Site', ['#022c22', '#064e3b'], '#34D399', 202),
      createSvgPortrait('Trail Run SF', ['#172554', '#1e3a8a'], '#00FF66', 203),
    ],
    prompts: [
      { question: 'The best way to ask me out is', answer: 'Suggest an obscure museum or a quiet dinner spot where we can actually hear each other talk.' },
      { question: 'I will pick the restaurant if', answer: 'You promise to let me order the cacio e pepe to share.' },
    ],
    isVerified: true,
    verificationStatus: 'verified',
    isPremium: true,
    role: 'user',
    accountStatus: 'active',
    settings: {
      incognito: false,
      hideDistance: false,
      readReceipts: true,
      notifications: true,
      ageRange: [23, 32],
      maxDistanceKm: 40,
    },
    likedUserIds: ['user_maya', 'user_zara'],
    passedUserIds: [],
    superLikedUserIds: ['user_maya'],
    blockedUserIds: [],
    karmaScore: 98,
    karmaBadges: ['prompt_responder', 'verified_show_up', 'intentional_dater'],
    responseRatePercent: 99,
    avgResponseMinutes: 8,
    irlDatesCompleted: 5,
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    age: 26,
    birthDate: '2000-02-19',
    gender: 'woman',
    lookingFor: 'everyone',
    relationshipGoal: 'long-term',
    bio: 'Marine ecologist studying kelp forest restoration. Spend half my life in a wetsuit and the other half reading vintage sci-fi books in botanical parks.',
    occupation: 'Marine Biologist',
    company: 'Ocean Restoration Alliance',
    education: 'UC Santa Cruz',
    height: "5'8\" (173cm)",
    location: { city: 'Oakland, CA', distanceKm: 12 },
    interests: ['Scuba Diving', 'Ocean Conservation', 'Sci-Fi', 'Trail Running', 'Podcasts', 'Specialty Coffee'],
    photos: [
      createSvgPortrait('Elena Rostova', ['#042f2e', '#134e4a'], '#00FF66', 301),
      createSvgPortrait('Elena at Marina', ['#0f172a', '#1e293b'], '#10B981', 302),
    ],
    prompts: [
      { question: 'A life goal of mine', answer: 'Diving the Great Barrier Reef before I turn 30 and publishing my oceanography book.' },
      { question: 'Unusual skill', answer: 'Can identify 40 species of nudibranchs on sight and cook a 3-course meal in a camper van.' },
    ],
    isVerified: true,
    verificationStatus: 'verified',
    isPremium: false,
    role: 'user',
    accountStatus: 'active',
    settings: {
      incognito: false,
      hideDistance: false,
      readReceipts: true,
      notifications: true,
      ageRange: [24, 35],
      maxDistanceKm: 50,
    },
    likedUserIds: ['user_maya'],
    passedUserIds: [],
    superLikedUserIds: [],
    blockedUserIds: [],
  },
  {
    id: 'user_noah',
    name: 'Noah Kim',
    age: 29,
    birthDate: '1997-11-05',
    gender: 'man',
    lookingFor: 'women',
    relationshipGoal: 'marriage',
    bio: 'Culinary director & sourdough enthusiast. In search of a meaningful long-term partner who values emotional honesty, laughter, and homemade dinner parties.',
    occupation: 'Culinary Director',
    company: 'Wildgrain Hearth',
    education: 'Culinary Institute of America',
    height: "5'11\" (180cm)",
    location: { city: 'Berkeley, CA', distanceKm: 15 },
    interests: ['Cooking', 'Natural Wine', 'Ceramics', 'Cycling', 'Indie Films', 'Jazz'],
    photos: [
      createSvgPortrait('Noah Kim', ['#18181b', '#27272a'], '#00FF66', 401),
      createSvgPortrait('Noah in Kitchen', ['#1c1917', '#44403c'], '#34D399', 402),
    ],
    prompts: [
      { question: 'I’m looking for', answer: 'A deep emotional connection, mutual curiosity, and someone who appreciates sourdough crumb structure.' },
      { question: 'Two truths and a lie', answer: 'Baked bread for the President, cycled across Japan, never broken a bone.' },
    ],
    isVerified: true,
    verificationStatus: 'verified',
    isPremium: false,
    role: 'user',
    accountStatus: 'active',
    settings: {
      incognito: false,
      hideDistance: false,
      readReceipts: true,
      notifications: true,
      ageRange: [25, 33],
      maxDistanceKm: 30,
    },
    likedUserIds: ['user_maya'],
    passedUserIds: [],
    superLikedUserIds: [],
    blockedUserIds: [],
  },
  {
    id: 'user_zara',
    name: 'Zara Chen',
    age: 24,
    birthDate: '2002-06-30',
    gender: 'woman',
    lookingFor: 'men',
    relationshipGoal: 'serious',
    bio: 'AI safety researcher & amateur cellist. Fascinated by philosophy of mind, neon night markets, and climbing 5.11 routes.',
    occupation: 'Research Scientist',
    company: 'Frontier AI Lab',
    education: 'Stanford University',
    height: "5'6\" (168cm)",
    location: { city: 'Palo Alto, CA', distanceKm: 28 },
    interests: ['Rock Climbing', 'Classical Cello', 'Philosophy', 'Stargazing', 'Bouldering', 'Tech'],
    photos: [
      createSvgPortrait('Zara Chen', ['#111827', '#1f2937'], '#00FF66', 501),
      createSvgPortrait('Zara with Cello', ['#022c22', '#0f766e'], '#10B981', 502),
    ],
    prompts: [
      { question: 'Teach me something about', answer: 'Your most niche passion that you could give an unprompted 45-minute TED talk on.' },
      { question: 'My golden rule', answer: 'Kindness is courage. Never be afraid to care too much.' },
    ],
    isVerified: true,
    verificationStatus: 'verified',
    isPremium: false,
    role: 'user',
    accountStatus: 'active',
    settings: {
      incognito: false,
      hideDistance: false,
      readReceipts: true,
      notifications: true,
      ageRange: [23, 30],
      maxDistanceKm: 45,
    },
    likedUserIds: ['user_leo'],
    passedUserIds: [],
    superLikedUserIds: [],
    blockedUserIds: [],
  },
  {
    id: 'user_marcus',
    name: 'Marcus Sterling',
    age: 30,
    birthDate: '1996-03-12',
    gender: 'man',
    lookingFor: 'women',
    relationshipGoal: 'long-term',
    bio: 'Renewable energy engineer & rescue dog dad (meet Barnaby 🐕). Weekends spent camping in the redwoods or restoring vintage mid-century furniture.',
    occupation: 'Renewable Energy Lead',
    company: 'Solstice Grid',
    education: 'UC Berkeley',
    height: "6'2\" (188cm)",
    location: { city: 'San Francisco, CA', distanceKm: 8 },
    interests: ['Camping', 'Dogs', 'Woodworking', 'Hiking', 'Jazz', 'Environmentalism'],
    photos: [
      createSvgPortrait('Marcus Sterling', ['#14532d', '#166534'], '#00FF66', 601),
      createSvgPortrait('Marcus & Barnaby', ['#1c1917', '#292524'], '#34D399', 602),
    ],
    prompts: [
      { question: 'First round is on me if', answer: 'You can guess which mid-century lounge chair I spent 3 months rebuilding from scratch.' },
      { question: 'A non-negotiable', answer: 'Loving dogs (Barnaby is part of the package).' },
    ],
    isVerified: false,
    verificationStatus: 'pending',
    isPremium: false,
    role: 'user',
    accountStatus: 'active',
    settings: {
      incognito: false,
      hideDistance: false,
      readReceipts: true,
      notifications: true,
      ageRange: [25, 34],
      maxDistanceKm: 30,
    },
    likedUserIds: [],
    passedUserIds: [],
    superLikedUserIds: [],
    blockedUserIds: [],
  },
  {
    id: 'user_admin',
    name: 'Trust & Safety Officer',
    age: 34,
    birthDate: '1992-01-10',
    gender: 'other',
    lookingFor: 'everyone',
    relationshipGoal: 'open-to-all',
    bio: 'HeartLink Trust & Safety Team Lead. Ensuring our community remains safe, genuine, and verified.',
    occupation: 'Lead Moderator',
    company: 'HeartLink Inc',
    education: 'Georgetown Law',
    location: { city: 'San Francisco, CA', distanceKm: 0 },
    interests: ['Safety', 'Ethics', 'Tech Policy', 'Meditation'],
    photos: [createSvgPortrait('Admin Officer', ['#050505', '#1e1e24'], '#00FF66', 999)],
    prompts: [],
    isVerified: true,
    verificationStatus: 'verified',
    isPremium: true,
    role: 'admin',
    accountStatus: 'active',
    settings: {
      incognito: true,
      hideDistance: true,
      readReceipts: true,
      notifications: true,
      ageRange: [18, 50],
      maxDistanceKm: 100,
    },
    likedUserIds: [],
    passedUserIds: [],
    superLikedUserIds: [],
    blockedUserIds: [],
  },
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'match_maya_leo',
    userId1: 'user_maya',
    userId2: 'user_leo',
    matchedAt: '2026-10-19T14:20:00Z',
    lastMessage: 'I know this incredible rooftop spot with an actual Japanese rock garden.',
    lastMessageAt: '2026-10-20T08:15:00Z',
    unreadCount1: 0,
    unreadCount2: 1,
    isSuperLike: true,
    slotStatus: 'active',
  },
  {
    id: 'match_maya_elena',
    userId1: 'user_maya',
    userId2: 'user_elena',
    matchedAt: '2026-10-18T19:40:00Z',
    lastMessage: 'Wait, you shoot on a 35mm Leica? That is so cool!',
    lastMessageAt: '2026-10-19T22:30:00Z',
    unreadCount1: 1,
    unreadCount2: 0,
    isSuperLike: false,
    slotStatus: 'active',
  },
  {
    id: 'match_maya_marcus',
    userId1: 'user_maya',
    userId2: 'user_marcus',
    matchedAt: '2026-10-21T09:10:00Z',
    unreadCount1: 0,
    unreadCount2: 0,
    isSuperLike: false,
  },
  {
    id: 'match_maya_sofia',
    userId1: 'user_maya',
    userId2: 'user_sofia',
    matchedAt: '2026-10-21T08:30:00Z',
    unreadCount1: 0,
    unreadCount2: 0,
    isSuperLike: true,
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    matchId: 'match_maya_leo',
    senderId: 'user_leo',
    receiverId: 'user_maya',
    text: 'Hey Maya! Loved seeing your analog photography prompt. Your eye for architecture in that gallery shot is stunning.',
    timestamp: '2026-10-19T14:22:00Z',
    status: 'read',
    isRead: true,
    isIcebreaker: true,
    reactions: [
      { emoji: '❤️', userId: 'user_maya' },
    ],
  },
  {
    id: 'msg_2',
    matchId: 'match_maya_leo',
    senderId: 'user_maya',
    receiverId: 'user_leo',
    text: 'Thanks Leo! That means a lot coming from an architect haha. Which timber project are you currently working on?',
    timestamp: '2026-10-19T14:45:00Z',
    status: 'read',
    isRead: true,
    reactions: [
      { emoji: '🔥', userId: 'user_leo' },
    ],
  },
  {
    id: 'msg_3',
    matchId: 'match_maya_leo',
    senderId: 'user_leo',
    receiverId: 'user_maya',
    text: 'A cross-laminated timber pavilion down near Mission Bay! If you’re free this Thursday, I know this incredible rooftop spot with an actual Japanese rock garden nearby.',
    timestamp: '2026-10-20T08:15:00Z',
    status: 'read',
    isRead: true,
  },
  {
    id: 'msg_3_voice',
    matchId: 'match_maya_leo',
    senderId: 'user_leo',
    receiverId: 'user_maya',
    text: '🎤 Voice note (0:09)',
    timestamp: '2026-10-20T08:16:30Z',
    status: 'read',
    isRead: true,
    attachmentType: 'voice',
    voiceDuration: 9,
    voiceWaveform: [
      0.22, 0.4, 0.65, 0.85, 0.7, 0.45, 0.6, 0.92, 0.8, 0.65, 0.4, 0.75, 0.88,
      0.95, 0.6, 0.4, 0.55, 0.7, 0.8, 0.6, 0.45, 0.7, 0.85, 0.5, 0.35, 0.25,
      0.2, 0.18,
    ],
    reactions: [
      { emoji: '❤️', userId: 'user_maya' },
      { emoji: '✨', userId: 'user_leo' },
    ],
  },
  {
    id: 'msg_4',
    matchId: 'match_maya_elena',
    senderId: 'user_elena',
    receiverId: 'user_maya',
    text: 'Wait, you shoot on a 35mm Leica? That is so cool!',
    timestamp: '2026-10-19T22:30:00Z',
    status: 'delivered',
    isRead: false,
    isIcebreaker: true,
  },
  {
    id: 'msg_5',
    matchId: 'match_maya_elena',
    senderId: 'user_elena',
    receiverId: 'user_maya',
    text: '🎲 Let’s skip awkward openers! Can you spot my lie in 2 minutes?',
    timestamp: '2026-10-19T22:32:00Z',
    status: 'delivered',
    isRead: false,
    attachmentType: 'minigame',
    gameData: {
      type: 'two_truths_and_a_lie',
      theme: 'Wildlife Expeditions & Chaos 🌿',
      statements: [
        'I stood 10 feet from a wild grizzly bear in Alaska while changing camera lenses.',
        'I spent 48 straight hours in a tree canopy waiting for an endangered owl to blink.',
        'I am deathly terrified of common city pigeons flying near my face.',
      ],
      lieIndex: 1,
      lieExplanation: '48 hours in a tree? No way, my legs fell asleep after 3 hours! The pigeon phobia is 100% real though 😂',
      resolved: false,
      createdAt: '2026-10-19T22:32:00Z',
    },
  },
];

export const INITIAL_REPORTS: UserReport[] = [
  {
    id: 'rep_1',
    reporterId: 'user_leo',
    reporterName: 'Leo Vance',
    reportedUserId: 'user_fake_01',
    reportedUserName: 'CryptoModel99',
    reason: 'scam',
    description: 'Direct message soliciting crypto investment link on third-party Telegram immediately after matching.',
    createdAt: '2026-10-20T07:10:00Z',
    status: 'pending',
  },
  {
    id: 'rep_2',
    reporterId: 'user_maya',
    reporterName: 'Maya Patel',
    reportedUserId: 'user_inapp_02',
    reportedUserName: 'ShadowGhost',
    reason: 'inappropriate_photos',
    description: 'Uploaded non-profile explicit graphic material violating photo community guidelines.',
    createdAt: '2026-10-19T16:20:00Z',
    status: 'reviewed',
    actionTaken: 'Photo flagged for automatic quarantine',
  },
];

export const INITIAL_VERIFICATIONS: VerificationRequest[] = [
  {
    id: 'ver_1',
    userId: 'user_marcus',
    userName: 'Marcus Sterling',
    userAge: 30,
    submittedAt: '2026-10-20T08:00:00Z',
    selfiePose: 'Index finger pointing to right eyebrow gesture',
    status: 'pending',
  },
  {
    id: 'ver_2',
    userId: 'user_maya',
    userName: 'Maya Patel',
    userAge: 25,
    submittedAt: '2026-10-18T10:00:00Z',
    selfiePose: 'Peace sign next to chin gesture',
    status: 'approved',
  },
];

export const ICEBREAKER_PROMPTS = [
  'What is the best meal you have ever had in your life?',
  'If we had an entire Saturday with zero obligations, what would we do?',
  'What is your go-to comfort coffee or tea order?',
  'Tell me about your favorite travel memory that went completely off-script!',
  'What song has been stuck in your head lately?',
  'Are you more of an early morning hike person or late night jazz lounge?',
];
