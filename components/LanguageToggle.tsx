import React from 'react';
import { useTranslation, LanguageContext } from '../translations';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = React.useContext(LanguageContext);
  const t = useTranslation();
  const toggle = () => setLanguage(language === 'en' ? 'zh' : 'en');
  return (
    <button onClick={toggle} className="text-sm text-slate-600 hover:text-slate-800">
      {language === 'en' ? '中文' : 'English'}
    </button>
  );
};
