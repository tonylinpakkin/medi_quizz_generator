import React from 'react';
import { useLanguage } from '../LanguageContext';

interface ProgressIndicatorProps {
  step: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ step }) => {
  const { t } = useLanguage();
  const steps = [t('progressStep1'), t('progressStep2'), t('progressStep3')];

  return (
    <div className="mb-4 flex items-center justify-center text-sm text-slate-600">
      {steps.map((label, idx) => (
        <React.Fragment key={idx}>
          <span className={idx + 1 === step ? 'font-semibold text-blue-600' : ''}>
            {label}
          </span>
          {idx < steps.length - 1 && (
            <span className="mx-2 text-slate-400">&rarr;</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
