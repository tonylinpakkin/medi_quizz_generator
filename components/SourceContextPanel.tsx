import React from 'react';
import { Citation } from '../types';
import { FileTextIcon } from './icons';
import { useLanguage } from '../LanguageContext';

interface SourceContextPanelProps {
  citation: Citation;
  rationale: string;
  isEditing: boolean;
  onRationaleChange: (value: string) => void;
}

export const SourceContextPanel: React.FC<SourceContextPanelProps> = ({ citation, rationale, isEditing, onRationaleChange }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-slate-600">{t('citation')}</h4>
        <div className="mt-1 flex items-center space-x-2 text-sm text-slate-500 bg-slate-100 p-2 rounded-md">
          <FileTextIcon className="w-4 h-4 text-slate-400" />
          <span>{citation.source}</span>
        </div>
      </div>
      <label className="block">
        <span className="font-semibold text-slate-600">{t('answerRationale')}</span>
        {isEditing ? (
          <textarea
            value={rationale}
            onChange={(e) => onRationaleChange(e.target.value)}
            rows={3}
            className="mt-1 w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="mt-1 w-full p-2 bg-slate-50 text-slate-800 rounded-md border border-slate-200">{rationale}</p>
        )}
      </label>
    </div>
  );
};

export default SourceContextPanel;
