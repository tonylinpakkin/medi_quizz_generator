import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';

interface UITourProps {
  onFinish: () => void;
}

const UITour: React.FC<UITourProps> = ({ onFinish }) => {
  const { t } = useLanguage();
  const steps = [t('onboardStep1'), t('onboardStep2'), t('onboardStep3')];
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index < steps.length - 1) {
      setIndex(index + 1);
    } else {
      onFinish();
    }
  };

  const back = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-slate-700">
        <h2 className="text-xl font-bold mb-4">{t('welcome')}</h2>
        <p className="mb-6">{steps[index]}</p>
        <div className="flex justify-between">
          <button
            onClick={back}
            disabled={index === 0}
            className={`px-4 py-2 rounded ${index === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            {t('back')}
          </button>
          <button
            onClick={next}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {index < steps.length - 1 ? t('next') : t('onboardGotIt')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UITour;
