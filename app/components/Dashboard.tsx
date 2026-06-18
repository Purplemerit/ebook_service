import React, { useState } from 'react';
import { ThemeSelector } from './ThemeSelector';
import { EBOOK_THEMES } from '@/lib/themes/themeConfig';
import type { ThemeId } from '@/lib/themes/types';
import type { GroqConfig } from '@/lib/utils/groqHelper';
import type { EbookSection } from '@/lib/utils/pdfParser';

const HEADING_FONTS = [
  { name: 'Theme Default', value: '' },
  { name: 'Playfair Display (Serif)', value: 'Playfair Display' },
  { name: 'Lora (Serif)', value: 'Lora' },
  { name: 'Cinzel (Serif)', value: 'Cinzel' },
  { name: 'Cormorant Garamond (Serif)', value: 'Cormorant Garamond' },
  { name: 'EB Garamond (Serif)', value: 'EB Garamond' },
  { name: 'Montserrat (Sans-Serif)', value: 'Montserrat' },
  { name: 'Outfit (Sans-Serif)', value: 'Outfit' },
  { name: 'Poppins (Sans-Serif)', value: 'Poppins' },
  { name: 'Pacifico (Cursive)', value: 'Pacifico' },
  { name: 'Dancing Script (Cursive)', value: 'Dancing Script' },
  { name: 'Sacramento (Cursive)', value: 'Sacramento' },
];

const BODY_FONTS = [
  { name: 'Theme Default', value: '' },
  { name: 'Lora (Serif)', value: 'Lora' },
  { name: 'Merriweather (Serif)', value: 'Merriweather' },
  { name: 'EB Garamond (Serif)', value: 'EB Garamond' },
  { name: 'Cormorant Garamond (Serif)', value: 'Cormorant Garamond' },
  { name: 'Inter (Sans-Serif)', value: 'Inter' },
  { name: 'Roboto (Sans-Serif)', value: 'Roboto' },
  { name: 'Poppins (Sans-Serif)', value: 'Poppins' },
  { name: 'Outfit (Sans-Serif)', value: 'Outfit' },
];

const COLOR_PRESETS = [
  { name: 'Vintage Beige', bg: '#faf6f0', text: '#3d2314', accent: '#c96f4a' },
  { name: 'Botanical Green', bg: '#edf0ea', text: '#1e291e', accent: '#556b2f' },
  { name: 'Clean Indigo', bg: '#ffffff', text: '#0f172a', accent: '#2563eb' },
  { name: 'Midnight Noir', bg: '#0d0e12', text: '#e2e8f0', accent: '#d4af37' },
  { name: 'Soft Rose', bg: '#fff5f5', text: '#2d1515', accent: '#e05a5a' },
];
import {
  Sparkles,
  Palette,
  Plus,
  Moon,
  ArrowRight,
  HelpCircle,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import './landing.css';

const stripHtml = (html: string): string => {
  if (!html) return '';
  const withNewlines = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/div>/gi, '\n');
  const tmp = document.createElement('div');
  tmp.innerHTML = withNewlines;
  return tmp.textContent || tmp.innerText || '';
};

interface DashboardProps {
  bookTitle: string;
  onChangeTitle: (title: string) => void;
  sections: EbookSection[];
  groqConfig: GroqConfig;
  selectedTheme: ThemeId;
  onChangeTheme: (themeId: ThemeId) => void;
  customBgColor: string;
  onChangeBgColor: (color: string) => void;
  customTextColor: string;
  onChangeTextColor: (color: string) => void;
  customAccentColor: string;
  onChangeAccentColor: (color: string) => void;
  customFontHeader: string;
  onChangeFontHeader: (font: string) => void;
  customFontBody: string;
  onChangeFontBody: (font: string) => void;
  customFontSizeMult: number;
  onChangeFontSizeMult: (mult: number) => void;
  onStyleChapters: (style: string) => Promise<void>;
  isStyling: boolean;
  onAddPage: () => void;
  activePageIndex: number;
  onSelectPage: (idx: number) => void;
  onUpdateSection: (index: number, updated: EbookSection) => void;
  onDownloadPDF: () => void;
  isExporting: boolean;
  exportProgress?: { current: number; total: number };
  onNavigateToThemes: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  bookTitle,
  onChangeTitle,
  sections,
  groqConfig,
  selectedTheme,
  onChangeTheme,
  customBgColor,
  onChangeBgColor,
  customTextColor,
  onChangeTextColor,
  customAccentColor,
  onChangeAccentColor,
  customFontHeader,
  onChangeFontHeader,
  customFontBody,
  onChangeFontBody,
  customFontSizeMult,
  onChangeFontSizeMult,
  onStyleChapters,
  isStyling,
  onAddPage,
  activePageIndex,
  onSelectPage,
  onUpdateSection,
  onDownloadPDF,
  isExporting,
  exportProgress,
  onNavigateToThemes,
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'outline'>('style');
  const [selectedStyle, setSelectedStyle] = useState('Poetic & Artistic');



  const STYLING_PRESETS = [
    { name: 'Poetic & Artistic', desc: 'Flowery, imagery-rich, descriptive prose.' },
    { name: 'Dramatic Novel', desc: 'Engaging, narrative-driven novel pacing.' },
    { name: 'Vintage Journal', desc: 'Old-world tone resembling a 19th-century explorer.' },
    { name: 'Minimalist Clean', desc: 'Punchy, brief, impactful statements.' },
    { name: 'Academic / Informative', desc: 'Clear, objective, and analytically structured.' },
  ];

  return (
    <div className="celestial-studio w-full md:w-[400px] flex flex-col h-full overflow-hidden no-print">
      {/* Header */}
      <div className="celestial-studio-header flex items-center justify-between gap-3">
        <div className="hidden md:block min-w-0">
          <div className="celestial-studio-brand flex items-center gap-2">
            <Moon size={16} strokeWidth={1.5} />
            <span>
              E-Book <em>Studio</em>
            </span>
          </div>
          <p className="celestial-studio-sub">Import, style &amp; publish your stories</p>
        </div>
        <div className="md:hidden">
          <span className="celestial-studio-brand text-sm">Dashboard</span>
        </div>

        <div className="celestial-studio-status shrink-0">
          <span
            className={`celestial-studio-status-dot${sections.length > 0 ? ' ready' : ''}`}
          />
          <span>{sections.length > 0 ? 'Ready' : 'Empty'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="celestial-studio-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          disabled={sections.length === 0}
          className={`celestial-studio-tab${activeTab === 'style' ? ' active' : ''}`}
        >
          <Palette size={13} />
          <span className="hidden sm:inline">Stylist</span>
          <span className="inline sm:hidden">Style</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('outline')}
          disabled={sections.length === 0}
          className={`celestial-studio-tab${activeTab === 'outline' ? ' active' : ''}`}
        >
          <BookOpen size={13} />
          <span>Pages ({sections.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="celestial-studio-content space-y-6">
        {activeTab === 'style' && (
          <div className="space-y-6 animate-fade-in">
            {sections.length > 0 && (
              <div className="celestial-studio-banner">
                <CheckCircle size={15} className="shrink-0" />
                <span className="truncate">
                  Loaded {sections.length} pages — choose your theme below
                </span>
              </div>
            )}

            {sections.length > 0 && (
              <div className="celestial-studio-section">
                <label className="celestial-studio-label">Book Title</label>
                <div className="celestial-studio-panel">
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => onChangeTitle(e.target.value)}
                    className="celestial-studio-input"
                    placeholder="Your e-book title"
                  />
                </div>
              </div>
            )}

            {(() => {
              const activeTheme = EBOOK_THEMES.find((t) => t.id === selectedTheme) || EBOOK_THEMES[0];
              return (
                <div className="celestial-studio-section">
                  <label className="celestial-studio-label">
                    <Palette size={13} />
                    <span>E-Book Design Theme</span>
                  </label>

                  {/* Active Theme Summary Card */}
                  <div className="celestial-studio-panel space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase block mb-0.5">Active Theme</span>
                        <h4 className="font-semibold text-slate-800 text-xs truncate" style={{ fontFamily: 'var(--cel-serif)' }}>{activeTheme.name}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={onNavigateToThemes}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shrink-0 flex items-center gap-1 shadow-sm uppercase tracking-wider"
                      >
                        <Palette size={10} />
                        <span>Change</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">{activeTheme.description}</p>
                    
                    {/* Colors and fonts summary info */}
                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-2.5">
                      <div className="celestial-theme-swatches">
                        {activeTheme.paletteColors.map((color, idx) => (
                          <div
                            key={idx}
                            className="celestial-theme-swatch"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                        <span className="truncate max-w-[65px]">{activeTheme.fontHeader}</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span className="truncate max-w-[65px]">{activeTheme.fontBody}</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Overrides Section directly in Sidebar */}
                  <div className="celestial-studio-panel space-y-4">
                    {/* Colors overrides */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Color Overrides</span>
                      
                      {/* Swatches */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {COLOR_PRESETS.map((preset) => {
                          const isPresetActive = customBgColor === preset.bg && customTextColor === preset.text && customAccentColor === preset.accent;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                onChangeBgColor(preset.bg);
                                onChangeTextColor(preset.text);
                                onChangeAccentColor(preset.accent);
                              }}
                              title={preset.name}
                              className={`px-1.5 py-0.5 rounded-lg text-[9px] font-semibold border flex items-center gap-0.5 transition-all ${
                                isPresetActive
                                  ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: preset.bg }} />
                              <span>{preset.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Color Inputs */}
                      <div className="space-y-2">
                        {/* Background Color */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-slate-500">Background</span>
                          <div className="flex items-center gap-1.5 flex-1 justify-end">
                            <input
                              type="color"
                              value={customBgColor || activeTheme.bgColor}
                              onChange={(e) => onChangeBgColor(e.target.value)}
                              className="w-5 h-5 rounded cursor-pointer border border-slate-200 shrink-0"
                              style={{ padding: 0, outline: 'none' }}
                            />
                            <input
                              type="text"
                              value={customBgColor}
                              onChange={(e) => onChangeBgColor(e.target.value)}
                              placeholder={`Default: ${activeTheme.bgColor}`}
                              className="celestial-studio-input py-0.5 px-1.5 text-[10px] !w-24 h-[1.75rem]"
                              style={{ fontFamily: 'var(--cel-sans)' }}
                            />
                          </div>
                        </div>

                        {/* Text Color */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-slate-500">Text Color</span>
                          <div className="flex items-center gap-1.5 flex-1 justify-end">
                            <input
                              type="color"
                              value={customTextColor || activeTheme.textColor}
                              onChange={(e) => onChangeTextColor(e.target.value)}
                              className="w-5 h-5 rounded cursor-pointer border border-slate-200 shrink-0"
                              style={{ padding: 0, outline: 'none' }}
                            />
                            <input
                              type="text"
                              value={customTextColor}
                              onChange={(e) => onChangeTextColor(e.target.value)}
                              placeholder={`Default: ${activeTheme.textColor}`}
                              className="celestial-studio-input py-0.5 px-1.5 text-[10px] !w-24 h-[1.75rem]"
                              style={{ fontFamily: 'var(--cel-sans)' }}
                            />
                          </div>
                        </div>

                        {/* Accent Color */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-slate-500">Accent Color</span>
                          <div className="flex items-center gap-1.5 flex-1 justify-end">
                            <input
                              type="color"
                              value={customAccentColor || activeTheme.accentColor}
                              onChange={(e) => onChangeAccentColor(e.target.value)}
                              className="w-5 h-5 rounded cursor-pointer border border-slate-200 shrink-0"
                              style={{ padding: 0, outline: 'none' }}
                            />
                            <input
                              type="text"
                              value={customAccentColor}
                              onChange={(e) => onChangeAccentColor(e.target.value)}
                              placeholder={`Default: ${activeTheme.accentColor}`}
                              className="celestial-studio-input py-0.5 px-1.5 text-[10px] !w-24 h-[1.75rem]"
                              style={{ fontFamily: 'var(--cel-sans)' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-t border-slate-200/50" />

                    {/* Typography overrides */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Typography Overrides</span>
                      
                      {/* Size scaling */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-slate-500">Size Scale</span>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/30">
                          {[
                            { label: 'S', val: 0.85 },
                            { label: 'M', val: 1.0 },
                            { label: 'L', val: 1.2 },
                            { label: 'XL', val: 1.4 },
                          ].map((size) => (
                            <button
                              key={size.label}
                              type="button"
                              onClick={() => onChangeFontSizeMult(size.val)}
                              className={`flex-1 py-0.5 rounded text-[9px] font-semibold transition-all ${
                                customFontSizeMult === size.val
                                  ? 'bg-slate-900 text-white shadow'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {size.label} ({size.val}x)
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Header Font style */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-slate-500">Heading Font</span>
                        <select
                          value={customFontHeader}
                          onChange={(e) => onChangeFontHeader(e.target.value)}
                          className="celestial-studio-input text-[11px] py-1 px-2 h-[1.85rem]"
                          style={{ fontFamily: 'var(--cel-sans)' }}
                        >
                          {HEADING_FONTS.map(f => (
                            <option key={f.value} value={f.value}>{f.value === '' ? `Default (${activeTheme.fontHeader})` : f.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Body Font style */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-slate-500">Body Font</span>
                        <select
                          value={customFontBody}
                          onChange={(e) => onChangeFontBody(e.target.value)}
                          className="celestial-studio-input text-[11px] py-1 px-2 h-[1.85rem]"
                          style={{ fontFamily: 'var(--cel-sans)' }}
                        >
                          {BODY_FONTS.map(f => (
                            <option key={f.value} value={f.value}>{f.value === '' ? `Default (${activeTheme.fontBody})` : f.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Reset Button */}
                    {(customBgColor || customTextColor || customAccentColor || customFontHeader || customFontBody || customFontSizeMult !== 1.0) && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onChangeBgColor('');
                            onChangeTextColor('');
                            onChangeAccentColor('');
                            onChangeFontHeader('');
                            onChangeFontBody('');
                            onChangeFontSizeMult(1.0);
                          }}
                          className="w-full text-center py-1.5 text-[9px] font-bold tracking-wider uppercase text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200/30"
                        >
                          Reset Overrides
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* AI Prose Styling */}
            <div className="celestial-studio-section">
              <hr className="celestial-studio-divider" />
              <label className="celestial-studio-label">
                <Sparkles size={13} />
                <span>AI Writing Stylist</span>
              </label>

              <div className="celestial-studio-panel space-y-4">
                <div className="space-y-1.5">
                  <span className="celestial-studio-sub block">Target Writing Style</span>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="celestial-studio-input text-sm"
                    style={{ fontFamily: 'var(--cel-sans)', fontSize: '0.78rem' }}
                  >
                    {STYLING_PRESETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p
                    className="celestial-studio-sub italic mt-1 leading-normal"
                    style={{ letterSpacing: '0.02em' }}
                  >
                    {STYLING_PRESETS.find((p) => p.name === selectedStyle)?.desc}
                  </p>
                </div>

                {!process.env.VITE_POLLINATIONS_API_KEY && (
                  <div
                    className="p-3 rounded-xl flex items-start gap-2.5 text-[11px]"
                    style={{
                      background: 'rgba(254, 243, 199, 0.55)',
                      border: '1px solid rgba(217, 119, 6, 0.25)',
                      color: '#92400e',
                    }}
                  >
                    <HelpCircle size={15} className="shrink-0 mt-0.5" />
                    <span>
                      AI illustrations require <strong>VITE_POLLINATIONS_API_KEY</strong> in your
                      `.env` file. Without it, pages use stock photo fallbacks.
                    </span>
                  </div>
                )}
                {process.env.VITE_POLLINATIONS_API_KEY && (
                  <div
                    className="p-3 rounded-xl flex items-start gap-2.5 text-[11px]"
                    style={{
                      background: 'rgba(237, 233, 254, 0.55)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      color: '#5b21b6',
                    }}
                  >
                    <HelpCircle size={15} className="shrink-0 mt-0.5" />
                    <span>
                      Pollinations AI images need <strong>Pollen credits</strong> on your account at{' '}
                      <strong>enter.pollinations.ai</strong>. If balance is empty, stock photos are
                      used automatically so every image slot still fills.
                    </span>
                  </div>
                )}

                {!groqConfig.apiKey ? (
                  <div
                    className="p-3 rounded-xl flex items-start gap-2.5 text-[11px]"
                    style={{
                      background: 'rgba(237, 233, 254, 0.55)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      color: '#5b21b6',
                    }}
                  >
                    <HelpCircle size={15} className="shrink-0 mt-0.5" />
                    <span>
                      Set <strong>VITE_GROQ_API_KEY</strong> in your `.env` to activate the AI
                      copywriter.
                    </span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onStyleChapters(selectedStyle)}
                      disabled={isStyling}
                      className="celestial-studio-btn-dark w-full"
                    >
                      {isStyling ? (
                        <>
                          <Sparkles size={14} className="animate-spin" />
                          <span>Stylizing Book Pages...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Apply AI Styling &amp; Image Prompts</span>
                        </>
                      )}
                    </button>
                    <div className="celestial-studio-banner" style={{ fontSize: '0.65rem' }}>
                      <CheckCircle size={13} className="shrink-0" />
                      <span>Local API Key Active (VITE_GROQ_API_KEY detected)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('outline')}
                className="celestial-studio-btn-dark"
              >
                <span>Next: E-Book Pages</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'outline' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="celestial-studio-label">Book Pages</label>
              <button
                type="button"
                onClick={onAddPage}
                className="celestial-studio-btn-dark"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.62rem' }}
              >
                <Plus size={13} />
                <span>Add Page</span>
              </button>
            </div>

            <p className="celestial-studio-sub leading-relaxed">
              Select a page to view and edit its content. On smaller screens, the preview opens
              automatically.
            </p>

            <div className="space-y-2">
              {sections.map((sec, idx) => {
                const isActive = activePageIndex === idx;
                return (
                  <button
                    key={sec.id}
                    onClick={() => onSelectPage(idx)}
                    type="button"
                    className="celestial-studio-panel w-full text-left flex items-center justify-between transition-all"
                    style={
                      isActive
                        ? {
                            borderColor: 'var(--cel-text)',
                            background: 'rgba(255,255,255,0.78)',
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded shrink-0"
                        style={{
                          background: 'rgba(255,255,255,0.6)',
                          border: '1px solid rgba(28,28,28,0.08)',
                          color: 'var(--cel-muted)',
                        }}
                      >
                        P. {idx + 1}
                      </span>
                      <div className="truncate">
                        <span
                          className="font-semibold text-xs block truncate"
                          style={{ fontFamily: 'var(--cel-serif)' }}
                        >
                          {sec.title || 'Untitled Page'}
                        </span>
                        <span className="celestial-studio-sub truncate block mt-0.5 italic lowercase">
                          layout: {sec.layout}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      size={12}
                      style={{
                        color: 'var(--cel-muted)',
                        transform: isActive ? 'translateX(2px)' : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {sections[activePageIndex] && (
              <div className="celestial-studio-panel space-y-3">
                <div className="flex items-center justify-between">
                  <span className="celestial-studio-label" style={{ margin: 0 }}>
                    Page {activePageIndex + 1} Content
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectPage(activePageIndex)}
                    className="celestial-studio-sub font-semibold flex items-center gap-1"
                    style={{ color: 'var(--cel-text)', letterSpacing: '0.06em' }}
                  >
                    <span>Open Preview</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
                <div>
                  <span className="celestial-studio-sub block mb-1">Chapter Title</span>
                  <input
                    type="text"
                    value={sections[activePageIndex].title}
                    onChange={(e) =>
                      onUpdateSection(activePageIndex, {
                        ...sections[activePageIndex],
                        title: e.target.value,
                      })
                    }
                    className="celestial-studio-input"
                    style={{ fontSize: '0.82rem' }}
                    placeholder="Chapter title"
                  />
                </div>
                <div>
                  <span className="celestial-studio-sub block mb-1">Chapter Text</span>
                  <textarea
                    value={stripHtml(sections[activePageIndex].content)}
                    onChange={(e) =>
                      onUpdateSection(activePageIndex, {
                        ...sections[activePageIndex],
                        content: e.target.value,
                      })
                    }
                    rows={6}
                    className="celestial-studio-input resize-y leading-relaxed"
                    style={{ fontFamily: 'var(--cel-sans)', fontSize: '0.78rem' }}
                    placeholder="Chapter content..."
                  />
                </div>
              </div>
            )}

            <div className="celestial-studio-section">
              <hr className="celestial-studio-divider" />
              <label className="celestial-studio-label">
                <Sparkles size={13} />
                <span>Export E-Book</span>
              </label>

              <div className="celestial-studio-panel space-y-3">
                <p className="celestial-studio-sub leading-normal">
                  Download a high-quality PDF matching your preview — sharp text, theme, images, and layout.
                </p>
                <button
                  type="button"
                  onClick={onDownloadPDF}
                  disabled={isExporting}
                  className="celestial-studio-btn-dark w-full"
                >
                  {isExporting ? (
                    <>
                      <Sparkles size={14} className="animate-spin" />
                      <span>
                        {exportProgress && exportProgress.total > 0
                          ? `Exporting ${exportProgress.current}/${exportProgress.total}...`
                          : 'Exporting E-Book...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-start pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className="celestial-studio-tab"
                style={{ flex: 'none', padding: '0.5rem 1rem' }}
              >
                <span>Back to Stylist</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="celestial-studio-footer flex items-center justify-between no-print">
        <span className="celestial-studio-footer-brand">E-Book Studio</span>
        <span>Professional PDF Publisher</span>
      </div>
    </div>
  );
};
