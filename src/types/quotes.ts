export type TopicCategory =
  | 'All'
  | 'Life'
  | 'Success'
  | 'Motivation'
  | 'Leadership'
  | 'Love'
  | 'Movies'
  | 'Authors'
  | 'World Quotes'
  | 'Cultural & Multilingual';

export type SubCategory =
  | 'All'
  | 'Short Quotes'
  | 'Good Quotes'
  | 'Cute Quotes'
  | 'Deep & Thought-Provoking'
  | 'Profound & Rare Quotes'
  | 'Motivational Quotes for Changemakers'
  | 'Perseverance'
  | 'Community'
  | 'Giving Tuesday'
  | 'Fundraising/Donation'
  | 'Kindness'
  | 'Gratitude'
  | 'Teamwork';

export type QuoteTag =
  | '#UniqueLifeQuotes'
  | '#DeepMeaning'
  | '#InstagramCaptions'
  | '#StatusInEnglish'
  | '#VeryShortQuotes'
  | '#2LineStatus'
  | '#ProfoundWisdom';

export type EmojiVibe =
  | '💬'
  | '💪'
  | '🌟'
  | '☀️'
  | '💛'
  | '⚡'
  | '🙏'
  | '🤝'
  | '👑'
  | '🙌'
  | '🔥'
  | '🫶'
  | '💙'
  | '🎉';

export interface EmojiVibeMeta {
  emoji: EmojiVibe;
  label: string;
  moodDescription: string;
}

export interface QuoteItem {
  id: string;
  accessionNumber: string;
  text: string;
  originalScript?: string;
  transliteration?: string;
  language?: string;
  author: string;
  authorRole: string;
  era: string;
  category: Exclude<TopicCategory, 'All'>;
  subCategory: Exclude<SubCategory, 'All'>;
  tags: QuoteTag[];
  emojiVibe: EmojiVibe;
  originLocation: string;
  backstory: string;
}

export interface SavedQuoteItem {
  quote: QuoteItem;
  savedAt: string;
  collectionName: 'Personal Manifesto' | 'Leadership & Keynote' | 'Social Captions' | 'Morning Reflections';
  personalNote?: string;
}

export type CanvasThemeId = 'pitch-black' | 'charcoal-graphite' | 'pure-stark' | 'archival-paper' | 'silver-mist' | 'obsidian-gold';
export type CanvasAspectRatio = '1:1' | '9:16' | '4:5' | '16:9';
export type CanvasFontStyle = 'serif' | 'sans' | 'mono' | 'italic-serif';
export type CanvasAlignment = 'left' | 'center';

export interface CanvasConfig {
  quoteText: string;
  authorText: string;
  originSubtext: string;
  themeId: CanvasThemeId;
  aspectRatio: CanvasAspectRatio;
  fontStyle: CanvasFontStyle;
  alignment: CanvasAlignment;
  fontSizeScale: number;
  showFrameBorder: boolean;
  showWatermark: boolean;
  watermarkText: string;
  showNoiseTexture: boolean;
}

export type PermissionKey = 'localStorage' | 'clipboard' | 'canvasExport';

export interface UserPermissions {
  localStorage: boolean;
  clipboard: boolean;
  canvasExport: boolean;
}

export interface PendingConsentAction {
  permission: PermissionKey;
  title: string;
  description: string;
  technicalNote: string;
  onConfirm: () => void;
}

export interface AIExplorationResult {
  analysis: string;
  historicalContext: string;
  crossCulturalParallels: string[];
  reflectionQuestions: string[];
  applicationDrafts: {
    socialCaption: string;
    executiveNote: string;
  };
}
