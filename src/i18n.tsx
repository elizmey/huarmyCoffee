import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { nav } from './i18n/nav';
import { access } from './i18n/access';
import { home } from './i18n/home';
import { menu } from './i18n/menu';
import { nosotros } from './i18n/nosotros';
import { servicios } from './i18n/servicios';
import { testimonials } from './i18n/testimonials';
import { gallery } from './i18n/gallery';
import { ubicacion } from './i18n/ubicacion';
import { contact } from './i18n/contact';
import { promociones } from './i18n/promociones';
import { portal } from './i18n/portal';
import { cotizador } from './i18n/cotizador';

export const LANG_CODES = ['es', 'en', 'fr', 'de', 'pt'] as const;
export type LangCode = typeof LANG_CODES[number];

export const languages: { code: LangCode; name: string }[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

const groups = [nav, access, home, menu, nosotros, servicios, testimonials, gallery, ubicacion, contact, promociones, portal, cotizador];

const translations: Record<string, Record<string, string>> = {
  es: {},
  en: {},
  fr: {},
  de: {},
  pt: {},
};

for (const group of groups) {
  for (const [key, values] of Object.entries(group)) {
    for (const lang of LANG_CODES) {
      if (values[lang]) translations[lang][key] = values[lang];
    }
  }
}

type LanguageContextType = {
  lang: string;
  changeLanguage: (newLang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [lang, setLang] = useState('es');

  useEffect(() => {
    const saved = localStorage.getItem('idioma');
    if (saved && LANG_CODES.includes(saved as LangCode)) {
      setLang(saved);
    }
  }, []);

  const changeLanguage = (newLang: string) => {
    if (LANG_CODES.includes(newLang as LangCode)) {
      setLang(newLang);
      localStorage.setItem('idioma', newLang);
    }
  };

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
