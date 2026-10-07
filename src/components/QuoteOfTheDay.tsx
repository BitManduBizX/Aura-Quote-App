import React, { useState } from 'react';
import {
  Shuffle,
  Volume2,
  VolumeX,
  Bookmark,
  Copy,
  Check,
  Palette,
  Compass,
  PenLine,
} from 'lucide-react';
import { QuoteItem } from '../types/quotes';

interface QuoteOfTheDayProps {
  quotes: QuoteItem[];
  onSelectForCanvas: (quote: QuoteItem) => void;
  onSelectForAI: (quote: QuoteItem) => void;
  onSaveQuote: (quote: QuoteItem, note?: string) => void;
  onCopyQuote: (quote: QuoteItem) => void;
  isQuoteSaved: (quoteId: string) => boolean;
}

export const QuoteOfTheDay: React.FC<QuoteOfTheDayProps> = ({
  quotes,
  onSelectForCanvas,
  onSelectForAI,
  onSaveQuote,
  onCopyQuote,
  isQuoteSaved,
}) => {
  // Deterministic daily index based on day of year
  const today = new Date();
  const daySeed =
    today.getFullYear() * 1000 +
    (today.getMonth() + 1) * 35 +
    today.getDate();

  const [offset, setOffset] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [showJournalInput, setShowJournalInput] = useState(false);

  const safeQuotes = Array.isArray(quotes) && quotes.length > 0 ? quotes : [];
  const activeQuote =
    safeQuotes[(daySeed + offset) % Math.max(1, safeQuotes.length)];

  if (!activeQuote) return null;

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${activeQuote.text} — by ${activeQuote.author}. ${activeQuote.backstory}`
    );
    utterance.rate = 0.92;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    onCopyQuote(activeQuote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveQuote(activeQuote, reflectionText.trim() || undefined);
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 2500);
  };

  const saved = isQuoteSaved(activeQuote.id);

  return (
    <section id="daily" className="py-12 md:py-20 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 sm:p-10 lg:p-12">
          {/* Top Curatorial Strip — Zero-Pill Unboxed Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-800/80">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="font-mono text-white">01 · DAILY RITUAL (QOTD)</span>
              <span aria-hidden="true">·</span>
              <span>{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeQuote.accessionNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{activeQuote.category}</span>
              <span aria-hidden="true">/</span>
              <span>{activeQuote.subCategory}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSpeak}
                className="px-3 py-2 min-h-[40px] rounded-lg bg-black border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                title="Listen to spoken recital"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-white" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Recite Aloud</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                  setOffset((prev) => prev + 1);
                }}
                className="px-3.5 py-2 min-h-[40px] rounded-lg bg-black border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Daily Inspiration</span>
              </button>
            </div>
          </div>

          {/* Two-Column Asymmetric Monograph Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 8 Cols: Dominant Pull Quote */}
            <div className="lg:col-span-8 space-y-6">
              {activeQuote.originalScript && (
                <div className="space-y-1 border-l-2 border-neutral-700 pl-4">
                  <p className="text-sm font-serif text-neutral-300 tracking-wide">
                    {activeQuote.originalScript}
                  </p>
                  {activeQuote.transliteration && (
                    <p className="text-xs font-mono text-neutral-400 italic">
                      {activeQuote.transliteration} ({activeQuote.language})
                    </p>
                  )}
                </div>
              )}

              <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-white leading-snug tracking-tight">
                “{activeQuote.text}”
              </blockquote>

              <div className="flex flex-wrap items-center gap-2 text-sm text-[#E0E0E0] pt-2">
                <span className="font-semibold text-white">— {activeQuote.author}</span>
                <span aria-hidden="true" className="text-neutral-500">·</span>
                <span className="text-neutral-400">{activeQuote.authorRole}</span>
                <span aria-hidden="true" className="text-neutral-500">·</span>
                <span className="font-mono text-xs text-neutral-400">{activeQuote.era}</span>
                <span aria-hidden="true" className="text-neutral-500">·</span>
                <span title="Curated Emoji Vibe">{activeQuote.emojiVibe}</span>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onSelectForCanvas(activeQuote);
                    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 min-h-[44px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Palette className="w-4 h-4" />
                  <span>Design on Studio Canvas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectForAI(activeQuote);
                    document.getElementById('curator-ai')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 min-h-[44px] rounded-lg bg-black border border-neutral-700 text-white text-xs font-medium hover:border-white transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Depth with AI</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2.5 min-h-[44px] rounded-lg bg-black border border-neutral-800 text-neutral-300 text-xs font-medium hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Quote</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSaveQuote(activeQuote)}
                  className={`px-3.5 py-2.5 min-h-[44px] rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    saved
                      ? 'bg-neutral-800 text-white border-neutral-600'
                      : 'bg-black text-neutral-300 border-neutral-800 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-white' : ''}`} />
                  <span>{saved ? 'Saved in Vault' : 'Save to Vault'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJournalInput((prev) => !prev)}
                  className="px-3.5 py-2.5 min-h-[44px] rounded-lg bg-black border border-neutral-800 text-neutral-300 text-xs font-medium hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>{showJournalInput ? 'Hide Journal' : 'Add Reflection Note'}</span>
                </button>
              </div>

              {/* Expandable Personal Reflection Input */}
              {showJournalInput && (
                <form
                  onSubmit={handleSaveReflection}
                  className="p-4 rounded-xl bg-black border border-neutral-800 space-y-3 mt-4"
                >
                  <label htmlFor="qotd-reflection" className="block text-xs font-medium text-[#E0E0E0]">
                    Personal Reflection Margin Note (Stored locally in your Vault)
                  </label>
                  <textarea
                    id="qotd-reflection"
                    rows={2}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="How does this aphorism apply to a decision you face today?"
                    className="w-full bg-[#121212] border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 min-h-[38px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      {reflectionSaved ? 'Saved to Personal Vault' : 'Save Quote & Reflection'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right 4 Cols: Provenance & Translated Backstory Margin Rail */}
            <div className="lg:col-span-4 lg:border-l lg:border-neutral-800 lg:pl-8 space-y-4">
              <div>
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                  Historical Provenance & Origin
                </p>
                <p className="text-xs text-white font-medium mb-2">
                  {activeQuote.originLocation}
                </p>
                <p className="text-sm text-[#E0E0E0] leading-relaxed">
                  {activeQuote.backstory}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80">
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                  Index Classification
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {activeQuote.tags.join(' · ')} · Character length:{' '}
                  <span className="font-mono tabular-nums text-white">
                    {activeQuote.text.length} chars
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
