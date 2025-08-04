import React from 'react';
import { useLanguage } from '../LanguageContext';
import { ChevronDownIcon } from './icons';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="relative">
      <select
        id="tour-language-toggle"
        className="appearance-none border border-slate-300 rounded-md bg-white pl-3 pr-8 py-1 text-sm text-slate-700"
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'zh-Hant')}
        aria-label={t('language')}
      >
        <option value="en">English</option>
        <option value="zh-Hant">繁體中文</option>
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
        <ChevronDownIcon className="w-4 h-4 text-slate-500" />
      </span>
    </div>
  );
};
