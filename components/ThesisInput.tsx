
import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { useLanguage } from '../LanguageContext';
import { parseFile } from '../services/fileParser';
import { QuestionType } from '../types';

interface ThesisInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onGenerate: (text: string, count: number) => void;
  isLoading: boolean;
  onError: (message: string) => void;
  questionType: QuestionType;
  onQuestionTypeChange: (type: QuestionType) => void;
}

export const ThesisInput: React.FC<ThesisInputProps> = ({
  text,
  onTextChange,
  onGenerate,
  isLoading,
  onError,
  questionType,
  onQuestionTypeChange,
}) => {
  const [reading, setReading] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const { t } = useLanguage();

  const handleGenerateClick = () => {
    onGenerate(text, questionCount);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    try {
      const fileText = await parseFile(file);
      onTextChange(fileText);
    } catch (err) {
      onError(t('fileReadError'));
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('pasteParagraph')}</h2>
      <p className="text-slate-500 mb-4">{t('provideParagraph')}</p>
      <textarea
        id="tour-thesis-input"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={t('examplePlaceholder')}
        className="w-full h-48 p-3 bg-white border border-slate-400 rounded-md text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        disabled={isLoading || reading}
      />
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="tour-file-upload">
          {t('uploadFile')}
        </label>
        <input
          id="tour-file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          disabled={isLoading || reading}
          className="block w-full text-sm text-slate-700 file:mr-4 file:px-4 file:py-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
        <label className="text-sm font-medium text-slate-700 flex items-center" htmlFor="tour-question-count">
          {t('numberOfQuestions')}
          <input
            id="tour-question-count"
            type="number"
            min={1}
            max={5}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            disabled={isLoading || reading}
            className="ml-2 w-20 border border-slate-300 rounded-md p-1"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 flex items-center">
          {t('questionType')}
          <select
            value={questionType}
            onChange={(e) => onQuestionTypeChange(e.target.value as QuestionType)}
            disabled={isLoading || reading}
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
          onClick={handleGenerateClick}
          disabled={isLoading || reading || !text.trim()}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          <span>{isLoading ? t('generating') : t('generateQuestion')}</span>
        </button>
      </div>
    </div>
  );
};
