import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Bookmark,
  Copy,
  Check,
  Palette,
  Compass,
  BookOpen,
  ShieldCheck,
  X,
  RotateCcw,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  CURATED_QUOTES,
  EMOJI_VIBES,
  QUOTE_TAGS,
  SUB_CATEGORIES,
  TOPIC_CATEGORIES,
} from './data/quotesData';
import {
  EmojiVibe,
  PendingConsentAction,
  PermissionKey,
  QuoteItem,
  QuoteTag,
  SavedQuoteItem,
  SubCategory,
  TopicCategory,
  UserPermissions,
} from './types/quotes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConsentModal, PermissionsManagerModal } from './components/ConsentModal';
import { QuoteOfTheDay } from './components/QuoteOfTheDay';
import { StudioCanvasSection } from './components/StudioCanvasSection';
import { CuratorAISection } from './components/CuratorAISection';
import { SavedVaultSection } from './components/SavedVaultSection';
import { FaqSection } from './components/FaqSection';

const STORAGE_VAULT_KEY = 'auraquote_saved_vault_v1';
const STORAGE_PERMS_KEY = 'auraquote_user_permissions_v1';

export function App() {
  // Archive Filter States
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory>('All');
  const [selectedTag, setSelectedTag] = useState<QuoteTag | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiVibe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'curated' | 'shortest' | 'deepest'>('curated');
  const [expandedBackstoryIds, setExpandedBackstoryIds] = useState<Record<string, boolean>>({});

  // Studio & AI Active Quote Selection
  const [canvasQuote, setCanvasQuote] = useState<QuoteItem>(CURATED_QUOTES[0]);
  const [aiQuote, setAiQuote] = useState<QuoteItem | null>(CURATED_QUOTES[0]);

  // User Consent & Permissions State
  const [permissions, setPermissions] = useState<UserPermissions>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_PERMS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          localStorage: Boolean(parsed?.localStorage),
          clipboard: Boolean(parsed?.clipboard),
          canvasExport: Boolean(parsed?.canvasExport),
        };
      }
    } catch {
      // ignore read errors
    }
    return {
      localStorage: false,
      clipboard: false,
      canvasExport: false,
    };
  });

  const [pendingConsent, setPendingConsent] = useState<PendingConsentAction | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Saved Vault Items
  const [savedItems, setSavedItems] = useState<SavedQuoteItem[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_VAULT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore read errors
    }
    // Pre-populate 2 starter monograph items in memory until user saves/modifies
    return [
      {
        quote: CURATED_QUOTES[0],
        savedAt: new Date().toISOString(),
        collectionName: 'Personal Manifesto',
        personalNote: 'Anchor for daily focus—act rather than debate.',
      },
      {
        quote: CURATED_QUOTES[7],
        savedAt: new Date().toISOString(),
        collectionName: 'Morning Reflections',
        personalNote: 'Camus on maintaining inner warmth during difficult seasons.',
      },
    ];
  });

  // Feedback Toast & Copy States
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Persist saved vault when localStorage permission is granted
  useEffect(() => {
    if (permissions.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_VAULT_KEY, JSON.stringify(savedItems));
      } catch (e) {
        console.error('Failed to write vault to localStorage:', e);
      }
    }
  }, [savedItems, permissions.localStorage]);

  // Persist permission choices if any permission is granted
  const updatePermissions = (next: UserPermissions) => {
    setPermissions(next);
    try {
      window.localStorage.setItem(STORAGE_PERMS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Helper to gate actions behind explicit user consent modal
  const requirePermission = (
    key: PermissionKey,
    title: string,
    description: string,
    technicalNote: string,
    action: () => void
  ) => {
    if (permissions[key]) {
      action();
      return;
    }
    setPendingConsent({
      permission: key,
      title,
      description,
      technicalNote,
      onConfirm: () => {
        const updated = { ...permissions, [key]: true };
        updatePermissions(updated);
        setPendingConsent(null);
        action();
      },
    });
  };

  // Protected Action Handlers
  const handleCopyQuote = (quote: QuoteItem) => {
    const formatted = `“${quote.text}” — ${quote.author} ${quote.emojiVibe}\n(${quote.originLocation} · AuraQuote)`;
    requirePermission(
      'clipboard',
      'Copy Quote to System Clipboard',
      `Grant permission to copy "${quote.text.slice(0, 50)}..." with attribution and emoji signature to your clipboard.`,
      'AuraQuote writes only the selected quote text to navigator.clipboard on your explicit click and never reads your clipboard.',
      () => {
        navigator.clipboard?.writeText(formatted).catch(() => {});
        setCopiedQuoteId(quote.id);
        setTimeout(() => setCopiedQuoteId(null), 2000);
        showToast('Quote & attribution copied to clipboard');
      }
    );
  };

  const handleCopyPlainText = (text: string) => {
    requirePermission(
      'clipboard',
      'Copy Text to System Clipboard',
      'Grant permission to copy this curated text to your system clipboard.',
      'AuraQuote writes only the selected text to navigator.clipboard and never reads your clipboard.',
      () => {
        navigator.clipboard?.writeText(text).catch(() => {});
        showToast('Copied to clipboard');
      }
    );
  };

  const handleSaveQuoteToVault = (quote: QuoteItem, note?: string) => {
    requirePermission(
      'localStorage',
      'Save to Browser LocalStorage Vault',
      `Allow AuraQuote to store "${quote.author}" and your personal reflections inside your browser's local storage vault.`,
      'All saved quotes and reflection notes remain strictly on your device in window.localStorage. Nothing is uploaded to external cloud databases.',
      () => {
        setSavedItems((prev) => {
          const exists = prev.some((item) => item.quote.id === quote.id);
          if (exists && !note) {
            showToast('Removed from Saved Vault');
            return prev.filter((item) => item.quote.id !== quote.id);
          }
          if (exists && note) {
            showToast('Updated reflection note in Saved Vault');
            return prev.map((item) =>
              item.quote.id === quote.id ? { ...item, personalNote: note } : item
            );
          }
          showToast('Saved to Personal Wisdom Vault');
          return [
            {
              quote,
              savedAt: new Date().toISOString(),
              collectionName: note ? 'Morning Reflections' : 'Personal Manifesto',
              personalNote: note,
            },
            ...prev,
          ];
        });
      }
    );
  };

  const handleSaveCustomAsQuote = (text: string, author: string) => {
    const customItem: QuoteItem = {
      id: `custom-${Date.now()}`,
      accessionNumber: `AQ · CUSTOM`,
      text,
      author,
      authorRole: 'Personal Studio Composition',
      era: new Date().getFullYear().toString(),
      category: 'Life',
      subCategory: 'Deep & Thought-Provoking',
      tags: ['#UniqueLifeQuotes', '#ProfoundWisdom'],
      emojiVibe: '✨' as EmojiVibe,
      originLocation: 'AuraQuote Studio Canvas',
      backstory: 'Composed and customized in the AuraQuote Typography Studio.',
    };
    handleSaveQuoteToVault(customItem);
  };

  const handleRequestCanvasExport = (exportFn: () => void) => {
    requirePermission(
      'canvasExport',
      'Generate & Download High-DPI Image',
      'Allow AuraQuote to render this typography composition via HTML5 Canvas and download the PNG file to your device.',
      'Image rendering happens 100% locally in your browser memory using the HTML5 Canvas 2D API.',
      () => {
        exportFn();
        showToast('High-Res Monograph PNG downloaded');
      }
    );
  };

  const handleClearAllStorage = () => {
    try {
      window.localStorage.removeItem(STORAGE_VAULT_KEY);
      window.localStorage.removeItem(STORAGE_PERMS_KEY);
    } catch {
      // ignore
    }
    setSavedItems([]);
    setPermissions({ localStorage: false, clipboard: false, canvasExport: false });
    setIsPermissionsModalOpen(false);
    showToast('Local Vault & permissions reset');
  };

  const isQuoteSaved = (quoteId: string) =>
    savedItems.some((item) => item.quote.id === quoteId);

  // Filtered & Sorted Archive Quotes
  const filteredQuotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = CURATED_QUOTES.filter((item) => {
      if (selectedTopic !== 'All' && item.category !== selectedTopic) {
        return false;
      }
      if (selectedSubCategory !== 'All' && item.subCategory !== selectedSubCategory) {
        return false;
      }
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }
      if (selectedEmoji && item.emojiVibe !== selectedEmoji) {
        return false;
      }
      if (q) {
        const haystack = [
          item.text,
          item.author,
          item.authorRole,
          item.originLocation,
          item.backstory,
          item.originalScript || '',
          item.transliteration || '',
          item.language || '',
          item.category,
          item.subCategory,
          ...item.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'shortest') {
      return [...list].sort((a, b) => a.text.length - b.text.length);
    }
    if (sortBy === 'deepest') {
      return [...list].sort((a, b) => b.text.length - a.text.length);
    }
    return list;
  }, [selectedTopic, selectedSubCategory, selectedTag, selectedEmoji, searchQuery, sortBy]);

  const activeEmojiMeta = useMemo(
    () => EMOJI_VIBES.find((v) => v.emoji === selectedEmoji) || null,
    [selectedEmoji]
  );

  const hasActiveFilters =
    selectedTopic !== 'All' ||
    selectedSubCategory !== 'All' ||
    selectedTag !== null ||
    selectedEmoji !== null ||
    searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setSelectedTopic('All');
    setSelectedSubCategory('All');
    setSelectedTag(null);
    setSelectedEmoji(null);
    setSearchQuery('');
    setSortBy('curated');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col pb-16 md:pb-0">
        {/* Strict 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#000000]/90 backdrop-blur-md border-b border-neutral-900 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Zone 1: Single Text Element Wordmark */}
          <a
            href="#"
            className="text-xl font-serif font-bold tracking-tight text-white whitespace-nowrap"
          >
            AuraQuote
          </a>

          {/* Zone 2: 5 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#E0E0E0]">
            <a
              href="#daily"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Daily Ritual
            </a>
            <a
              href="#archive"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Archive
            </a>
            <a
              href="#studio"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Studio Canvas
            </a>
            <a
              href="#curator-ai"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Curator AI
            </a>
            <a
              href="#vault"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Saved Vault ({savedItems.length})
            </a>
          </nav>

          {/* Zone 3: 2 Primary Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPermissionsModalOpen(true)}
              aria-label="Privacy and Action Permissions"
              title="Privacy & Action Permissions"
              className="min-w-[40px] min-h-[40px] rounded-lg border border-neutral-800 bg-[#121212] text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors flex items-center justify-center cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
            <a
              href="#studio"
              className="px-4 py-2 min-h-[40px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              Create Quote Card
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {/* Editorial Monograph Hero Section */}
          <section className="relative pt-12 pb-14 md:pt-20 md:pb-20 border-b border-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl space-y-6">
                <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase">
                  MonochromeWisdom · Multicultural & Literary Archive
                </p>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-white tracking-tight leading-[1.1]">
                  Timeless Wisdom. Modern Reflection.
                </h1>

                <p className="text-base sm:text-lg text-[#E0E0E0] leading-relaxed max-w-2xl">
                  Discover verified life, leadership, and multicultural aphorisms with translated historical backstories. Customize high-contrast monograph prints or explore philosophical lineage with our Literary Curator.
                </p>

                {/* Primary Hero Search & Anchor Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      placeholder="Search by theme, philosopher, movie, language, or keyword..."
                      aria-label="Search quotes archive"
                      className="w-full h-12 pl-10 pr-4 bg-[#121212] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <a
                    href="#archive"
                    className="h-12 px-6 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center whitespace-nowrap shrink-0"
                  >
                    Browse {CURATED_QUOTES.length} Monographs
                  </a>
                </div>

                {/* Unboxed Editorial Proof Strip */}
                <div className="pt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                  <span>10 Topic Collections</span>
                  <span aria-hidden="true">·</span>
                  <span>13 Nuanced Sub-Categories</span>
                  <span aria-hidden="true">·</span>
                  <span>Original Script & Philological Backstories</span>
                  <span aria-hidden="true">·</span>
                  <span>High-DPI Studio Canvas</span>
                </div>
              </div>
            </div>
          </section>

          {/* 01 · Quote of the Day (QOTD) Widget */}
          <QuoteOfTheDay
            quotes={CURATED_QUOTES}
            onSelectForCanvas={(q) => setCanvasQuote(q)}
            onSelectForAI={(q) => setAiQuote(q)}
            onSaveQuote={handleSaveQuoteToVault}
            onCopyQuote={handleCopyQuote}
            isQuoteSaved={isQuoteSaved}
          />

          {/* 02 · Quote Discovery, Categorization & Emoji Vibe Matcher */}
          <section id="archive" className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-2">
                    02 · Curated Discovery & Categorization
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white tracking-tight">
                    The Monochrome Wisdom Archive
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="archive-sort" className="text-xs text-neutral-400 whitespace-nowrap">
                    Order by:
                  </label>
                  <select
                    id="archive-sort"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'curated' | 'shortest' | 'deepest')
                    }
                    className="bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="curated">Curatorial Sequence</option>
                    <option value="shortest">Shortest First (2-Line Status)</option>
                    <option value="deepest">Longest & Most Reflective</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="px-3 py-2 min-h-[38px] rounded-lg border border-neutral-700 text-xs font-medium text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Control Console */}
              <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-6 mb-10">
                {/* 1. Primary Topic Collections */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                      Topic Collections
                    </span>
                    <span className="text-xs font-mono text-neutral-400 tabular-nums">
                      Showing {filteredQuotes.length} of {CURATED_QUOTES.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {TOPIC_CATEGORIES.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSelectedTopic(topic)}
                        className={`px-3.5 py-2 min-h-[38px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          selectedTopic === topic
                            ? 'bg-white text-black font-semibold'
                            : 'bg-black text-neutral-300 border border-neutral-800 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Nuanced Sub-Categories */}
                <div className="pt-4 border-t border-neutral-800/80">
                  <span className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2.5">
                    Nuanced Sub-Categories (Changemakers, Philanthropy, Short & Rare)
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {SUB_CATEGORIES.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          selectedSubCategory === sub
                            ? 'bg-white text-black font-semibold'
                            : 'bg-black text-neutral-400 border border-neutral-800/90 hover:border-neutral-600 hover:text-white'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Hashtag Filters & Dynamic Emoji Vibe Matcher */}
                <div className="pt-4 border-t border-neutral-800/80 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Hashtag Filters */}
                  <div className="lg:col-span-5">
                    <span className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2.5">
                      Curated Tag Filters
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {QUOTE_TAGS.map((tag) => {
                        const active = selectedTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(active ? null : tag)}
                            className={`px-2.5 py-1.5 min-h-[34px] rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                              active
                                ? 'bg-white text-black font-semibold'
                                : 'bg-black text-neutral-400 border border-neutral-800 hover:text-white'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Emoji Vibe Matcher */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                        Dynamic Emoji Vibe Matcher
                      </span>
                      {activeEmojiMeta && (
                        <span className="text-xs text-white font-medium">
                          {activeEmojiMeta.emoji} {activeEmojiMeta.label} — {activeEmojiMeta.moodDescription}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {EMOJI_VIBES.map((v) => {
                        const isSelected = selectedEmoji === v.emoji;
                        return (
                          <button
                            key={v.emoji}
                            type="button"
                            onClick={() =>
                              setSelectedEmoji(isSelected ? null : v.emoji)
                            }
                            title={`${v.label}: ${v.moodDescription}`}
                            className={`min-w-[40px] min-h-[40px] px-2.5 py-1.5 rounded-lg border text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white text-black border-white font-semibold scale-105'
                                : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-600'
                            }`}
                          >
                            <span>{v.emoji}</span>
                            <span className="text-[11px] hidden sm:inline whitespace-nowrap">
                              {v.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Cards Grid */}
              {filteredQuotes.length === 0 ? (
                <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-12 text-center space-y-4">
                  <p className="text-lg font-serif text-white">
                    No archival entries match this exact filter combination.
                  </p>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    Try clearing one of the active sub-categories or use our Curator AI Synthesizer below to compose a custom quote for your exact theme.
                  </p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-4 py-2.5 min-h-[40px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Restore Full Archive
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuotes.map((quote) => {
                    const saved = isQuoteSaved(quote.id);
                    const copied = copiedQuoteId === quote.id;
                    const backstoryExpanded = Boolean(expandedBackstoryIds[quote.id]);

                    return (
                      <article
                        key={quote.id}
                        className="bg-[#121212] border border-neutral-800 hover:border-neutral-600 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5 transition-colors"
                      >
                        <div className="space-y-4">
                          {/* Zero-Pill Unboxed Metadata Header */}
                          <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-neutral-300 tabular-nums">
                                {quote.accessionNumber}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="text-white font-medium">{quote.category}</span>
                              <span aria-hidden="true">/</span>
                              <span>{quote.subCategory}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{quote.era}</span>
                            </div>
                            <span className="text-base shrink-0" title={`Vibe: ${quote.emojiVibe}`}>
                              {quote.emojiVibe}
                            </span>
                          </div>

                          {/* Multilingual Original Script if available */}
                          {quote.originalScript && (
                            <div className="pl-3.5 border-l border-neutral-700 space-y-0.5">
                              <p className="text-xs sm:text-sm font-serif text-neutral-300">
                                {quote.originalScript}
                              </p>
                              {quote.transliteration && (
                                <p className="text-[11px] font-mono text-neutral-400 italic">
                                  {quote.transliteration} ({quote.language})
                                </p>
                              )}
                            </div>
                          )}

                          {/* Main Quote Text */}
                          <blockquote className="text-xl sm:text-2xl font-serif font-normal text-white leading-snug">
                            “{quote.text}”
                          </blockquote>

                          {/* Author & Origin Line */}
                          <div className="text-xs text-[#E0E0E0] space-y-0.5">
                            <p>
                              <span className="font-semibold text-white">— {quote.author}</span>
                              <span aria-hidden="true" className="mx-1.5 text-neutral-500">·</span>
                              <span className="text-neutral-400">{quote.authorRole}</span>
                            </p>
                            <p className="text-neutral-400 font-mono text-[11px]">
                              Provenance: {quote.originLocation}
                            </p>
                          </div>

                          {/* Historical Backstory & Origin Story */}
                          <div className="pt-2">
                            <p
                              className={`text-xs text-neutral-300 leading-relaxed ${
                                backstoryExpanded ? '' : 'line-clamp-2'
                              }`}
                            >
                              {quote.backstory}
                            </p>
                            {quote.backstory.length > 125 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedBackstoryIds((prev) => ({
                                    ...prev,
                                    [quote.id]: !prev[quote.id],
                                  }))
                                }
                                className="mt-1 text-[11px] font-mono text-neutral-400 hover:text-white underline underline-offset-4 cursor-pointer"
                              >
                                {backstoryExpanded ? 'Collapse Backstory' : 'Read Full Origin Story'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Unboxed Tags + Interactive Actions */}
                        <div className="pt-4 border-t border-neutral-800/80 space-y-3">
                          <div className="text-[11px] font-mono text-neutral-400 truncate">
                            {quote.tags.join(' · ')}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setCanvasQuote(quote);
                                  document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3 py-2 min-h-[38px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                              >
                                <Palette className="w-3.5 h-3.5" />
                                <span>Studio Canvas</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAiQuote(quote);
                                  document.getElementById('curator-ai')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3 py-2 min-h-[38px] rounded-lg bg-black border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                              >
                                <Compass className="w-3.5 h-3.5" />
                                <span>AI Context</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyQuote(quote)}
                                aria-label="Copy quote to clipboard"
                                className="px-3 py-2 min-h-[38px] rounded-lg bg-black border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-white" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSaveQuoteToVault(quote)}
                                aria-label={saved ? 'Remove from saved vault' : 'Save to vault'}
                                className={`px-3 py-2 min-h-[38px] rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                  saved
                                    ? 'bg-neutral-800 text-white border-neutral-600'
                                    : 'bg-black text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-600'
                                }`}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
                                <span>{saved ? 'Saved' : 'Save'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* 03 · Studio Canvas (Quote-to-Image / Text-to-Image Customizer) */}
          <StudioCanvasSection
            selectedQuote={canvasQuote}
            onRequestCanvasExport={handleRequestCanvasExport}
            onSaveCustomAsQuote={handleSaveCustomAsQuote}
          />

          {/* 04 · Embedded AI Assistant (Curator AI) */}
          <CuratorAISection
            activeQuoteForAI={aiQuote}
            onSendToCanvas={(q) => setCanvasQuote(q)}
            onSaveToVault={(q) => handleSaveQuoteToVault(q)}
            onCopyText={handleCopyPlainText}
          />

          {/* 05 · Favorite & Save Vault (Browser LocalStorage Manager) */}
          <SavedVaultSection
            savedItems={savedItems}
            onRemoveSaved={(quoteId) =>
              setSavedItems((prev) => prev.filter((i) => i.quote.id !== quoteId))
            }
            onUpdateCollection={(quoteId, collectionName) =>
              setSavedItems((prev) =>
                prev.map((i) =>
                  i.quote.id === quoteId ? { ...i, collectionName } : i
                )
              )
            }
            onSelectForCanvas={(q) => setCanvasQuote(q)}
            onCopyQuote={handleCopyQuote}
          />

          {/* 06 · Content & FAQs Section */}
          <FaqSection />
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="border-t border-neutral-900 bg-[#000000] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-base font-serif font-semibold text-white">
                AuraQuote — MonochromeWisdom
              </p>
              <p className="text-xs text-neutral-400">
                Timeless Wisdom. Modern Reflection. Curated multicultural aphorisms & typography studio.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
              <a href="#daily" className="hover:text-white transition-colors">
                Daily Ritual
              </a>
              <a href="#archive" className="hover:text-white transition-colors">
                Archive
              </a>
              <a href="#studio" className="hover:text-white transition-colors">
                Studio Canvas
              </a>
              <a href="#curator-ai" className="hover:text-white transition-colors">
                Curator AI
              </a>
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(true)}
                className="hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
              >
                Privacy & Consent Controls
              </button>
            </div>
          </div>
        </footer>

        {/* Mobile Thumb-Zone Bottom Navigation Bar (<= 15% sticky height cap) */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-[#000000]/95 backdrop-blur-md border-t border-neutral-800 grid grid-cols-5 items-center px-2"
        >
          <a
            href="#daily"
            className="min-h-[44px] flex flex-col items-center justify-center text-neutral-400 hover:text-white"
          >
            <Sun className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Daily</span>
          </a>
          <a
            href="#archive"
            className="min-h-[44px] flex flex-col items-center justify-center text-neutral-400 hover:text-white"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Archive</span>
          </a>
          <a
            href="#studio"
            className="min-h-[44px] flex flex-col items-center justify-center text-neutral-400 hover:text-white"
          >
            <Palette className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Studio</span>
          </a>
          <a
            href="#curator-ai"
            className="min-h-[44px] flex flex-col items-center justify-center text-neutral-400 hover:text-white"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Curator AI</span>
          </a>
          <a
            href="#vault"
            className="min-h-[44px] flex flex-col items-center justify-center text-neutral-400 hover:text-white"
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">Vault ({savedItems.length})</span>
          </a>
        </nav>

        {/* Action Consent Modal (Fires only on user action) */}
        <ConsentModal
          pendingAction={pendingConsent}
          onApprove={() => pendingConsent?.onConfirm()}
          onCancel={() => setPendingConsent(null)}
        />

        {/* Privacy & Permissions Inspector Modal */}
        <PermissionsManagerModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          permissions={permissions}
          onTogglePermission={(key) =>
            updatePermissions({ ...permissions, [key]: !permissions[key] })
          }
          onClearAllStorage={handleClearAllStorage}
        />

        {/* Subtle Monochrome Feedback Toast */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-40 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold shadow-2xl border border-neutral-300 flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
