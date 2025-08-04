
import React from 'react';
import { BiotechIcon } from './icons';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../LanguageContext';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-4xl h-20 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BiotechIcon className="w-10 h-10 text-blue-600" />
          <div className="leading-tight">
            <h1 className="text-xl font-semibold text-slate-800">{t('appTitle')}</h1>
            <p className="text-sm text-slate-600">{t('appTagline')}</p>
          </div>
        </div>
        <LanguageToggle />
      </div>
    </header>
  );
};
