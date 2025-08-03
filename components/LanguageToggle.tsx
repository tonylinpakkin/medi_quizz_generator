import React from 'react';
import { useLanguage } from '../LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <select
      id="tour-language-toggle"
      className="border border-slate-300 rounded-md text-sm text-slate-700"
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'zh-Hant')}
      aria-label={t('language')}
    >
      <option value="en">English</option>
      <option value="zh-Hant">繁體中文</option>
    </select>
  );
};
