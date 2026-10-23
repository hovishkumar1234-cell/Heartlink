export type RelationshipGoal =
  | 'long-term'
  | 'marriage'
  | 'serious'
  | 'casual'
  | 'friends'
  | 'open-to-all';

export type Gender = 'woman' | 'man' | 'non-binary' | 'other';
export type LookingFor = 'women' | 'men' | 'everyone';

export interface UserPrompt {
  question: string;
  answer: string;
}

export interface UserLocation {
  city: string;
  distanceKm: number;
}

export interface UserSettings {
  incognito: boolean;
  hideDistance: boolean;
  readReceipts: boolean;
  notifications: boolean;
  ageRange: [number, number];
  maxDistanceKm: number;
}

export interface User {
  id: string;
  name: string;
  age: number;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  lookingFor: LookingFor;
  relationshipGoal: RelationshipGoal;
  bio: string;
  phoneNumber?: string;
  occupation: string;
  company?: string;
  education?: string;
  height?: string;
  location: UserLocation;
  interests: string[];
  photos: string[];
  prompts: UserPrompt[];
  isVerified: boolean;
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  isPremium: boolean;
  role: 'user' | 'admin';
  accountStatus: 'active' | 'suspended' | 'deleted';
  settings: UserSettings;
  likedUserIds: string[];
  passedUserIds: string[];
  superLikedUserIds: string[];
  blockedUserIds: string[];

  // Anti-Ghosting & Karma Profile
  karmaScore?: number; // 0 - 100
  karmaBadges?: KarmaBadgeType[];
  responseRatePercent?: number; // e.g. 98%
  avgResponseMinutes?: number; // e.g. 15
  irlDatesCompleted?: number;
}

export type MatchSlotStatus =
  | 'active'
  | 'graduated_date'
  | 'graduated_socials'
  | 'departed_politely'
  | 'archived';

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  matchedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount1: number;
  unreadCount2: number;
  isSuperLike?: boolean;

  // Anti-Ghosting Active Chat Slot Management
  slotStatus?: MatchSlotStatus;
  scheduledDate?: IrlDatePlan;
  socialExchange?: SocialExchange;
  departureDetails?: {
    templateId: string;
    reason: string;
    timestamp: string;
    senderId: string;
  };
}

export interface MessageReaction {
  emoji: string;
  userId: string;
}

export type MiniGameType = 'two_truths_and_a_lie' | 'music_taste_blind_test' | 'quick_trivia';

export interface TwoTruthsGameData {
  type: 'two_truths_and_a_lie';
  title?: string;
  theme: string;
  statements: string[];
  lieIndex: number;
  lieExplanation: string;
  guesserId?: string;
  guessIndex?: number;
  isGuessedCorrectly?: boolean;
  resolved: boolean;
  createdAt: string;
}

export interface MusicBlindTestSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  vibeEmoji: string;
  color: string;
}

export interface MusicBlindTestData {
  type: 'music_taste_blind_test';
  prompt: string;
  songs: MusicBlindTestSong[];
  creatorPickId: string;
  partnerGuessId?: string;
  partnerPickId?: string;
  matchPercentage?: number;
  resolved: boolean;
  createdAt: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  emoji?: string;
}

export interface QuickTriviaData {
  type: 'quick_trivia';
  title: string;
  category: 'dating_chemistry' | 'spontaneous_vibe' | 'lifestyle';
  questions: TriviaQuestion[];
  creatorAnswers: Record<string, string>;
  partnerAnswers?: Record<string, string>;
  compatibilityScore?: number;
  resolved: boolean;
  createdAt: string;
}

export type MiniGameData = TwoTruthsGameData | MusicBlindTestData | QuickTriviaData;

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isRead?: boolean;
  isIcebreaker?: boolean;
  attachmentType?:
    | 'image'
    | 'voice'
    | 'icebreaker'
    | 'minigame'
    | 'snap'
    | 'ar_challenge'
    | 'irl_date'
    | 'social_exchange'
    | 'polite_departure'
    | 'call_log';
  attachmentUrl?: string;
  voiceDuration?: number; // duration in seconds
  voiceWaveform?: number[]; // normalized heights 0.1 to 1.0 for visual waveform
  gameData?: MiniGameData;
  snapData?: SelfDestructSnap;
  arChallengeData?: ARLensChallengeSession;
  irlDatePlan?: IrlDatePlan;
  socialExchange?: SocialExchange;
  departureDetails?: {
    templateId: string;
    title: string;
    reason: string;
    karmaAwarded: number;
  };
  callLog?: CallLogData;
  reactions?: MessageReaction[];
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: 'fake_profile' | 'harassment' | 'inappropriate_photos' | 'underage' | 'scam' | 'other';
  description: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userAge: number;
  submittedAt: string;
  selfiePose: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FilterOptions {
  ageRange: [number, number];
  maxDistanceKm: number;
  verifiedOnly: boolean;
  goalFilter: 'all' | RelationshipGoal;
  interests: string[];
}

export type Screen =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'profile_creation'
  | 'photo_upload'
  | 'discover'
  | 'soundwave'
  | 'snaps'
  | 'live'
  | 'matches'
  | 'chat'
  | 'user_profile'
  | 'safety'
  | 'admin';

export interface AiWingmanPrompt {
  id: string;
  headline: string;
  context: string;
  suggestedOpener: string;
  whyItWorks?: string;
  vibe: 'mutual_sparks' | 'playful' | 'deep' | 'creative' | 'bold';
}

export interface AiWingmanResponse {
  mutualAnalysis: string;
  sharedInterests: string[];
  topics: AiWingmanPrompt[];
  coachingTip?: string;
}

// ---------------------------------------------------------------------------
// Instant / Live Connections Types
// ---------------------------------------------------------------------------

export type LiveMediaMode = 'video' | 'audio' | 'photo';

export interface LiveReaction {
  id: string;
  emoji: string;
  sender: 'me' | 'partner';
  xOffset: number; // percentage (0 to 100)
}

export interface LiveRouletteSession {
  status: 'idle' | 'searching' | 'connected' | 'ended';
  partner: User | null;
  secondsRemaining: number;
  totalDuration: number;
  mediaMode: LiveMediaMode;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isPartnerAudioMuted: boolean;
  isPartnerVideoMuted: boolean;
  userLiked: boolean;
  partnerLiked: boolean;
  isMutualMatch: boolean;
  currentPromptIndex: number;
  reactions: LiveReaction[];
}

export type GoingNowCategory =
  | 'coffee'
  | 'bookstore'
  | 'drinks'
  | 'art'
  | 'outdoor'
  | 'music'
  | 'dining';

export interface GoingNowRsvp {
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'interested' | 'on_my_way' | 'here_now';
  etaMinutes?: number;
  customMessage?: string;
  createdAt: string;
}

export interface GoingNowBroadcast {
  id: string;
  userId: string;
  userName: string;
  userAge: number;
  userAvatar: string;
  userOccupation: string;
  isVerified: boolean;
  category: GoingNowCategory;
  venueName: string;
  neighborhood: string;
  distanceKm: number;
  photoUrl: string;
  note: string;
  createdAt: string;
  expiresAt: string;
  rsvps: GoingNowRsvp[];
  tags: string[];
}

export interface RapidPrompt {
  id: string;
  question: string;
  emoji: string;
  options: string[];
}

export interface RapidMatchState {
  id: string;
  partner: User;
  totalSeconds: number;
  secondsRemaining: number;
  currentPromptIndex: number;
  prompts: RapidPrompt[];
  userAnswers: Record<string, number>; // promptId -> optionIndex
  partnerAnswers: Record<string, number>;
  userSaved: boolean;
  partnerSaved: boolean;
  status: 'matching' | 'active' | 'saved' | 'expired';
  chatMessages: Array<{
    id: string;
    sender: 'me' | 'partner';
    text: string;
    timestamp: string;
  }>;
}

// ---------------------------------------------------------------------------
// The Sound-Wave Blind Date (Voice & Ambient Sync) Types
// ---------------------------------------------------------------------------

export type AmbientSyncTrack =
  | 'cafe_jazz'
  | 'rain_outside'
  | 'lofi_vinyl'
  | 'summer_crickets'
  | 'city_hum'
  | 'ocean_waves';

export interface SoundWaveProfile {
  id: string;
  userId: string;
  userName: string;
  userAge: number;
  userOccupation: string;
  isVerified: boolean;
  distanceKm: number;
  photoUrl: string;
  promptQuestion: string;
  promptAnswerTranscript: string;
  audioDurationSeconds: number; // e.g. 20
  waveform: number[]; // normalized heights 0.15 to 1.0
  ambientTrack: AmbientSyncTrack;
  ambientTrackLabel: string;
  ambientTrackEmoji: string;
  voiceCadenceLabel: string; // e.g. "Warm & Rhythmic", "Playful & Raspy", "Calm & Resonant"
  createdAt: string;
  voiceRepliesCount: number; // 0, 1, 2, 3+
  isUnlocked: boolean;
  hasListened: boolean;
}

export interface SoundWaveReply {
  id: string;
  profileId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  durationSeconds: number;
  waveform: number[];
  ambientTrack: AmbientSyncTrack;
  voiceNoteText?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Snap-Style Casual Interactions & AR Lens Challenges Types
// ---------------------------------------------------------------------------

export interface DualCameraVibe {
  id: string;
  userId: string;
  userName: string;
  userAge: number;
  userAvatar: string;
  isVerified: boolean;
  frontPhotoUrl: string; // selfie camera
  backPhotoUrl: string; // scene/what they are doing camera
  caption: string;
  locationTag: string; // e.g. "SoMa Roastery, SF"
  timeAgoLabel: string; // e.g. "12m ago"
  promptLabel: string; // e.g. "Right Now, Unfiltered", "Late Night Studio Grind"
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
}

export interface DoodlePoint {
  x: number;
  y: number;
}

export interface DoodlePath {
  color: string;
  strokeWidth: number;
  points: DoodlePoint[];
}

export interface SelfDestructSnap {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  mediaType: 'photo' | 'voice' | 'clip';
  mediaUrl: string;
  caption?: string;
  doodles?: DoodlePath[];
  stickerEmoji?: string;
  viewDurationSeconds: number; // e.g. 5s
  isOpened: boolean;
  hasExpired: boolean;
  canReplay: boolean;
  createdAt: string;
}

export type ARLensChallengeType = 'this_or_that' | 'guess_the_song' | 'two_truths_lie';

export interface ARThisOrThatQuestion {
  id: string;
  topic: string;
  optionLeft: { label: string; emoji: string };
  optionRight: { label: string; emoji: string };
}

export interface ARLensChallengeSession {
  id: string;
  type: ARLensChallengeType;
  title: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  currentRound: number;
  totalRounds: number;
  myChoice?: 'left' | 'right';
  partnerChoice?: 'left' | 'right';
  matchScore: number; // percentage
  status: 'active' | 'completed';
}

// ---------------------------------------------------------------------------
// The "Anti-Ghosting" Karma Engine & Active Chat Limit Types
// ---------------------------------------------------------------------------

export type KarmaBadgeType =
  | 'prompt_responder'
  | 'verified_show_up'
  | 'zero_ghost_karma'
  | 'intentional_dater';

export interface KarmaBadgeInfo {
  type: KarmaBadgeType;
  label: string;
  emoji: string;
  shortTag: string;
  description: string;
  color: string;
}

export interface UserKarmaProfile {
  score: number; // 0 - 100
  tierName: 'Spotlight Emerald' | 'Gold Standard' | 'Rising Star' | 'Building Karma';
  badges: KarmaBadgeType[];
  activeChatCount: number; // 0 to 3
  maxActiveChats: number; // 3
  responseRatePercent: number; // e.g. 96%
  avgResponseMinutes: number; // e.g. 14 min
  ghostFreeStreakDays: number;
  irlDatesCompleted: number;
  socialsExchanged: number;
  politeDeparturesSent: number;
  feedBoostMultiplier: number; // e.g. 1.25x for scores > 90
}

export interface IrlDatePlan {
  id: string;
  matchId: string;
  proposedByUserId: string;
  venueName: string;
  neighborhood: string;
  activityType: 'coffee' | 'drinks' | 'gallery' | 'dinner' | 'park_walk';
  dateTime: string;
  note?: string;
  status: 'proposed' | 'accepted' | 'completed';
  createdAt: string;
}

export interface SocialExchange {
  id: string;
  matchId: string;
  initiatedByUserId: string;
  platforms: Array<{
    platform: 'instagram' | 'whatsapp' | 'phone' | 'linkedin';
    handle: string;
  }>;
  graduatedAt: string;
}

export interface PoliteDepartureTemplate {
  id: string;
  title: string;
  emoji: string;
  messageText: string;
  karmaBonus: number;
  category: 'romantic_spark' | 'timing_priorities' | 'friendship_only' | 'connection_found';
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'outgoing' | 'incoming' | 'connected' | 'ended';

export interface CallLogData {
  callId: string;
  type: CallType;
  status: 'completed' | 'missed' | 'declined';
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
}

export interface CallReaction {
  id: string;
  emoji: string;
  x: number; // percentage across screen 0-100
}

export interface CallSession {
  id: string;
  partnerId: string;
  partner: User;
  type: CallType;
  status: CallStatus;
  startedAt?: number;
  durationSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isCameraFront: boolean;
  isMinimized: boolean;
  reactions: CallReaction[];
}






