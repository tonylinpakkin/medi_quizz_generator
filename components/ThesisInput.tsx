
import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { useLanguage } from '../LanguageContext';
import { extractTextFromFile } from '../services/fileService';

interface ThesisInputProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

export const ThesisInput: React.FC<ThesisInputProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const { t } = useLanguage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await extractTextFromFile(file);
      setText(content);
    } catch (err) {
      console.error('Failed to read file', err);
    }
  };

  const handleGenerateClick = () => {
    onGenerate(text);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('pasteParagraph')}</h2>
      <p className="text-slate-500 mb-4">{t('provideParagraph')}</p>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="fileInput">
          {t('uploadFile')}
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".txt,.doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-slate-700 border border-slate-300 rounded-md file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-60"
        />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., 'Primary aldosteronism is the most common cause of secondary hypertension, with recent studies suggesting a prevalence of 5-10% in hypertensive populations...'"
        className="w-full h-48 p-3 bg-white border border-slate-400 rounded-md text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        disabled={isLoading}
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || !text.trim()}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {isLoading ? t('generating') : t('generateMcq')}
        </button>
      </div>
    </div>
  );
};
