import React, { useState, useEffect } from 'react';
import { Language, LanguageContext } from '../translations';

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language | null;
    return stored || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
