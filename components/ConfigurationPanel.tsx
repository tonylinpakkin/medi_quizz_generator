import React from 'react';
import type { Question } from '../types';
import { exportQuestionsToWord, exportQuestionsToPDF } from '../services/exportService';
import { useLanguage } from '../LanguageContext';

interface ConfigurationPanelProps {
  questions: Question[];
  onSaveAll: () => void;
  onDiscardAll: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ questions, onSaveAll, onDiscardAll }) => {
  const { t } = useLanguage();

  return (
    <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md border border-slate-200 flex-shrink-0">
      <div className="space-y-3">
        <button
          onClick={onSaveAll}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
        >
          {t('saveAll')}
        </button>
        <button
          onClick={onDiscardAll}
          className="w-full px-4 py-2 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100"
        >
          {t('discardAll')}
        </button>
        <button
          onClick={() => exportQuestionsToWord(questions)}
          className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100"
        >
          {t('exportWord')}
        </button>
        <button
          onClick={() => exportQuestionsToPDF(questions)}
          className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100"
        >
          {t('exportPDF')}
        </button>
      </div>
    </aside>
  );
};

export default ConfigurationPanel;
