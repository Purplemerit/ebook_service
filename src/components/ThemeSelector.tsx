import React from 'react';
import { EBOOK_THEMES } from '../themes/themeConfig';
import type { ThemeId } from '../themes/types';

export type { ThemeId };
export type ThemeOption = (typeof EBOOK_THEMES)[number];

interface ThemeSelectorProps {
  selectedTheme: string;
  onChangeTheme: (themeId: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onChangeTheme }) => {
  return (
    <div className="celestial-theme-grid">
      {EBOOK_THEMES.map((theme) => {
        const isSelected = selectedTheme === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => onChangeTheme(theme.id)}
            type="button"
            className={`celestial-theme-card${isSelected ? ' selected' : ''}`}
          >
            <div>
              <div className="flex justify-between items-center gap-2">
                <span className="celestial-theme-card-name">{theme.name}</span>
                {isSelected && <span className="celestial-theme-card-badge">Active</span>}
              </div>
              <p className="celestial-theme-card-desc">{theme.description}</p>
            </div>

            <div>
              <div className="celestial-theme-swatches">
                {theme.paletteColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="celestial-theme-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="celestial-theme-fonts">
                <span className="truncate">{theme.fontHeader}</span>
                <span style={{ opacity: 0.35 }}>|</span>
                <span className="truncate">{theme.fontBody}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
