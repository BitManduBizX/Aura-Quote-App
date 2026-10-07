import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQ_ITEMS } from '../data/quotesData';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string>(FAQ_ITEMS[0]?.id || 'faq-1');

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-neutral-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-2">
            06 · Curatorial Methodology & Reader Guide
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#E0E0E0] mt-2 leading-relaxed">
            Insights on philological quote verification, daily reflection rituals, philanthropy campaign curation, and local-first privacy.
          </p>
        </div>

        <div className="divide-y divide-neutral-800 border-t border-b border-neutral-800">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? '' : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-start justify-between gap-4 text-left min-h-[44px] group cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-neutral-400">
                      0{idx + 1} · {item.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-medium text-white group-hover:text-neutral-200 transition-colors">
                      {item.question}
                    </h3>
                  </div>
                  <span className="mt-1 p-1.5 rounded-lg bg-[#121212] border border-neutral-800 text-neutral-400 group-hover:text-white shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 pr-8 text-sm text-[#E0E0E0] leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
