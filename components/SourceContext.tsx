import React from 'react';
import { useLanguage } from '../LanguageContext';

interface SourceContextProps {
  sourceText: string;
}

export const SourceContext: React.FC<SourceContextProps> = ({ sourceText }) => {
  const { t } = useLanguage();

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-md border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('sourceContext', 'Source Context')}</h3>
      <p className="text-sm text-slate-500 mb-4">{t('sourceContextDescription', 'The AI used this text to generate the questions.')}</p>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
        <p className="text-sm text-slate-700">{sourceText}</p>
      </div>
    </div>
  );
};
