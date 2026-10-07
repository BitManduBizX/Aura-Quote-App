import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 1. Lightweight health check route before heavy middleware
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'AuraQuote', timestamp: new Date().toISOString() });
});

app.use(express.json({ limit: '2mb' }));

// Helper to initialize Gemini client on demand
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
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
}

// Curated scholarly fallback engine when API key is not configured or network is unavailable
function buildFallbackExploration(prompt: string, quoteContext?: { text?: string; author?: string; origin?: string }) {
  const cleanPrompt = (prompt || '').trim();
  if (quoteContext?.text) {
    return {
      analysis: `In "${quoteContext.text}", ${quoteContext.author || 'the author'} distills a perennial tension between external circumstance and internal sovereignty. Rooted in ${quoteContext.origin || 'classical philosophical tradition'}, this aphorism invites the reader to shift from reactive urgency to deliberate presence.`,
      historicalContext: `Historically, statements of this caliber emerged during periods of cultural transition—where thinkers sought durable inner frameworks that could survive political or personal upheaval. Its enduring resonance lies in its structural economy: every clause strips away ornament to reveal an actionable ethic.`,
      crossCulturalParallels: [
        `Stoic Philosophy (Marcus Aurelius, Meditations IV.3): "People look for retreats for themselves, in the country, by the coast, or in the hills... Nowhere can a person find a more peaceful and trouble-free retreat than in their own mind."`,
        `Japanese Aesthetics (Wabi-Sabi & Mono no Aware): Recognizing the quiet dignity of impermanence and finding completeness within restraint.`,
        `Ubuntu Ethic (Southern Africa): "Umuntu ngumuntu ngabantu" — grounding individual wisdom within shared human reciprocity.`
      ],
      reflectionQuestions: [
        `Where in your current week are you mistaking movement for meaningful direction?`,
        `If you applied this principle to your hardest conversation today, what would you leave unsaid?`,
        `What habit would change if you treated this aphorism as an operating constraint for thirty days?`
      ],
      applicationDrafts: {
        socialCaption: `"${quoteContext.text}" — ${quoteContext.author || 'Archival Wisdom'}\n\nPause before the next rush. Clarity rarely announces itself in noise. #DeepMeaning #ProfoundWisdom #AuraQuote`,
        executiveNote: `Team — As we enter this next phase, let's anchor on a simple principle from ${quoteContext.author || 'classical wisdom'}: "${quoteContext.text}" Let us prioritize depth and deliberate execution over sheer velocity.`
      }
    };
  }

  return {
    analysis: `Your inquiry regarding "${cleanPrompt || 'timeless resilience and purposeful living'}" touches the core of comparative philosophy. Across Stoic, East Asian, and modern existential traditions, enduring success is never framed as the absence of friction, but as the refinement of character through deliberate friction.`,
    historicalContext: `From Seneca's Epistles in first-century Rome to 20th-century letters written by changemakers and poets, wisdom literature consistently warns against dispersing one's attention across trivial anxieties. True agency begins where performative busyness ends.`,
    crossCulturalParallels: [
      `Classical Greek (Heraclitus): "Character is destiny (Ethos anthropoi daimon)" — our habitual choices sculpt our fate.`,
      `Persian Poetic Tradition (Rumi): "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself."`,
      `Nordic Folk Wisdom: "Den somกัน hvisker, lyver ikke" — quiet steadiness outlasts loud proclamations.`
    ],
    reflectionQuestions: [
      `What single commitment, if honored without compromise today, would make the rest of your noise irrelevant?`,
      `Are you measuring your progress by applause or by internal alignment?`,
      `Who in your community benefits when you choose steadiness over haste?`
    ],
    applicationDrafts: {
      socialCaption: `Quiet discipline outlasts loud intention. Build what endures when no one is watching. #UniqueLifeQuotes #ProfoundWisdom #StatusInEnglish`,
      executiveNote: `A brief reflection for the week ahead: sustainable leadership is built in the quiet intervals where we choose integrity over expedience.`
    }
  };
}

function buildFallbackGeneratedQuotes(topic: string, tone: string, occasion: string) {
  const subject = (topic || 'purpose and perseverance').trim();
  const style = (tone || 'Philosophical & Poetic').trim();
  const context = (occasion || 'Personal Reflection').trim();

  return [
    {
      text: `We do not inherit clarity regarding ${subject.toLowerCase()}; we carve it out of daily discipline when applause is absent.`,
      author: `AuraQuote Curatorial Synthesis (${style})`,
      category: 'Life',
      subCategory: 'Deep & Thought-Provoking',
      origin: `Crafted for ${context}`,
      backstory: `Synthesized in the monochrome editorial tradition, balancing classical aphoristic symmetry with contemporary introspection on ${subject.toLowerCase()}.`,
      tags: ['#UniqueLifeQuotes', '#DeepMeaning', '#ProfoundWisdom'],
      emojiVibe: '⚡'
    },
    {
      text: `Measure your altitude not by the noise of the summit, but by the steadiness of your breath on the climb.`,
      author: `AuraQuote Curatorial Synthesis (${style})`,
      category: 'Success',
      subCategory: 'Perseverance',
      origin: `Crafted for ${context}`,
      backstory: `Inspired by mountaineering journals and Stoic meditations on endurance, tailored for ${context.toLowerCase()}.`,
      tags: ['#StatusInEnglish', '#2LineStatus', '#InstagramCaptions'],
      emojiVibe: '🏔️'
    },
    {
      text: `A single lamp lit in good faith dispels more hesitation than a thousand debates about the dark.`,
      author: `AuraQuote Curatorial Synthesis (${style})`,
      category: 'Leadership',
      subCategory: 'Motivational Quotes for Changemakers',
      origin: `Crafted for ${context}`,
      backstory: `A tribute to civic courage, community builders, and quiet changemakers advancing ${subject.toLowerCase()}.`,
      tags: ['#ProfoundWisdom', '#VeryShortQuotes', '#UniqueLifeQuotes'],
      emojiVibe: '🌟'
    }
  ];
}

// 2. Gemini API Endpoint: Deep Wisdom & Quote Explorer
app.post('/api/gemini/explore', async (req, res) => {
  const { prompt, quoteContext } = req.body || {};
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      ok: true,
      mode: 'curated-archive',
      data: buildFallbackExploration(prompt, quoteContext),
    });
  }

  try {
    const contextStr = quoteContext?.text
      ? `Selected Quote: "${quoteContext.text}" by ${quoteContext.author || 'Unknown'} (Origin/Context: ${quoteContext.origin || 'Classical'}). `
      : '';

    const fullPrompt = `${contextStr}User Inquiry: ${prompt || 'Analyze the deeper philosophical meaning, historical provenance, cross-cultural parallels, and practical application of this wisdom.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction:
          'You are the Chief Literary Curator and Philosophical Historian for AuraQuote (MonochromeWisdom). Provide rigorous, eloquent, historically grounded analysis of quotes, aphorisms, and wisdom traditions across cultures. Avoid clichés. Return structured JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.STRING,
              description: 'Deep philosophical and literary interpretation (2-3 sentences).',
            },
            historicalContext: {
              type: Type.STRING,
              description: 'Accurate historical provenance, author context, and era background.',
            },
            crossCulturalParallels: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 parallel quotes or concepts from diverse world cultures or philosophies.',
            },
            reflectionQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 incisive personal reflection questions for daily journaling.',
            },
            applicationDrafts: {
              type: Type.OBJECT,
              properties: {
                socialCaption: {
                  type: Type.STRING,
                  description: 'A ready-to-share social media caption with hashtags.',
                },
                executiveNote: {
                  type: Type.STRING,
                  description: 'A refined paragraph suitable for a leadership email, keynote, or newsletter.',
                },
              },
              required: ['socialCaption', 'executiveNote'],
            },
          },
          required: [
            'analysis',
            'historicalContext',
            'crossCulturalParallels',
            'reflectionQuestions',
            'applicationDrafts',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(rawText.trim());
    return res.json({
      ok: true,
      mode: 'gemini-live',
      data: parsed,
    });
  } catch (error) {
    console.error('Gemini explore error, serving graceful fallback:', error);
    return res.json({
      ok: true,
      mode: 'curated-archive',
      data: buildFallbackExploration(prompt, quoteContext),
    });
  }
});

// 3. Gemini API Endpoint: Custom Quote & Campaign Synthesizer
app.post('/api/gemini/generate', async (req, res) => {
  const { topic, tone, occasion, culture } = req.body || {};
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      ok: true,
      mode: 'curated-archive',
      quotes: buildFallbackGeneratedQuotes(topic, tone, occasion),
    });
  }

  try {
    const prompt = `Generate 3 original, museum-grade aphorisms or quotes tailored to:
- Topic / Theme: ${topic || 'Resilience and Meaningful Work'}
- Tone / Style: ${tone || 'Stoic & Minimalist'}
- Occasion / Use Case: ${occasion || 'Daily Reflection & Social Status'}
- Cultural Lens / Tradition Inspiration: ${culture || 'Universal World Philosophy'}

Make each quote memorable, rhythmic, and free of generic clichés. Include a rich backstory and relevant tags from: #UniqueLifeQuotes, #DeepMeaning, #InstagramCaptions, #StatusInEnglish, #VeryShortQuotes, #2LineStatus, #ProfoundWisdom.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an aphorist and literary curator for AuraQuote. Compose deeply resonant, high-contrast literary quotes and provide cultural context.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'The quote text itself.' },
              author: {
                type: Type.STRING,
                description: 'Attribution or tradition synthesis label.',
              },
              category: {
                type: Type.STRING,
                description: 'Primary category (e.g., Life, Success, Motivation, Leadership, Love, World Quotes).',
              },
              subCategory: {
                type: Type.STRING,
                description: 'Nuanced sub-category (e.g., Deep & Thought-Provoking, Short Quotes, Perseverance).',
              },
              origin: {
                type: Type.STRING,
                description: 'Cultural or philosophical lineage.',
              },
              backstory: {
                type: Type.STRING,
                description: '2-sentence explanation of the imagery and philosophical weight.',
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 hashtags.',
              },
              emojiVibe: {
                type: Type.STRING,
                description: 'One matching emoji from 💬, 💪, 🌟, ☀️, 💛, ⚡, 🙏, 🤝, 👑, 🙌, 🔥, 🫶, 💙, 🎉.',
              },
            },
            required: ['text', 'author', 'category', 'subCategory', 'origin', 'backstory', 'tags', 'emojiVibe'],
          },
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(rawText.trim());
    return res.json({
      ok: true,
      mode: 'gemini-live',
      quotes: Array.isArray(parsed) ? parsed : buildFallbackGeneratedQuotes(topic, tone, occasion),
    });
  } catch (error) {
    console.error('Gemini generate error, serving graceful fallback:', error);
    return res.json({
      ok: true,
      mode: 'curated-archive',
      quotes: buildFallbackGeneratedQuotes(topic, tone, occasion),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraQuote server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
