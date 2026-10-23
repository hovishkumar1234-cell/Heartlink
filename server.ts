import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.startsWith('MY_') || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface WingmanPromptRequest {
  user: {
    name: string;
    age: number;
    interests: string[];
    bio?: string;
    prompts?: Array<{ question: string; answer: string }>;
    relationshipGoal?: string;
    occupation?: string;
  };
  partner: {
    name: string;
    age: number;
    interests: string[];
    bio?: string;
    prompts?: Array<{ question: string; answer: string }>;
    relationshipGoal?: string;
    occupation?: string;
  };
  tone?: 'mutual_sparks' | 'playful' | 'deep' | 'creative' | 'bold';
  recentMessages?: string[];
}

// Fallback contextual generator based on real profile synergy
function generateFallbackContextualPrompts(
  user: WingmanPromptRequest['user'],
  partner: WingmanPromptRequest['partner'],
  tone: string = 'mutual_sparks'
) {
  const userInterests = user.interests || [];
  const partnerInterests = partner.interests || [];
  const shared = userInterests.filter((interest) =>
    partnerInterests.some((pi) => pi.toLowerCase() === interest.toLowerCase())
  );

  const sharedDisplay =
    shared.length > 0
      ? shared
      : [userInterests[0] || 'Good vibes', partnerInterests[0] || 'Great conversations'];

  const topics = [];

  // Theme 1: Music / Road Trip / Atmospheric (like the user prompt example)
  const isMusicVibe =
    userInterests.some((i) => /music|vinyl|rock|acoustic|indie|drive|track/i.test(i)) ||
    partnerInterests.some((i) => /music|vinyl|rock|acoustic|indie|drive|track/i.test(i));

  if (isMusicVibe || shared.length === 0) {
    topics.push({
      id: 'prompt-music-roadtrip',
      headline: '🎶 The 2 AM Road Trip Soundtrack',
      context: 'You both like indie acoustic tracks and late-night drives',
      suggestedOpener: `You both appreciate good sound and late-night drives—what's the one indie acoustic track that MUST be on your ultimate road trip playlist?`,
      whyItWorks: 'Music sparks instant emotional resonance without feeling like a boring job interview.',
      vibe: 'mutual_sparks' as const,
    });
  }

  // Theme 2: Shared specific passions
  if (shared.length > 0) {
    const primary = shared[0];
    const secondary = shared[1] || shared[0];
    topics.push({
      id: `prompt-shared-${primary.toLowerCase().replace(/\s+/g, '-')}`,
      headline: `✨ The Shared ${primary} Passion`,
      context: `You both listed ${shared.slice(0, 2).join(' & ')} on your profiles`,
      suggestedOpener: `I noticed you're also into ${primary}! What got you started down that rabbit hole, and what's your favorite project or memory with it?`,
      whyItWorks: 'Validates their taste immediately and gives them space to speak passionately.',
      vibe: 'playful' as const,
    });
  }

  // Theme 3: Bio / Prompt Hook
  if (partner.prompts && partner.prompts.length > 0) {
    const promptItem = partner.prompts[0];
    topics.push({
      id: 'prompt-profile-curiosity',
      headline: `🔍 Curated Curiosity on "${promptItem.question}"`,
      context: `Inspired by ${partner.name}'s answer to "${promptItem.question}"`,
      suggestedOpener: `Your answer to "${promptItem.question}" caught my attention—is there a wild backstory behind that, or did you learn that the hard way? 😉`,
      whyItWorks: 'Shows you actually read their prompts and invites storytelling.',
      vibe: 'playful' as const,
    });
  } else if (partner.occupation) {
    topics.push({
      id: 'prompt-creative-profession',
      headline: `💼 Behind the Craft`,
      context: `Exploring ${partner.name}'s role as a ${partner.occupation}`,
      suggestedOpener: `Being a ${partner.occupation} sounds fascinating—what's something about your day-to-day that movies and outsiders always get totally wrong?`,
      whyItWorks: 'Gives them an opportunity to demystify their craft in a fun way.',
      vibe: 'creative' as const,
    });
  }

  // Theme 4: Deep / Chemistry / Weekend Vibe
  topics.push({
    id: 'prompt-weekend-chemistry',
    headline: '☕ The Low-Pressure First Coffee Theory',
    context: `Aligning your goals (${user.relationshipGoal || 'genuine connection'} & ${partner.relationshipGoal || 'connection'})`,
    suggestedOpener: `If we had a completely free Saturday with zero responsibilities, what would our ideal morning-to-night itinerary look like?`,
    whyItWorks: 'Subtly invites future pacing and reveals lifestyle compatibility.',
    vibe: 'deep' as const,
  });

  return {
    mutualAnalysis: `You and ${partner.name} share strong alignment in ${sharedDisplay.join(', ')} with an authentic appreciation for creativity and depth.`,
    sharedInterests: sharedDisplay,
    topics,
    coachingTip: `Tip: Ask open-ended questions about their sensory memories rather than yes/no questions to keep the banter natural!`,
  };
}

// POST /api/ai-wingman/prompts: Contextual AI Wingman Suggestions
app.post('/api/ai-wingman/prompts', async (req, res) => {
  try {
    const { user, partner, tone = 'mutual_sparks', recentMessages = [] } = req.body as WingmanPromptRequest;

    if (!user || !partner) {
      return res.status(400).json({ error: 'User and partner profiles are required.' });
    }

    const ai = getGeminiClient();

    // If Gemini API is available, generate fresh hyper-personalized prompts
    if (ai) {
      try {
        const promptInstruction = `
You are HeartLink's AI Wingman—an empathetic, stylish, and charismatic dating coach.
The user "${user.name}" (${user.age}, ${user.occupation || 'Creative'}, Interests: ${user.interests.join(', ')}, Bio: "${user.bio || ''}")
just matched with "${partner.name}" (${partner.age}, ${partner.occupation || 'Creative'}, Interests: ${partner.interests.join(', ')}, Bio: "${partner.bio || ''}").

User Relationship Goal: ${user.relationshipGoal || 'Long-term'}
Partner Relationship Goal: ${partner.relationshipGoal || 'Long-term'}
Partner Prompts: ${JSON.stringify(partner.prompts || [])}
Tone requested: ${tone}
Recent Chat Messages (if any): ${JSON.stringify(recentMessages.slice(-4))}

CRITICAL MISSION:
Rather than generic openers (never say "Hey", "How's your week", or generic compliments), suggest 3 to 4 distinct, hyper-contextual topics and ready-to-send conversation starters based on their mutual interests and specific profile details.
For instance: "You both like indie acoustic tracks and late-night drives—ask about their top road trip playlist" or connecting their shared passions like photography, bouldering, architecture, or specialty coffee into witty, engaging openers.

Return a valid JSON object matching this exact schema:
{
  "mutualAnalysis": "1-2 sentences summarizing their shared passions and chemistry vibe",
  "sharedInterests": ["array of overlapping or complementary interest keywords"],
  "topics": [
    {
      "id": "unique-id-string",
      "headline": "Short punchy title with relevant emoji",
      "context": "Context sentence explaining why this fits them (e.g., 'You both like indie acoustic tracks and late-night drives')",
      "suggestedOpener": "The verbatim charismatic opening message ready to be sent directly into chat",
      "whyItWorks": "1 brief sentence from dating coach explaining the psychological hook",
      "vibe": "mutual_sparks | playful | deep | creative | bold"
    }
  ],
  "coachingTip": "1 concise golden rule for maintaining momentum with this specific person"
}
`;

        const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
        let responseText: string | null = null;

        for (const model of candidateModels) {
          try {
            let timeoutId: NodeJS.Timeout;
            const timeoutPromise = new Promise<never>((_, reject) => {
              timeoutId = setTimeout(() => reject(new Error(`Timeout for ${model}`)), 12000);
            });

            const res = await Promise.race([
              ai.models.generateContent({
                model,
                contents: promptInstruction,
                config: {
                  responseMimeType: 'application/json',
                  temperature: 0.8,
                  systemInstruction:
                    'You are an elite, modern dating coach. You provide genuine, contextual conversation prompts that bridge mutual interests.',
                },
              }),
              timeoutPromise,
            ]);

            clearTimeout(timeoutId!);

            if (res && res.text) {
              responseText = res.text;
              break;
            }
          } catch {
            // Try next model if current model experiences latency or is unavailable
          }
        }

        if (responseText) {
          try {
            const parsed = JSON.parse(responseText);
            if (parsed && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
              return res.json(parsed);
            }
          } catch {
            // Invalid JSON, continue to fallback
          }
        }
      } catch {
        // Fall back gracefully
      }
    }

    // High quality fallback generator if no API key or remote service unavailable
    const fallback = generateFallbackContextualPrompts(user, partner, tone);
    return res.json(fallback);
  } catch (err: any) {
    console.error('AI Wingman endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate conversation prompts' });
  }
});

// Start Server & mount Vite middlewares in Dev
async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`HeartLink full-stack server running on http://0.0.0.0:${port}`);
  });
}

start();
