import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { renderIcon } from '../engine/Stage';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  isSidebarOpen: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onOpenSearch, isSidebarOpen }) => {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    if (langMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [langMenuOpen]);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

  const navItems = [
    { label: 'Learn', icon: 'book', active: true },
    { label: 'Practice', icon: 'settings', active: false },
    { label: 'Design Lab', icon: 'window', active: false },
    { label: 'Cheatsheets', icon: 'sheets', active: false }
  ];

  return (
    <header className="topbar">
      <button
        className="menu-btn"
        id="menu-btn"
        type="button"
        aria-label={t('Open the course menu')}
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar"
        onClick={onToggleSidebar}
        dangerouslySetInnerHTML={{ __html: renderIcon('menu', { size: 19, stroke: 2.2 }) }}
      />

      <a className="brand" href="#/" aria-label="System Design — home">
        <svg className="logo" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 10.6V15.4M8.2 19.4V15.4H23.8V18.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          <rect x="9" y="2.4" width="14" height="8.6" rx="2.6" fill="#fcd4ad" stroke="currentColor" strokeWidth="1.8" />
          <rect x="2" y="19.4" width="12.4" height="9" rx="2.6" fill="#a9c5e8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M18 20.4V27.2A5.8 2.2 0 0 0 29.6 27.2V20.4Z" fill="#cbbae6" />
          <ellipse cx="23.8" cy="20.4" rx="5.8" ry="2.2" fill="#ece4f6" />
          <path d="M18 20.4V27.2A5.8 2.2 0 0 0 29.6 27.2V20.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <ellipse cx="23.8" cy="20.4" rx="5.8" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span className="brand__name">System <span>Design</span></span>
      </a>

      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`nav__item ${item.active ? 'btn-pop is-active' : ''}`}
            type="button"
            data-nav={item.label}
          >
            <span dangerouslySetInnerHTML={{ __html: renderIcon(item.icon, { size: 17 }) }} />
            <span>{t(item.label)}</span>
          </button>
        ))}
      </nav>

      <button
        className="search"
        id="search-open"
        type="button"
        aria-label={t('Search the course')}
        onClick={onOpenSearch}
      >
        <span dangerouslySetInnerHTML={{ __html: renderIcon('search', { size: 16, stroke: 2 }) }} />
        <span className="search__hint">{t('Search lessons & concepts…')}</span>
        <kbd>{shortcutHint}</kbd>
      </button>

      {/* Language dropdown */}
      <div className="lang" ref={langMenuRef}>
        <button
          className={`lang__btn ${langMenuOpen ? 'is-open' : ''}`}
          id="lang-btn"
          type="button"
          aria-haspopup="menu"
          aria-expanded={langMenuOpen}
          aria-label={`Language: ${lang === 'vi' ? 'Tiếng Việt' : 'English'}`}
          onClick={() => setLangMenuOpen(!langMenuOpen)}
        >
          <span dangerouslySetInnerHTML={{ __html: renderIcon('globe', { size: 16, stroke: 2 }) }} />
          <span className="lang__code">{lang.toUpperCase()}</span>
          <span
            className="lang__chev"
            dangerouslySetInnerHTML={{ __html: renderIcon('chevronDown', { size: 14, stroke: 2.2, cls: 'lang__chev' }) }}
          />
        </button>

        {langMenuOpen && (
          <div className={`lang__menu ${langMenuOpen ? 'is-open' : ''}`} id="lang-menu" role="menu" aria-label={t('Language')}>
            <div className="lang__head">{t('Language')}</div>
            <div className="lang__grid">
              <button
                className={`lang__item ${lang === 'en' ? 'is-on' : ''}`}
                type="button"
                role="menuitemradio"
                aria-checked={lang === 'en'}
                onClick={() => {
                  setLang('en');
                  setLangMenuOpen(false);
                }}
              >
                <span className="lang__tile">
                  {lang === 'en' ? (
                    <span dangerouslySetInnerHTML={{ __html: renderIcon('check', { size: 14, stroke: 3 }) }} />
                  ) : (
                    'EN'
                  )}
                </span>
                <span className="lang__names">
                  <b>English</b>
                  <span>English</span>
                </span>
              </button>

              <button
                className={`lang__item ${lang === 'vi' ? 'is-on' : ''}`}
                type="button"
                role="menuitemradio"
                aria-checked={lang === 'vi'}
                onClick={() => {
                  setLang('vi');
                  setLangMenuOpen(false);
                }}
              >
                <span className="lang__tile">
                  {lang === 'vi' ? (
                    <span dangerouslySetInnerHTML={{ __html: renderIcon('check', { size: 14, stroke: 3 }) }} />
                  ) : (
                    'VI'
                  )}
                </span>
                <span className="lang__names">
                  <b>Tiếng Việt</b>
                  <span>Vietnamese</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        className="theme-btn"
        id="theme-btn"
        type="button"
        aria-label="Toggle dark/light theme"
        onClick={toggleTheme}
        dangerouslySetInnerHTML={{
          __html: theme === 'dark' ? renderIcon('sun', { size: 16 }) : renderIcon('flame', { size: 16 })
        }}
      />

      {/* Credit */}
      <a
        className="credit"
        href="https://x.com/DilumSanjaya"
        target="_blank"
        rel="noopener noreferrer"
        title="Dilum Sanjaya on X"
      >
        <span className="credit__x" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </span>
        <span className="credit__text">
          <small>{t('designed by')}</small>
          <b><span>@DilumSanjaya</span></b>
        </span>
      </a>
    </header>
  );
};
