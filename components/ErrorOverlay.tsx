import React from 'react';
import { AlertTriangleIcon } from './icons';
import { useLanguage } from '../LanguageContext';

interface ErrorOverlayProps {
  message: string;
  onClose: () => void;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ message, onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-slate-700">
        <div className="flex items-start">
          <AlertTriangleIcon className="w-6 h-6 text-red-600 mr-3 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-2">{t('error')}</h2>
            <p>{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};

export default ErrorOverlay;
