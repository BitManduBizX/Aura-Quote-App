import { AIExplorationResult, QuoteItem, QuoteTag, SubCategory, TopicCategory, EmojiVibe } from '../types/quotes';

// Securely read Gemini API key from environment variables with fallback
export const getGeminiApiKey = (): string => {
  const viteKey = import.meta.env?.VITE_GEMINI_API_KEY as string | undefined;
  const standardKey = import.meta.env?.GEMINI_API_KEY as string | undefined;
  const key = (viteKey || standardKey || '').trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return '';
  }
  return key;
};

// Client-side structured fallback generator for static deployments & network resilience
export function getLocalFallbackExploration(
  prompt: string,
  quoteContext?: { text?: string; author?: string; origin?: string }
): AIExplorationResult {
  if (quoteContext?.text) {
    return {
      analysis: `In "${quoteContext.text}", ${quoteContext.author || 'the author'} distills a perennial tension between external circumstance and internal sovereignty. Rooted in ${quoteContext.origin || 'classical philosophical tradition'}, this aphorism invites the reader to shift from reactive urgency to deliberate presence.`,
      historicalContext: `Historically, statements of this caliber emerged during periods of cultural transition—where thinkers sought durable inner frameworks that could survive political or personal upheaval. Its enduring resonance lies in its structural economy: every clause strips away ornament to reveal an actionable ethic.`,
      crossCulturalParallels: [
        `Stoic Philosophy (Marcus Aurelius, Meditations IV.3): "Nowhere can a person find a more peaceful and trouble-free retreat than in their own mind."`,
        `Japanese Aesthetics (Wabi-Sabi & Mono no Aware): Finding quiet completeness within restraint and impermanence.`,
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
    analysis: `Your inquiry regarding "${prompt || 'timeless resilience and purposeful living'}" touches the core of comparative philosophy. Across Stoic, East Asian, and modern existential traditions, enduring success is never framed as the absence of friction, but as the refinement of character through deliberate friction.`,
    historicalContext: `From Seneca's Epistles in first-century Rome to 20th-century letters written by changemakers and poets, wisdom literature consistently warns against dispersing one's attention across trivial anxieties. True agency begins where performative busyness ends.`,
    crossCulturalParallels: [
      `Classical Greek (Heraclitus): "Character is destiny (Ethos anthropoi daimon)" — our habitual choices sculpt our fate.`,
      `Persian Poetic Tradition (Rumi): "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself."`,
      `Nordic Folk Wisdom: "Den som hvisker, lyver ikke" — quiet steadiness outlasts loud proclamations.`
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

export function getLocalFallbackGeneratedQuotes(
  topic: string,
  tone: string,
  occasion: string
): QuoteItem[] {
  const subject = (topic || 'purpose and perseverance').trim();
  const style = (tone || 'Philosophical & Poetic').trim();
  const context = (occasion || 'Personal Reflection').trim();
  const now = Date.now();

  return [
    {
      id: `fallback-${now}-1`,
      accessionNumber: 'AQ · AI-1',
      text: `We do not inherit clarity regarding ${subject.toLowerCase()}; we carve it out of daily discipline when applause is absent.`,
      author: `AuraQuote Curatorial Synthesis (${style})`,
      authorRole: `${style} · ${context}`,
      era: 'Contemporary Synthesis',
      category: 'Life',
      subCategory: 'Deep & Thought-Provoking',
      originLocation: `Crafted for ${context}`,
      backstory: `Synthesized in the monochrome editorial tradition, balancing classical aphoristic symmetry with contemporary introspection on ${subject.toLowerCase()}.`,
      tags: ['#UniqueLifeQuotes', '#DeepMeaning', '#ProfoundWisdom'],
      emojiVibe: '⚡'
    },
    {
      id: `fallback-${now}-2`,
      accessionNumber: 'AQ · AI-2',
      text: `Measure your altitude not by the noise of the summit, but by the steadiness of your breath on the climb.`,
      author: `AuraQuote Curatorial Synthesis (${style})`,
      authorRole: `${style} · ${context}`,
      era: 'Contemporary Synthesis',
      category: 'Success',
      subCategory: 'Perseverance',
      originLocation: `Crafted for ${context}`,
      backstory: `Inspired by mountaineering journals and Stoic meditations on endurance, tailored for ${context.toLowerCase()}.`,
      tags: ['#StatusInEnglish', '#2LineStatus', '#InstagramCaptions'],
      emojiVibe: '💪'
    },
    {
      id: `fallback-${now}-3`,
      accessionNumber: 'AQ · AI-3',
      text: `A single lamp lit in good faith dispels more hesitation than a thousand debates about the dark.`,
      author: `AuraQuote Curatorial Synthesis (${style})`,
      authorRole: `${style} · ${context}`,
      era: 'Contemporary Synthesis',
      category: 'Leadership',
      subCategory: 'Motivational Quotes for Changemakers',
      originLocation: `Crafted for ${context}`,
      backstory: `A tribute to civic courage, community builders, and quiet changemakers advancing ${subject.toLowerCase()}.`,
      tags: ['#ProfoundWisdom', '#VeryShortQuotes', '#UniqueLifeQuotes'],
      emojiVibe: '🌟'
    }
  ];
}

// Unified explore API caller
export async function exploreWisdom(
  prompt: string,
  quoteContext?: { text?: string; author?: string; origin?: string }
): Promise<AIExplorationResult> {
  try {
    const response = await fetch('/api/gemini/explore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, quoteContext }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json?.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/gemini/explore unavailable or offline, activating fallback:', err);
  }

  // Graceful client fallback ensures zero blank screens or errors
  return getLocalFallbackExploration(prompt, quoteContext);
}

// Unified generate API caller
export async function synthesizeQuotes(params: {
  topic: string;
  tone: string;
  occasion: string;
  culture: string;
}): Promise<QuoteItem[]> {
  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const json = await response.json();
      if (Array.isArray(json?.quotes) && json.quotes.length > 0) {
        return json.quotes.map((q: Record<string, unknown>, idx: number) => ({
          id: `ai-gen-${Date.now()}-${idx}`,
          accessionNumber: `AQ · AI-${idx + 1}`,
          text: String(q?.text || ''),
          author: String(q?.author || 'AuraQuote Curatorial Synthesis'),
          authorRole: `${params.tone} · ${params.culture}`,
          era: 'Contemporary Synthesis',
          category: (q?.category as Exclude<TopicCategory, 'All'>) || 'Life',
          subCategory: (q?.subCategory as Exclude<SubCategory, 'All'>) || 'Deep & Thought-Provoking',
          tags: (Array.isArray(q?.tags) ? q.tags : ['#UniqueLifeQuotes', '#ProfoundWisdom']) as QuoteTag[],
          emojiVibe: (q?.emojiVibe as EmojiVibe) || '⚡',
          originLocation: String(q?.origin || params.occasion),
          backstory: String(q?.backstory || ''),
        }));
      }
    }
  } catch (err) {
    console.warn('Backend /api/gemini/generate unavailable or offline, activating fallback:', err);
  }

  return getLocalFallbackGeneratedQuotes(params.topic, params.tone, params.occasion);
}
