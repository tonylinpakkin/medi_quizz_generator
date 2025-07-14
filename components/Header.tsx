
import React from 'react';
import { BrainCircuitIcon } from './icons';
import { LanguageToggle } from './LanguageToggle';
import { useTranslation } from '../translations';

export const Header: React.FC = () => {
  const t = useTranslation();
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BrainCircuitIcon className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t('title')}</h1>
            <p className="text-sm text-slate-500">{t('tagline')}</p>
          </div>
        </div>
        <LanguageToggle />
      </div>
    </header>
  );
};
