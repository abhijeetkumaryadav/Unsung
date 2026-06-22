// app/context/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" }
];

// All valid language codes including 'all'
const ALL_VALID_CODES = ['all', ...LANGUAGES.map(l => l.code)];

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  availableLanguages: typeof LANGUAGES;
  t: (item: any, field: string) => string;
  getTranslation: (item: any, field: string, lang?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('unsung_language');
    if (saved && ALL_VALID_CODES.includes(saved)) {
      setCurrentLanguage(saved);
    } else {
      // Default to 'all' for new users
      setCurrentLanguage('all');
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (!ALL_VALID_CODES.includes(lang)) return;
    setCurrentLanguage(lang);
    localStorage.setItem('unsung_language', lang);
    // NO page reload - let React handle the re-render
  };

  // Translation helper
  const t = (item: any, field: string): string => {
    if (!item) return '';
    
    // If no translations or language is English or 'all', return original
    if (!item.translations || currentLanguage === 'en' || currentLanguage === 'all') {
      return item[field] || '';
    }
    
    // Check if translation exists for current language
    const translation = item.translations[currentLanguage];
    if (translation && translation[field]) {
      return translation[field];
    }
    
    // Fallback to original
    return item[field] || '';
  };

  // Get translation for a specific language
  const getTranslation = (item: any, field: string, lang?: string): string => {
    if (!item) return '';
    const targetLang = lang || currentLanguage;
    
    if (!item.translations || targetLang === 'en' || targetLang === 'all') {
      return item[field] || '';
    }
    
    const translation = item.translations[targetLang];
    if (translation && translation[field]) {
      return translation[field];
    }
    
    return item[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      availableLanguages: LANGUAGES,
      t,
      getTranslation
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { LANGUAGES };