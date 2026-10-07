import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Download,
  Palette,
  Copy,
  Check,
  FolderOpen,
} from 'lucide-react';
import { QuoteItem, SavedQuoteItem } from '../types/quotes';

interface SavedVaultSectionProps {
  savedItems: SavedQuoteItem[];
  onRemoveSaved: (quoteId: string) => void;
  onUpdateCollection: (
    quoteId: string,
    collectionName: SavedQuoteItem['collectionName']
  ) => void;
  onSelectForCanvas: (quote: QuoteItem) => void;
  onCopyQuote: (quote: QuoteItem) => void;
}

const COLLECTION_FOLDERS: SavedQuoteItem['collectionName'][] = [
  'Personal Manifesto',
  'Leadership & Keynote',
  'Social Captions',
  'Morning Reflections',
];

export const SavedVaultSection: React.FC<SavedVaultSectionProps> = ({
  savedItems,
  onRemoveSaved,
  onUpdateCollection,
  onSelectForCanvas,
  onCopyQuote,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<'All' | SavedQuoteItem['collectionName']>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const safeItems = Array.isArray(savedItems) ? savedItems : [];
  const filtered =
    selectedFolder === 'All'
      ? safeItems
      : safeItems.filter((item) => item.collectionName === selectedFolder);

  const handleExportMarkdown = () => {
    if (safeItems.length === 0) return;
    const lines = [
      '# AuraQuote — Personal Wisdom Monograph Vault',
      `Exported on ${new Date().toLocaleDateString()}`,
      '',
      ...safeItems.map(
        (item, idx) =>
          `## ${idx + 1}. ${item.quote.author} (${item.collectionName})\n> "${item.quote.text}"\n\n- **Provenance**: ${item.quote.originLocation} (${item.quote.era})\n- **Category**: ${item.quote.category} / ${item.quote.subCategory}\n${
            item.personalNote ? `- **Personal Reflection**: ${item.personalNote}\n` : ''
          }`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auraquote-personal-vault.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="vault" className="py-16 md:py-24 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-2">
              05 · Browser LocalStorage Collection Manager
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white tracking-tight">
              Saved Wisdom Vault ({safeItems.length})
            </h2>
          </div>

          {safeItems.length > 0 && (
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-4 py-2.5 min-h-[40px] rounded-lg bg-[#121212] border border-neutral-800 text-xs font-medium text-white hover:border-white transition-colors flex items-center gap-2 self-start md:self-auto whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Monograph (.md)</span>
            </button>
          )}
        </div>

        {/* Folder Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setSelectedFolder('All')}
            className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedFolder === 'All'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#121212] text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            All Folders ({safeItems.length})
          </button>
          {COLLECTION_FOLDERS.map((folder) => {
            const count = safeItems.filter((i) => i.collectionName === folder).length;
            return (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedFolder === folder
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#121212] text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {folder} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-10 text-center space-y-3">
            <FolderOpen className="w-7 h-7 text-neutral-500 mx-auto" />
            <h3 className="text-lg font-serif text-white">
              Your Saved Vault is Ready for Curation
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Bookmark any quote from the Archive, Daily Ritual, or Curator AI to organize your personal manifesto and reflections locally in your browser.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <article
                key={item.quote.id}
                className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
                    <span className="font-mono">{item.quote.accessionNumber} · {item.quote.category}</span>
                    <select
                      aria-label="Collection folder"
                      value={item.collectionName}
                      onChange={(e) =>
                        onUpdateCollection(
                          item.quote.id,
                          e.target.value as SavedQuoteItem['collectionName']
                        )
                      }
                      className="bg-black border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-white"
                    >
                      {COLLECTION_FOLDERS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <blockquote className="text-lg sm:text-xl font-serif text-white leading-snug">
                    “{item.quote.text}”
                  </blockquote>

                  <p className="text-xs text-[#E0E0E0]">
                    — <span className="font-semibold text-white">{item.quote.author}</span> · {item.quote.originLocation}
                  </p>

                  {item.personalNote && (
                    <div className="p-3 rounded-lg bg-black border border-neutral-800/90 text-xs text-neutral-300">
                      <span className="font-mono text-neutral-500 uppercase block mb-1">
                        Personal Reflection Note:
                      </span>
                      {item.personalNote}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                  <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
                    Saved {new Date(item.savedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectForCanvas(item.quote);
                        document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 min-h-[36px] rounded-lg bg-black border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Canvas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onCopyQuote(item.quote);
                        setCopiedId(item.quote.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="px-3 py-1.5 min-h-[36px] rounded-lg bg-black border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === item.quote.id ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveSaved(item.quote.id)}
                      aria-label="Remove from saved vault"
                      className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-black border border-neutral-800 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
