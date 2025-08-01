import React from 'react';
import { useLanguage } from '../LanguageContext';

interface ProgressIndicatorProps {
  step: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ step }) => {
  const { t } = useLanguage();
  const steps = [t('progressStep1'), t('progressStep2'), t('progressStep3')];

  const progressPercent = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-4 flex flex-col items-center w-full max-w-xl mx-auto">
      <div className="relative w-full flex justify-between items-center">
        <div className="absolute top-1/2 w-full h-1 bg-slate-200 rounded" style={{ transform: 'translateY(-50%)' }} />
        <div
          className="absolute top-1/2 h-1 bg-blue-600 rounded"
          style={{ width: `${progressPercent}%`, transform: 'translateY(-50%)' }}
        />
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`z-10 flex items-center justify-center w-6 h-6 rounded-full ${
              idx + 1 <= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {idx + 1}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between w-full text-xs text-slate-600">
        {steps.map((label, idx) => (
          <span
            key={idx}
            className={`flex-1 text-center ${idx + 1 === step ? 'font-semibold text-blue-600' : ''}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
