import React from 'react';
import { useLanguage } from '../LanguageContext';

interface OnboardingOverlayProps {
  onClose: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-slate-700">
        <h2 className="text-xl font-bold mb-4">{t('welcome')}</h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>{t('onboardStep1')}</li>
          <li>{t('onboardStep2')}</li>
          <li>{t('onboardStep3')}</li>
        </ol>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('onboardGotIt')}
        </button>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
