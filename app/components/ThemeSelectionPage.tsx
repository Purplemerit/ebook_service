'use client';

import React from 'react';
import { EBOOK_THEMES } from '@/lib/themes/themeConfig';
import type { ThemeId } from '@/lib/themes/types';
import { PageLayout } from './PageLayout';
import type { EbookSection } from '@/lib/utils/pdfParser';
import { ArrowLeft, ArrowRight, Palette, Sparkles, Check, BookOpen } from 'lucide-react';
import './landing.css';

export type ThemeOption = (typeof EBOOK_THEMES)[number];

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

const renderThemePreview = (
  theme: ThemeOption,
  section?: EbookSection,
  bookTitle?: string,
  totalPages?: number,
  pageIndex?: number
) => {
  if (section) {
    return (
      <div className="celestial-theme-preview" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'inherit' }}>
          <div
            className={`theme-${theme.id}`}
            style={{
              width: '794px',
              height: '1123px',
              transform: 'scale(0.18)',
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none'
            }}
          >
            <PageLayout
              section={section}
              pageIndex={pageIndex ?? 1}
              totalPages={totalPages ?? 1}
              bookTitle={bookTitle ?? ''}
              selectedTheme={theme.id as ThemeId}
              onUpdateSection={() => {}}
              onDeleteSection={() => {}}
              onRegenerateImage={async () => {}}
              isGeneratingImage={false}
              isActive={false}
            />
          </div>
        </div>
      </div>
    );
  }

  const previewStyle = {
    backgroundColor: theme.bgColor,
    color: theme.textColor,
    borderColor: theme.accentColor,
    '--theme-accent': theme.accentColor,
    '--theme-bg': theme.bgColor,
  } as React.CSSProperties;

  const fontHeaderStyle = { fontFamily: `${theme.fontHeader}, serif` };
  const fontBodyStyle = { fontFamily: `${theme.fontBody}, sans-serif` };

  switch (theme.id) {
    case 'editorial':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-sticker" />
            <div className="mini-arch" />
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.82rem', fontWeight: 'bold', margin: '0 auto 4px', textAlign: 'center', lineHeight: 1.1 }}>Cosmos</h4>
            <p style={{ ...fontBodyStyle, fontSize: '0.52rem', opacity: 0.85, textAlign: 'center', lineHeight: 1.3, padding: '0 4px' }}>Terracotta margins & organic boho elements.</p>
          </div>
        </div>
      );
    case 'wanderlust':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-wl-grid">
              <div className="mini-wl-photo" />
              <div className="mini-wl-content" style={{ padding: '2px 0' }}>
                <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 4px', lineHeight: 1.1 }}>Explore</h4>
                <p style={{ ...fontBodyStyle, fontSize: '0.5rem', opacity: 0.85, lineHeight: 1.25 }}>Teal headings & custom editorial travel spreads.</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 'softpink':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-sp-island">
              <div className="mini-sp-photo" />
              <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '2px 0', lineHeight: 1.1, textAlign: 'center' }}>Dreams</h4>
              <p style={{ ...fontBodyStyle, fontSize: '0.48rem', opacity: 0.85, lineHeight: 1.2, textAlign: 'center' }}>Feminine lifestyle with blush rose accents.</p>
            </div>
          </div>
        </div>
      );
    case 'comic':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-comic-grid">
              <div className="mini-comic-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                <span style={{ ...fontHeaderStyle, fontSize: '0.55rem', fontWeight: '900', color: '#1a1a1a', transform: 'rotate(-5deg)' }}>POW!</span>
              </div>
              <div className="mini-comic-panel">
                <div className="mini-comic-burst" />
              </div>
              <div className="mini-comic-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px', gridColumn: 'span 2' }}>
                <h4 style={{ ...fontHeaderStyle, fontSize: '0.75rem', fontWeight: '900', margin: '0 0 2px', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Action!</h4>
                <p style={{ ...fontBodyStyle, fontSize: '0.48rem', opacity: 0.9, color: '#fff', lineHeight: 1.2 }}>Bold action banners & halftone retro grids.</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 'sporty':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-sporty-bar" />
            <div className="mini-sporty-content">
              <div className="mini-sporty-photo" />
              <div style={{ paddingBottom: '4px' }}>
                <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 2px', lineHeight: 1 }}>Athletes</h4>
                <p style={{ ...fontBodyStyle, fontSize: '0.48rem', opacity: 0.85, lineHeight: 1.2 }}>High energy sports editorial alignments.</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 'wellness':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout mini-wellness-layout" style={fontBodyStyle}>
            <div className="mini-wellness-banner" style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '0.42rem', fontWeight: 'bold', opacity: 0.7 }}>EMOCALM</span>
            </div>
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '2px 0 0', lineHeight: 1.1 }}>Serene</h4>
            <div className="mini-wellness-grid">
              <div className="mini-wellness-leaf" />
              <div style={{ flex: 1 }}>
                <p style={{ ...fontBodyStyle, fontSize: '0.48rem', opacity: 0.85, lineHeight: 1.2 }}>Botanical leaves & emerald wellness guidelines.</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 'newspaper':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-news-header" style={fontHeaderStyle}>THE GAZETTE</div>
            <div className="mini-news-circles">
              <div className="mini-news-circle" />
              <div className="mini-news-circle" style={{ backgroundColor: '#fde68a' }} />
              <div className="mini-news-circle" style={{ backgroundColor: '#fbcfe8' }} />
            </div>
            <div className="mini-news-cols" style={{ padding: '0 2px' }}>
              <div>
                <h5 style={{ ...fontHeaderStyle, fontSize: '0.52rem', fontWeight: 'bold', margin: '0 0 1px' }}>Editorial</h5>
                <p style={{ ...fontBodyStyle, fontSize: '0.4rem', opacity: 0.8, lineHeight: 1.2 }}>Classic double column grid layout styles.</p>
              </div>
              <div>
                <h5 style={{ ...fontHeaderStyle, fontSize: '0.52rem', fontWeight: 'bold', margin: '0 0 1px' }}>Latest</h5>
                <p style={{ ...fontBodyStyle, fontSize: '0.4rem', opacity: 0.8, lineHeight: 1.2 }}>Traditional rule dividers and alignments.</p>
              </div>
            </div>
          </div>
        </div>
      );
    case 'botanical':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-botanical-border" />
            <div className="mini-botanical-content" style={{ padding: '8px' }}>
              <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 4px', lineHeight: 1.1, textAlign: 'center' }}>Foliage</h4>
              <div style={{ height: '52px', backgroundColor: theme.paletteColors[1] || '#a3b19b', opacity: 0.6, borderRadius: '4px', marginBottom: '6px' }} />
              <p style={{ ...fontBodyStyle, fontSize: '0.48rem', opacity: 0.85, lineHeight: 1.25, textAlign: 'center' }}>Double border styling with organic greens.</p>
            </div>
          </div>
        </div>
      );
    case 'modern':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-modern-header" />
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 4px', lineHeight: 1.1 }}>Concept</h4>
            <p style={{ ...fontBodyStyle, fontSize: '0.48rem', opacity: 0.85, lineHeight: 1.25, marginBottom: '6px' }}>Clean minimalist canvas & sans-serif body.</p>
            <div className="mini-modern-grid">
              <div className="mini-modern-card" />
              <div className="mini-modern-card" />
            </div>
          </div>
        </div>
      );
    case 'noir':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-noir-border" />
            <div className="mini-noir-dots">
              <div className="mini-noir-dot" />
              <div className="mini-noir-dot" />
            </div>
            <div style={{ padding: '12px 8px 8px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 2px', lineHeight: 1.1, color: '#d4af37' }}>Midnight</h4>
                <p style={{ ...fontBodyStyle, fontSize: '0.46rem', opacity: 0.8, lineHeight: 1.2 }}>High contrast noir design with gold borders.</p>
              </div>
              <div style={{ height: '40px', backgroundColor: '#1e202b', border: '0.5px solid #d4af37', opacity: 0.8, borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      );
    case 'bloodred':
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <div className="mini-bloodred-header">
              <span className="mini-bloodred-num">01</span>
              <span className="mini-bloodred-label">CH</span>
            </div>
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.75rem', fontWeight: 'bold', margin: '4px 0 2px', lineHeight: 1.1, color: theme.accentColor }}>Scarlet</h4>
            <p style={{ ...fontBodyStyle, fontSize: '0.46rem', opacity: 0.85, lineHeight: 1.2 }}>Crimson headers, large chapter digits, serif spreads.</p>
          </div>
        </div>
      );
    case 'minimalblack':
      return (
        <div className="celestial-theme-preview" style={{ ...previewStyle, backgroundColor: '#000000', color: '#ffffff', borderColor: '#333333' }}>
          <div className="mini-layout" style={{ ...fontBodyStyle, justifyContent: 'space-between', padding: '8px 4px 6px', alignItems: 'center', height: '100%' }}>
            <span style={{ fontSize: '0.4rem', fontWeight: 'bold', letterSpacing: '0.15em', opacity: 0.6 }}>MINIMAL</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <h4 style={{ ...fontHeaderStyle, fontSize: '0.72rem', fontWeight: 'bold', margin: 0, textAlign: 'center', color: '#ffffff', lineHeight: 1.1 }}>Book Title</h4>
              <div style={{ width: '12px', height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: '0.42rem', letterSpacing: '0.1em', opacity: 0.8 }}>AUTHOR</span>
            </div>
            <span style={{ fontSize: '0.4rem', letterSpacing: '0.1em', opacity: 0.4 }}>EDITION</span>
          </div>
        </div>
      );
    case 'rose':
      return (
        <div className="celestial-theme-preview" style={{ ...previewStyle, backgroundColor: '#fef9fa', color: '#2e1018', borderColor: '#f3d2c1' }}>
          <div className="mini-layout" style={{ ...fontBodyStyle, justifyContent: 'space-between', padding: '8px 4px 6px', alignItems: 'center', height: '100%' }}>
            <span style={{ fontSize: '0.42rem', fontWeight: 'bold', color: 'var(--theme-accent)', opacity: 0.8 }}>✿ ROSE ✿</span>
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '2px 0', textAlign: 'center', lineHeight: 1.1 }}>Feminine</h4>
            <p style={{ ...fontBodyStyle, fontSize: '0.45rem', opacity: 0.85, textAlign: 'center', lineHeight: 1.25 }}>Burgundy accents, script fonts, and floral graphics.</p>
          </div>
        </div>
      );
    case 'lavender':
      return (
        <div className="celestial-theme-preview" style={{ ...previewStyle, backgroundColor: '#f3f0f7', color: '#1f1633', borderColor: '#b39ddb' }}>
          <div className="mini-layout" style={{ ...fontBodyStyle, justifyContent: 'space-between', padding: '8px 4px 6px', alignItems: 'center', height: '100%' }}>
            <span style={{ fontSize: '0.4rem', fontWeight: 'bold', letterSpacing: '0.1em', opacity: 0.6 }}>LAVENDER</span>
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.82rem', fontWeight: 'bold', margin: '2px 0', textAlign: 'center', color: 'var(--theme-accent)', lineHeight: 1.1 }}>Serene</h4>
            <p style={{ ...fontBodyStyle, fontSize: '0.45rem', opacity: 0.85, textAlign: 'center', lineHeight: 1.25 }}>Elegant serif headings, diagrams, and soft purple spreads.</p>
          </div>
        </div>
      );
    case 'bolddark':
      return (
        <div className="celestial-theme-preview" style={{ ...previewStyle, backgroundColor: '#000000', color: '#ffffff', borderColor: '#262626' }}>
          <div className="mini-layout" style={{ ...fontBodyStyle, justifyContent: 'space-between', padding: '8px 4px 6px', alignItems: 'center', height: '100%' }}>
            <span style={{ fontSize: '0.42rem', fontWeight: 'bold', letterSpacing: '0.15em' }}>GRID</span>
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.82rem', fontWeight: 'bold', margin: '2px 0', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 }}>Bold Dark</h4>
            <p style={{ ...fontBodyStyle, fontSize: '0.45rem', opacity: 0.8, textAlign: 'center', lineHeight: 1.25 }}>Pure black theme, sans-serif titles, and pricing tables.</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="celestial-theme-preview" style={previewStyle}>
          <div className="mini-layout" style={fontBodyStyle}>
            <h4 style={{ ...fontHeaderStyle, fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 4px' }}>E-Book</h4>
            <p style={{ ...fontBodyStyle, fontSize: '0.48rem', opacity: 0.85, lineHeight: 1.2 }}>Standard layout style and typography preview.</p>
          </div>
        </div>
      );
  }
};

interface ThemeSelectionPageProps {
  sections: EbookSection[];
  bookTitle: string;
  selectedTheme: ThemeId;
  onChangeTheme: (themeId: ThemeId) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ThemeSelectionPage: React.FC<ThemeSelectionPageProps> = ({
  sections,
  bookTitle,
  selectedTheme,
  onChangeTheme,
  onNext,
  onBack,
}) => {
  // Show the fourth page of the PDF (index 3) in the theme preview if available,
  // otherwise fallback to index 0.
  const previewIndex = sections && sections.length >= 4 ? 3 : 0;
  const currentSection = sections && sections[previewIndex];
  const totalPages = sections ? sections.length : 1;
  const pageIndex = previewIndex + 1;

  return (
    <div className="celestial-landing flex flex-col min-h-screen">
      <div className="celestial-bg-blob celestial-bg-blob-1" aria-hidden />
      <div className="celestial-bg-blob celestial-bg-blob-2" aria-hidden />
      <div className="celestial-bg-blob celestial-bg-blob-3" aria-hidden />

      <header className="celestial-header shrink-0">
        <div className="celestial-logo" onClick={onBack} role="button" tabIndex={0}>
          <Palette size={18} strokeWidth={1.5} />
          <span>E-Book Studio &mdash; Theme Selection</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="celestial-nav-cta flex items-center gap-1.5"
            onClick={onBack}
          >
            <ArrowLeft size={14} />
            <span>Upload Page</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-10 relative z-10 overflow-y-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-slate-900/5 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            <Sparkles size={12} className="text-indigo-500 animate-pulse" />
            <span>Step 2: Choose E-Book Aesthetic</span>
          </div>
          <h1 className="celestial-headline !text-4xl md:!text-5xl !leading-tight tracking-tight mb-4 font-serif">
            Select Your Book Theme
          </h1>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans">
            Choose a foundation layout. Each theme formats typography, margins, backgrounds, and margins automatically to give your e-book a polished feel. You can customize detailed styles later.
          </p>
        </div>

        {/* Theme Grid */}
        <div className="celestial-themes-grid-page">
          {EBOOK_THEMES.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => onChangeTheme(theme.id as ThemeId)}
                className={`celestial-theme-card-page ${isSelected ? 'selected' : ''}`}
              >
                <div className="card-top-header">
                  <div className="flex justify-between items-center gap-3">
                    <h3 className="theme-card-title">{theme.name}</h3>
                    {isSelected && (
                      <span className="theme-card-active-badge flex items-center gap-1">
                        <Check size={10} strokeWidth={3} />
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="theme-card-description">{theme.description}</p>
                </div>

                <div className="card-preview-area flex-1 flex items-center justify-center py-4 bg-slate-950/5 rounded-xl border border-black/5 mb-4">
                  {renderThemePreview(theme, currentSection, bookTitle, totalPages, pageIndex)}
                </div>

                <div className="card-footer-info border-t border-slate-200/50 pt-3 flex items-center justify-between">
                  <div className="celestial-theme-swatches">
                    {theme.paletteColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="celestial-theme-swatch !w-3 h-3"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="celestial-theme-fonts text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <span className="truncate max-w-[70px]">{theme.fontHeader}</span>
                    <span style={{ opacity: 0.35 }}>|</span>
                    <span className="truncate max-w-[70px]">{theme.fontBody}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-24" aria-hidden /> {/* spacing for sticky bottom bar */}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 md:px-12 bg-white/80 backdrop-blur-lg border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50 flex items-center justify-between no-print">
        <button
          type="button"
          onClick={onBack}
          className="celestial-btn-secondary !py-2.5 !px-5 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Upload</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Active Choice</span>
            <span className="text-xs font-bold text-slate-800">
              {EBOOK_THEMES.find(t => t.id === selectedTheme)?.name || 'Default'}
            </span>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="celestial-btn-primary !py-2.5 !px-6 flex items-center gap-2 shadow-lg"
          >
            <span>Proceed to Studio</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
