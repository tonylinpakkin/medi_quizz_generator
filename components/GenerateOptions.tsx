import React from 'react';
import { SparklesIcon } from './icons';
import { QuestionType } from '../types';
import { useLanguage } from '../LanguageContext';

interface GenerateOptionsProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  questionType: QuestionType;
  onQuestionTypeChange: (type: QuestionType) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isReading: boolean;
  text: string;
}

export const GenerateOptions: React.FC<GenerateOptionsProps> = ({
  questionCount,
  onQuestionCountChange,
  questionType,
  onQuestionTypeChange,
  onGenerate,
  isLoading,
  isReading,
  text,
}) => {
  const { t } = useLanguage();
  return (
    <div className="mt-6 bg-white p-6 rounded-2xl shadow-md border border-slate-200">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
        <label className="text-sm font-medium text-slate-700 flex items-center" htmlFor="tour-question-count">
          {t('numberOfQuestions')}
          <input
            id="tour-question-count"
            type="number"
            min={1}
            max={5}
            value={questionCount}
            onChange={(e) => onQuestionCountChange(Number(e.target.value))}
            disabled={isLoading || isReading}
            className="ml-2 w-20 border border-slate-300 rounded-md p-1"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 flex items-center">
          {t('questionType')}
          <select
            value={questionType}
            onChange={(e) => onQuestionTypeChange(e.target.value as QuestionType)}
            disabled={isLoading || isReading}
            className="ml-2 border border-slate-300 rounded-md p-1"
          >
            {Object.values(QuestionType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <button
          id="tour-generate-button"
          onClick={onGenerate}
          disabled={isLoading || isReading || !text.trim()}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          <span>{isLoading ? t('generating') : t('generateQuestion')}</span>
        </button>
      </div>
    </div>
  );
};
