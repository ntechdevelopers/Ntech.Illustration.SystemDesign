import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchI18n } from '../api/client';
import { setStageTranslation } from '../engine/Stage';

export type Language = 'en' | 'vi';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dict: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: (k) => k,
  dict: {}
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const urlParam = new URLSearchParams(window.location.search).get('lang');
      if (urlParam === 'vi' || urlParam === 'en') return urlParam;
      const explicit = localStorage.getItem('sdt:lang_explicit');
      if (explicit === 'true') {
        const stored = localStorage.getItem('sdt:lang');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed === 'vi' || parsed === 'en') return parsed;
        }
      }
    } catch {}
    return 'vi'; // Default to Vietnamese
  });

  const [dict, setDict] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchI18n(lang).then((d) => {
      setDict(d);
      setStageTranslation(lang, d);
    });

    localStorage.setItem('sdt:lang', JSON.stringify(lang));
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('sdt:lang_explicit', 'true');
    localStorage.setItem('sdt:lang', JSON.stringify(newLang));
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.replaceState({}, '', url.toString());
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!key) return '';
    let str = (lang === 'vi' && dict[key]) ? dict[key] : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dict }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
