import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { searchCourse } from '../api/client';
import { renderIcon } from '../engine/Stage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (lessonId: string, stepIndex: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchCourse(query.trim(), lang).then((res) => {
        setResults(res);
        setSelectedIndex(0);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [query, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        const item = results[selectedIndex];
        onSelectResult(item.lessonId, item.stepIndex || 0);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-backdrop" onClick={onClose}>
      <div className="search-dialog" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="search-input-wrap">
          <span dangerouslySetInnerHTML={{ __html: renderIcon('search', { size: 18, stroke: 2 }) }} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={t('Search lessons & concepts…')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="search-esc" onClick={onClose}>Esc</kbd>
        </div>

        <div className="search-results">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  className={`search-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onSelectResult(item.lessonId, item.stepIndex || 0);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="search-item__header">
                    <span
                      className="search-item__icon"
                      dangerouslySetInnerHTML={{
                        __html: renderIcon(item.kind === 'lesson' ? 'book' : 'layers', { size: 15 })
                      }}
                    />
                    <b className="search-item__title">{item.title}</b>
                    <span className="search-item__badge">{t(item.kind)}</span>
                  </div>
                  {item.snippet && <p className="search-item__snippet">{item.snippet}</p>}
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="search-empty">
              {t('No results found for "{q}"', { q: query })}
            </div>
          ) : (
            <div className="search-hint">
              {t('Type to search for load balancing, caching, sharding, consensus, and more…')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

