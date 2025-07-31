import React from 'react';
import { LoadingSpinner } from './icons';
import { useLanguage } from '../LanguageContext';

const LoadingOverlay: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <LoadingSpinner className="w-12 h-12 text-blue-600" />
        <p className="mt-4 text-lg font-medium text-slate-600">{t('generatingQuestion')}</p>
        <p className="text-sm text-slate-500">{t('generatingWait')}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
