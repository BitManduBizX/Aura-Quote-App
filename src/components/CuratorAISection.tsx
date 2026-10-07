import React, { useEffect, useState } from 'react';
import {
  Compass,
  Sparkles,
  Send,
  Copy,
  Check,
  Palette,
  Bookmark,
  BookOpen,
  Layers,
  Loader2,
} from 'lucide-react';
import { AIExplorationResult, EmojiVibe, QuoteItem, QuoteTag, SubCategory, TopicCategory } from '../types/quotes';

interface CuratorAISectionProps {
  activeQuoteForAI: QuoteItem | null;
  onSendToCanvas: (quote: QuoteItem) => void;
  onSaveToVault: (quote: QuoteItem) => void;
  onCopyText: (text: string) => void;
}

export const CuratorAISection: React.FC<CuratorAISectionProps> = ({
  activeQuoteForAI,
  onSendToCanvas,
  onSaveToVault,
  onCopyText,
}) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'synthesize'>('explore');

  // Explorer State
  const [inquiryInput, setInquiryInput] = useState('');
  const [isExploring, setIsExploring] = useState(false);
  const [explorationResult, setExplorationResult] = useState<AIExplorationResult | null>(null);
  const [copiedDraftKey, setCopiedDraftKey] = useState<string | null>(null);

  // Synthesizer State
  const [topicInput, setTopicInput] = useState('Quiet Perseverance & Craft');
  const [toneInput, setToneInput] = useState('Stoic & Minimalist');
  const [occasionInput, setOccasionInput] = useState('Personal Reflection & 2-Line Status');
  const [cultureInput, setCultureInput] = useState('Universal World Philosophy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuotes, setGeneratedQuotes] = useState<QuoteItem[]>([]);

  const runExploration = async (customPrompt?: string, quoteCtx?: QuoteItem | null) => {
    setIsExploring(true);
    try {
      const targetQuote = quoteCtx !== undefined ? quoteCtx : activeQuoteForAI;
      const response = await fetch('/api/gemini/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:
            customPrompt ??
            (inquiryInput.trim() ||
              'Unpack the philosophical weight, historical origin, cross-cultural parallels, and modern leadership application of this quote.'),
          quoteContext: targetQuote
            ? {
                text: targetQuote.text,
                author: targetQuote.author,
                origin: targetQuote.originLocation,
              }
            : undefined,
        }),
      });
      const json = await response.json();
      if (json?.data) {
        setExplorationResult(json.data);
      }
    } catch (err) {
      console.error('Failed to explore quote:', err);
    } finally {
      setIsExploring(false);
    }
  };

  // Run initial exploration when activeQuoteForAI changes
  useEffect(() => {
    if (activeQuoteForAI) {
      setActiveTab('explore');
      runExploration(
        `Examine the deeper philosophical resonance and historical provenance of "${activeQuoteForAI.text}" by ${activeQuoteForAI.author}.`,
        activeQuoteForAI
      );
    }
  }, [activeQuoteForAI?.id]);

  const handleExploreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runExploration(inquiryInput);
  };

  const handleGenerateQuotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          tone: toneInput,
          occasion: occasionInput,
          culture: cultureInput,
        }),
      });
      const json = await response.json();
      if (Array.isArray(json?.quotes)) {
        const mapped: QuoteItem[] = json.quotes.map((q: Record<string, unknown>, idx: number) => ({
          id: `ai-gen-${Date.now()}-${idx}`,
          accessionNumber: `AQ · AI-${idx + 1}`,
          text: String(q?.text || ''),
          author: String(q?.author || 'AuraQuote Curatorial Synthesis'),
          authorRole: `${toneInput} · ${cultureInput}`,
          era: 'Contemporary Synthesis',
          category: (q?.category as Exclude<TopicCategory, 'All'>) || 'Life',
          subCategory: (q?.subCategory as Exclude<SubCategory, 'All'>) || 'Deep & Thought-Provoking',
          tags: (Array.isArray(q?.tags) ? q.tags : ['#UniqueLifeQuotes', '#ProfoundWisdom']) as QuoteTag[],
          emojiVibe: (q?.emojiVibe as EmojiVibe) || '⚡',
          originLocation: String(q?.origin || occasionInput),
          backstory: String(q?.backstory || ''),
        }));
        setGeneratedQuotes(mapped);
      }
    } catch (err) {
      console.error('Failed to synthesize quotes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySnippet = (key: string, text: string) => {
    onCopyText(text);
    setCopiedDraftKey(key);
    setTimeout(() => setCopiedDraftKey(null), 2000);
  };

  return (
    <section id="curator-ai" className="py-16 md:py-24 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-2">
              04 · Embedded Literary & Philosophical Intelligence
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white tracking-tight">
              Curator AI · Deep Wisdom & Custom Synthesis
            </h2>
          </div>

          {/* Interactive Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#121212] border border-neutral-800 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Wisdom & Provenance Explorer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('synthesize')}
              className={`px-4 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'synthesize'
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Quote Synthesizer</span>
            </button>
          </div>
        </div>

        {activeTab === 'explore' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Inquiry & Selected Quote Context */}
            <div className="lg:col-span-5 bg-[#121212] border border-neutral-800 rounded-2xl p-6 space-y-6">
              {activeQuoteForAI && (
                <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span>ACTIVE MONOGRAPH SUBJECT</span>
                    <span>{activeQuoteForAI.accessionNumber}</span>
                  </div>
                  <p className="text-base font-serif italic text-white">
                    “{activeQuoteForAI.text}”
                  </p>
                  <p className="text-xs text-neutral-400">
                    — {activeQuoteForAI.author} · {activeQuoteForAI.originLocation}
                  </p>
                </div>
              )}

              <form onSubmit={handleExploreSubmit} className="space-y-4">
                <div>
                  <label htmlFor="ai-inquiry-input" className="block text-xs font-medium text-[#E0E0E0] mb-2">
                    Ask the Literary Curator (Provenance, Meaning, or Campaign Adaptation)
                  </label>
                  <textarea
                    id="ai-inquiry-input"
                    rows={3}
                    value={inquiryInput}
                    onChange={(e) => setInquiryInput(e.target.value)}
                    placeholder="e.g., How does this quote compare to Japanese Wabi-Sabi or Stoicism? Or draft a Giving Tuesday reflection around it..."
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isExploring}
                  className="w-full py-2.5 px-4 min-h-[44px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isExploring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Consulting Philosophical Archives...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Analyze Wisdom & Context</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-neutral-800 space-y-2.5">
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                  Curated Inquiry Prompts
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    'Trace the historical context and philological roots of this quote',
                    'Compare this idea across Stoic, Zen, and Ubuntu philosophies',
                    'Adapt this wisdom for a Giving Tuesday fundraising campaign & team note',
                  ].map((presetPrompt) => (
                    <button
                      key={presetPrompt}
                      type="button"
                      onClick={() => {
                        setInquiryInput(presetPrompt);
                        runExploration(presetPrompt);
                      }}
                      className="text-left px-3.5 py-2.5 rounded-lg bg-black border border-neutral-800/90 text-xs text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors cursor-pointer"
                    >
                      → {presetPrompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Structured Scholarly Analysis */}
            <div className="lg:col-span-7 bg-[#121212] border border-neutral-800 rounded-2xl p-6 sm:p-8">
              {isExploring ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                  <p className="text-sm font-serif text-white">
                    Synthesizing historical context and cross-cultural parallels...
                  </p>
                </div>
              ) : explorationResult ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Philosophical & Literary Exegesis</span>
                    </div>
                    <p className="text-sm sm:text-base text-white leading-relaxed">
                      {explorationResult.analysis}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-neutral-800">
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                      Historical Provenance & Era Context
                    </p>
                    <p className="text-sm text-[#E0E0E0] leading-relaxed">
                      {explorationResult.historicalContext}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider mb-3">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Cross-Cultural Parallels</span>
                    </div>
                    <ul className="space-y-2.5">
                      {(explorationResult.crossCulturalParallels || []).map((parallel, i) => (
                        <li
                          key={i}
                          className="text-xs sm:text-sm text-[#E0E0E0] pl-3.5 border-l border-neutral-700 leading-relaxed"
                        >
                          {parallel}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 border-t border-neutral-800">
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-3">
                      Daily Reflection Questions
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {(explorationResult.reflectionQuestions || []).map((q, i) => (
                        <div key={i} className="p-3 rounded-lg bg-black border border-neutral-800/80 text-xs text-white">
                          <span className="font-mono text-neutral-400 mr-2">0{i + 1}.</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  {explorationResult.applicationDrafts && (
                    <div className="pt-5 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-black border border-neutral-800 flex flex-col justify-between gap-3">
                        <div>
                          <p className="text-xs font-mono text-neutral-400 uppercase mb-1.5">
                            Social Caption Draft
                          </p>
                          <p className="text-xs text-[#E0E0E0] leading-relaxed whitespace-pre-line">
                            {explorationResult.applicationDrafts.socialCaption}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopySnippet(
                              'social',
                              explorationResult.applicationDrafts.socialCaption
                            )
                          }
                          className="self-start px-3 py-1.5 min-h-[36px] rounded-lg border border-neutral-700 text-xs font-medium text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedDraftKey === 'social' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied Caption</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Caption</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-black border border-neutral-800 flex flex-col justify-between gap-3">
                        <div>
                          <p className="text-xs font-mono text-neutral-400 uppercase mb-1.5">
                            Executive / Newsletter Note
                          </p>
                          <p className="text-xs text-[#E0E0E0] leading-relaxed">
                            {explorationResult.applicationDrafts.executiveNote}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopySnippet(
                              'exec',
                              explorationResult.applicationDrafts.executiveNote
                            )
                          }
                          className="self-start px-3 py-1.5 min-h-[36px] rounded-lg border border-neutral-700 text-xs font-medium text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedDraftKey === 'exec' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied Note</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Executive Note</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* Bespoke Quote Synthesizer Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleGenerateQuotes}
              className="lg:col-span-4 bg-[#121212] border border-neutral-800 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-base font-serif font-semibold text-white border-b border-neutral-800 pb-3">
                Synthesis Parameters
              </h3>

              <div>
                <label htmlFor="synth-topic" className="block text-xs font-medium text-[#E0E0E0] mb-1.5">
                  Core Theme or Subject
                </label>
                <input
                  id="synth-topic"
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., Creative courage, Giving Tuesday, Stillness"
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label htmlFor="synth-tone" className="block text-xs font-medium text-[#E0E0E0] mb-1.5">
                  Literary Voice & Tone
                </label>
                <select
                  id="synth-tone"
                  value={toneInput}
                  onChange={(e) => setToneInput(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="Stoic & Minimalist">Stoic & Minimalist</option>
                  <option value="Poetic & Nostalgic">Poetic & Nostalgic</option>
                  <option value="Visionary Changemaker">Visionary Changemaker</option>
                  <option value="Warm, Kind & Compassionate">Warm, Kind & Compassionate</option>
                  <option value="High-Contrast Cinema">High-Contrast Cinema</option>
                </select>
              </div>

              <div>
                <label htmlFor="synth-occasion" className="block text-xs font-medium text-[#E0E0E0] mb-1.5">
                  Target Occasion / Campaign
                </label>
                <select
                  id="synth-occasion"
                  value={occasionInput}
                  onChange={(e) => setOccasionInput(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="Personal Reflection & 2-Line Status">Personal Reflection & 2-Line Status</option>
                  <option value="Giving Tuesday & Philanthropy Appeal">Giving Tuesday & Philanthropy Appeal</option>
                  <option value="Executive Leadership & Team Offsite">Executive Leadership & Team Offsite</option>
                  <option value="Instagram Story & Visual Monograph">Instagram Story & Visual Monograph</option>
                </select>
              </div>

              <div>
                <label htmlFor="synth-culture" className="block text-xs font-medium text-[#E0E0E0] mb-1.5">
                  Philosophical Lineage
                </label>
                <select
                  id="synth-culture"
                  value={cultureInput}
                  onChange={(e) => setCultureInput(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="Universal World Philosophy">Universal World Philosophy</option>
                  <option value="Greco-Roman Stoic Tradition">Greco-Roman Stoic Tradition</option>
                  <option value="East Asian Zen & Wabi-Sabi">East Asian Zen & Wabi-Sabi</option>
                  <option value="African Ubuntu & Communal Ethics">African Ubuntu & Communal Ethics</option>
                  <option value="European Existential Literature">European Existential Literature</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 min-h-[44px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Composing Aphorisms...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize 3 Custom Quotes</span>
                  </>
                )}
              </button>
            </form>

            <div className="lg:col-span-8 space-y-4">
              {generatedQuotes.length === 0 && !isGenerating ? (
                <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
                  <Sparkles className="w-6 h-6 text-neutral-400 mx-auto" />
                  <h3 className="text-lg font-serif text-white">
                    Ready to Compose Bespoke Aphorisms
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Select your theme, literary voice, and occasion on the left, then click "Synthesize 3 Custom Quotes" to generate original quotes ready for the Studio Canvas.
                  </p>
                </div>
              ) : (
                generatedQuotes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>
                        {item.accessionNumber} · {item.category} · {item.subCategory}
                      </span>
                      <span>{item.emojiVibe}</span>
                    </div>

                    <blockquote className="text-xl sm:text-2xl font-serif text-white leading-snug">
                      “{item.text}”
                    </blockquote>

                    <p className="text-xs text-[#E0E0E0]">
                      — <span className="font-semibold text-white">{item.author}</span> · {item.originLocation}
                    </p>

                    <p className="text-xs text-neutral-400 leading-relaxed border-l border-neutral-800 pl-3">
                      {item.backstory}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
                      <span className="text-xs text-neutral-500">
                        {item.tags.join(' · ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSendToCanvas(item);
                            document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 min-h-[38px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Palette className="w-3.5 h-3.5" />
                          <span>Studio Canvas</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSaveToVault(item)}
                          className="px-3 py-1.5 min-h-[38px] rounded-lg bg-black border border-neutral-700 text-xs text-white hover:border-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopySnippet(item.id, `"${item.text}" — ${item.author}`)}
                          className="px-3 py-1.5 min-h-[38px] rounded-lg bg-black border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedDraftKey === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
