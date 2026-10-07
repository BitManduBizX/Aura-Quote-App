import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Type as TypeIcon,
  Maximize2,
  AlignLeft,
  AlignCenter,
  Sparkles,
  RotateCcw,
  Check,
  Sliders,
} from 'lucide-react';
import {
  CanvasAlignment,
  CanvasAspectRatio,
  CanvasConfig,
  CanvasFontStyle,
  CanvasThemeId,
  QuoteItem,
} from '../types/quotes';

interface StudioCanvasSectionProps {
  selectedQuote: QuoteItem;
  onRequestCanvasExport: (exportFn: () => void) => void;
  onSaveCustomAsQuote: (text: string, author: string) => void;
}

interface ThemePreset {
  id: CanvasThemeId;
  name: string;
  bg: string;
  fg: string;
  muted: string;
  border: string;
  accent: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'pitch-black',
    name: 'Pitch Black (#000000)',
    bg: '#000000',
    fg: '#FFFFFF',
    muted: '#A3A3A3',
    border: '#333333',
    accent: '#FFFFFF',
  },
  {
    id: 'charcoal-graphite',
    name: 'Charcoal Graphite (#121212)',
    bg: '#121212',
    fg: '#FFFFFF',
    muted: '#B0B0B0',
    border: '#2E2E2E',
    accent: '#E0E0E0',
  },
  {
    id: 'pure-stark',
    name: 'Pure White (#FFFFFF)',
    bg: '#FFFFFF',
    fg: '#000000',
    muted: '#525252',
    border: '#D4D4D4',
    accent: '#000000',
  },
  {
    id: 'silver-mist',
    name: 'Subtle Silver (#E0E0E0)',
    bg: '#E0E0E0',
    fg: '#0A0A0A',
    muted: '#404040',
    border: '#BDBDBD',
    accent: '#121212',
  },
  {
    id: 'archival-paper',
    name: 'Archival Monograph (#F7F4EE)',
    bg: '#F7F4EE',
    fg: '#1C1917',
    muted: '#57534E',
    border: '#D6CEBE',
    accent: '#292524',
  },
  {
    id: 'obsidian-gold',
    name: 'Nocturne Bronze (#080808)',
    bg: '#080808',
    fg: '#F5F5F0',
    muted: '#A8A29E',
    border: '#44403C',
    accent: '#D6D3D1',
  },
];

const ASPECT_RATIOS: { id: CanvasAspectRatio; label: string; width: number; height: number; useCase: string }[] = [
  { id: '1:1', label: '1:1 Square', width: 1080, height: 1080, useCase: 'Instagram & Feed Post' },
  { id: '4:5', label: '4:5 Portrait', width: 1080, height: 1350, useCase: 'Editorial Monograph Print' },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920, useCase: 'Social Story & Phone Wallpaper' },
  { id: '16:9', label: '16:9 Cinema', width: 1920, height: 1080, useCase: 'Desktop Wallpaper & Keynote' },
];

export const StudioCanvasSection: React.FC<StudioCanvasSectionProps> = ({
  selectedQuote,
  onRequestCanvasExport,
  onSaveCustomAsQuote,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exportedNotice, setExportedNotice] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [config, setConfig] = useState<CanvasConfig>({
    quoteText: selectedQuote?.text || 'Waste no more time arguing about what a good person should be. Be one.',
    authorText: selectedQuote?.author || 'Marcus Aurelius',
    originSubtext: `${selectedQuote?.originLocation || 'Classical Archive'} · ${selectedQuote?.accessionNumber || 'AQ · 001'}`,
    themeId: 'pitch-black',
    aspectRatio: '4:5',
    fontStyle: 'serif',
    alignment: 'left',
    fontSizeScale: 1,
    showFrameBorder: true,
    showWatermark: true,
    watermarkText: 'AURAQUOTE · TIMELESS WISDOM. MODERN REFLECTION.',
    showNoiseTexture: true,
  });

  // Sync when user clicks "Customize in Studio" on any quote card
  useEffect(() => {
    if (selectedQuote) {
      setConfig((prev) => ({
        ...prev,
        quoteText: selectedQuote.text,
        authorText: selectedQuote.author,
        originSubtext: `${selectedQuote.originLocation} · ${selectedQuote.accessionNumber}`,
      }));
    }
  }, [selectedQuote]);

  // Draw the quote onto the HTML5 Canvas whenever config changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratioSpec = ASPECT_RATIOS.find((r) => r.id === config.aspectRatio) || ASPECT_RATIOS[1];
    const theme = THEME_PRESETS.find((t) => t.id === config.themeId) || THEME_PRESETS[0];

    canvas.width = ratioSpec.width;
    canvas.height = ratioSpec.height;

    const W = canvas.width;
    const H = canvas.height;

    // 1. Background fill
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle architectural texture / grain if enabled
    if (config.showNoiseTexture) {
      ctx.save();
      ctx.strokeStyle = theme.border;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1;
      const gridStep = Math.round(W / 12);
      for (let x = gridStep; x < W; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = gridStep; y < H; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Outer editorial hairline frame border
    const margin = Math.round(Math.min(W, H) * 0.065);
    if (config.showFrameBorder) {
      ctx.save();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

      // Corner registration marks
      const markLen = 18;
      ctx.strokeStyle = theme.fg;
      ctx.lineWidth = 2.5;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(margin, margin + markLen);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + markLen, margin);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(W - margin - markLen, H - margin);
      ctx.lineTo(W - margin, H - margin);
      ctx.lineTo(W - margin, H - margin - markLen);
      ctx.stroke();
      ctx.restore();
    }

    const innerPad = margin + Math.round(Math.min(W, H) * 0.065);
    const maxTextWidth = W - innerPad * 2;
    const textX = config.alignment === 'center' ? W / 2 : innerPad;

    // 4. Top Accession Kicker
    ctx.save();
    ctx.fillStyle = theme.muted;
    ctx.font = `500 21px "JetBrains Mono", monospace`;
    ctx.textAlign = config.alignment;
    const topKickerY = innerPad + 28;
    ctx.fillText(
      (config.originSubtext || 'AURAQUOTE MONOGRAPH ARCHIVE').toUpperCase().slice(0, 62),
      textX,
      topKickerY
    );
    ctx.restore();

    // 5. Main Quote Typography & Word Wrapping
    const baseFontSize = Math.round(
      (config.quoteText.length > 140 ? 44 : config.quoteText.length > 85 ? 54 : 64) *
        config.fontSizeScale
    );
    const lineHeight = Math.round(baseFontSize * 1.38);

    let fontFamilyStr = `"Playfair Display", Georgia, serif`;
    let fontWeightStyle = '600';
    if (config.fontStyle === 'sans') {
      fontFamilyStr = `"Plus Jakarta Sans", -apple-system, sans-serif`;
      fontWeightStyle = '600';
    } else if (config.fontStyle === 'mono') {
      fontFamilyStr = `"JetBrains Mono", monospace`;
      fontWeightStyle = '400';
    } else if (config.fontStyle === 'italic-serif') {
      fontFamilyStr = `"Playfair Display", Georgia, serif`;
      fontWeightStyle = 'italic 400';
    }

    ctx.save();
    ctx.font = `${fontWeightStyle} ${baseFontSize}px ${fontFamilyStr}`;
    ctx.fillStyle = theme.fg;
    ctx.textAlign = config.alignment;

    // Wrap text into lines
    const paragraphs = (config.quoteText || '').split('\n');
    const lines: string[] = [];
    for (let p = 0; p < paragraphs.length; p++) {
      const words = paragraphs[p].split(' ');
      let currentLine = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = words[n];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    const totalTextBlockHeight = lines.length * lineHeight;
    const startY = Math.max(
      topKickerY + 95,
      Math.round((H - totalTextBlockHeight) / 2) - 20
    );

    // Subtle quotation mark accent above quote
    ctx.save();
    ctx.font = `italic 700 ${Math.round(baseFontSize * 1.4)}px "Playfair Display", Georgia, serif`;
    ctx.fillStyle = theme.muted;
    ctx.globalAlpha = 0.35;
    ctx.fillText('“', textX, startY - Math.round(baseFontSize * 0.45));
    ctx.restore();

    lines.forEach((line, index) => {
      ctx.fillText(line, textX, startY + index * lineHeight);
    });

    // 6. Author Attribution & Hairline Rule
    const authorY = startY + lines.length * lineHeight + 56;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (config.alignment === 'center') {
      ctx.moveTo(W / 2 - 48, authorY - 34);
      ctx.lineTo(W / 2 + 48, authorY - 34);
    } else {
      ctx.moveTo(innerPad, authorY - 34);
      ctx.lineTo(innerPad + 96, authorY - 34);
    }
    ctx.stroke();

    ctx.font = `600 28px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = theme.fg;
    ctx.fillText(`— ${config.authorText || 'Anonymous'}`, textX, authorY);
    ctx.restore();

    // 7. Bottom Watermark
    if (config.showWatermark && config.watermarkText.trim()) {
      ctx.save();
      ctx.font = `500 18px "JetBrains Mono", monospace`;
      ctx.fillStyle = theme.muted;
      ctx.textAlign = config.alignment;
      ctx.fillText(
        config.watermarkText.toUpperCase(),
        textX,
        H - innerPad
      );
      ctx.restore();
    }
  }, [config]);

  const executeDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeAuthor = (config.authorText || 'auraquote')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      link.download = `auraquote-${safeAuthor}-${config.aspectRatio.replace(':', 'x')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportedNotice(true);
      setTimeout(() => setExportedNotice(false), 3000);
    } catch (err) {
      console.error('Canvas export error:', err);
    }
  };

  const handleDownloadClick = () => {
    onRequestCanvasExport(executeDownloadPng);
  };

  const handleSaveToVaultClick = () => {
    if (!config.quoteText.trim()) return;
    onSaveCustomAsQuote(config.quoteText.trim(), config.authorText.trim() || 'Personal Reflection');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <section id="studio" className="py-16 md:py-24 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mb-2">
              03 · Built-In Creative Studio
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-white tracking-tight">
              Quote-to-Image Typography Canvas
            </h2>
          </div>
          <p className="text-sm text-[#E0E0E0] max-w-md leading-relaxed">
            Transform any archival quote or your own personal reflection into a high-contrast monograph print, social story, or phone wallpaper.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Live High-DPI Canvas Preview */}
          <div className="lg:col-span-7 bg-[#121212] border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between text-xs text-neutral-400 mb-4 pb-3 border-b border-neutral-800/80">
              <span>Live High-DPI Render Preview</span>
              <span className="font-mono tabular-nums">
                {ASPECT_RATIOS.find((r) => r.id === config.aspectRatio)?.width} ×{' '}
                {ASPECT_RATIOS.find((r) => r.id === config.aspectRatio)?.height} px · PNG
              </span>
            </div>

            <div className="w-full flex items-center justify-center py-2 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[540px] w-auto max-w-full rounded-lg shadow-2xl border border-neutral-800 object-contain transition-all duration-150"
              />
            </div>

            <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      quoteText: selectedQuote.text,
                      authorText: selectedQuote.author,
                      originSubtext: `${selectedQuote.originLocation} · ${selectedQuote.accessionNumber}`,
                      themeId: 'pitch-black',
                      aspectRatio: '4:5',
                      fontStyle: 'serif',
                      alignment: 'left',
                      fontSizeScale: 1,
                      showFrameBorder: true,
                      showWatermark: true,
                      watermarkText: 'AURAQUOTE · TIMELESS WISDOM. MODERN REFLECTION.',
                      showNoiseTexture: true,
                    })
                  }
                  className="px-3.5 py-2 min-h-[40px] rounded-lg border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveToVaultClick}
                  className="px-3.5 py-2 min-h-[40px] rounded-lg border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {savedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Saved to Vault</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save Text to Vault</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadClick}
                className="px-5 py-2.5 min-h-[44px] rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {exportedNotice ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>High-Res PNG Exported</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download High-Res PNG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Customizer Control Panel */}
          <div className="lg:col-span-5 bg-[#121212] border border-neutral-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sliders className="w-4 h-4 text-neutral-400" />
              <h3 className="text-base font-serif font-semibold text-white">
                Monograph Customizer Controls
              </h3>
            </div>

            {/* Quote & Author Inputs */}
            <div className="space-y-3">
              <div>
                <label htmlFor="canvas-quote-input" className="block text-xs font-medium text-[#E0E0E0] mb-1.5">
                  Quote or Custom Reflection Text
                </label>
                <textarea
                  id="canvas-quote-input"
                  rows={3}
                  value={config.quoteText}
                  onChange={(e) => setConfig((prev) => ({ ...prev, quoteText: e.target.value }))}
                  placeholder="Enter a quote or compose your own aphorism..."
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="canvas-author-input" className="block text-xs font-medium text-[#E0E0E0] mb-1.5">
                    Author / Attribution
                  </label>
                  <input
                    id="canvas-author-input"
                    type="text"
                    value={config.authorText}
                    onChange={(e) => setConfig((prev) => ({ ...prev, authorText: e.target.value }))}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="canvas-origin-input" className="block text-xs font-medium text-[#E0E0E0] mb-1.5">
                    Header Kicker / Provenance
                  </label>
                  <input
                    id="canvas-origin-input"
                    type="text"
                    value={config.originSubtext}
                    onChange={(e) => setConfig((prev) => ({ ...prev, originSubtext: e.target.value }))}
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-medium text-[#E0E0E0] mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Canvas Aspect Ratio & Format</span>
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: ratio.id }))}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      config.aspectRatio === ratio.id
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <div className="text-xs font-semibold whitespace-nowrap">{ratio.label}</div>
                    <div
                      className={`text-[11px] truncate ${
                        config.aspectRatio === ratio.id ? 'text-neutral-700' : 'text-neutral-500'
                      }`}
                    >
                      {ratio.useCase}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monochrome & Archival Color Themes */}
            <div>
              <label className="block text-xs font-medium text-[#E0E0E0] mb-2">
                Monochrome & Archival Surface Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, themeId: theme.id }))}
                    className={`flex items-center gap-2.5 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      config.themeId === theme.id
                        ? 'border-white bg-neutral-900 text-white'
                        : 'border-neutral-800 bg-black text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-neutral-600 shrink-0"
                      style={{ backgroundColor: theme.bg }}
                    />
                    <span className="truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Pairing & Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#E0E0E0] mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <TypeIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Typeface Style</span>
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'serif', label: 'Playfair Serif' },
                      { id: 'italic-serif', label: 'Italic Monograph' },
                      { id: 'sans', label: 'Modern Sans' },
                      { id: 'mono', label: 'Archival Mono' },
                    ] as { id: CanvasFontStyle; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, fontStyle: f.id }))}
                      className={`px-2.5 py-2 min-h-[38px] rounded-lg text-xs font-medium border transition-colors whitespace-nowrap truncate cursor-pointer ${
                        config.fontStyle === f.id
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E0E0E0] mb-2">
                  Alignment & Scale ({Math.round(config.fontSizeScale * 100)}%)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {(
                    [
                      { id: 'left', label: 'Left Editorial', icon: AlignLeft },
                      { id: 'center', label: 'Centered', icon: AlignCenter },
                    ] as { id: CanvasAlignment; label: string; icon: React.FC<{ className?: string }> }[]
                  ).map((align) => {
                    const IconComp = align.icon;
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, alignment: align.id }))}
                        className={`flex-1 px-2.5 py-2 min-h-[38px] rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                          config.alignment === align.id
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{align.label}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.35"
                  step="0.05"
                  aria-label="Font size scale"
                  value={config.fontSizeScale}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, fontSizeScale: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            </div>

            {/* Watermark & Architectural Frame Toggles */}
            <div className="pt-2 border-t border-neutral-800 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, showFrameBorder: !prev.showFrameBorder }))
                  }
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    config.showFrameBorder
                      ? 'bg-neutral-800 text-white border-neutral-600'
                      : 'bg-black text-neutral-500 border-neutral-800'
                  }`}
                >
                  Frame Border: {config.showFrameBorder ? 'On' : 'Off'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, showNoiseTexture: !prev.showNoiseTexture }))
                  }
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    config.showNoiseTexture
                      ? 'bg-neutral-800 text-white border-neutral-600'
                      : 'bg-black text-neutral-500 border-neutral-800'
                  }`}
                >
                  Architectural Grid: {config.showNoiseTexture ? 'On' : 'Off'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({ ...prev, showWatermark: !prev.showWatermark }))
                  }
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    config.showWatermark
                      ? 'bg-neutral-800 text-white border-neutral-600'
                      : 'bg-black text-neutral-500 border-neutral-800'
                  }`}
                >
                  Watermark: {config.showWatermark ? 'On' : 'Off'}
                </button>
              </div>

              {config.showWatermark && (
                <div>
                  <label htmlFor="watermark-input" className="block text-xs text-neutral-400 mb-1">
                    Custom Watermark / Studio Signature
                  </label>
                  <input
                    id="watermark-input"
                    type="text"
                    value={config.watermarkText}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, watermarkText: e.target.value }))
                    }
                    className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none focus:border-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
