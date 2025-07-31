
import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { useLanguage } from '../LanguageContext';
import { parseFile } from '../services/fileParser';

interface ThesisInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

export const ThesisInput: React.FC<ThesisInputProps> = ({
  text,
  onTextChange,
  onGenerate,
  isLoading,
}) => {
  const [reading, setReading] = useState(false);
  const { t } = useLanguage();

  const handleGenerateClick = () => {
    onGenerate(text);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    try {
      const fileText = await parseFile(file);
      onTextChange(fileText);
    } catch (err) {
      alert(t('fileReadError'));
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('pasteParagraph')}</h2>
      <p className="text-slate-500 mb-4">{t('provideParagraph')}</p>
      <div className="relative group">
        <EditIcon className="w-4 h-4 absolute right-3 top-3 text-blue-600 opacity-0 group-hover:opacity-100 pointer-events-none" />
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="e.g., 'Primary aldosteronism is the most common cause of secondary hypertension, with recent studies suggesting a prevalence of 5-10% in hypertensive populations...'"
          className="w-full h-48 p-3 bg-white border border-slate-400 rounded-md text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed group-hover:cursor-pointer"
          disabled={isLoading || reading}
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('uploadFile')}
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          disabled={isLoading || reading}
          className="block w-full text-sm text-slate-700 file:mr-4 file:px-4 file:py-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || reading || !text.trim()}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {isLoading ? t('generating') : t('generateMcq')}
        </button>
      </div>
    </div>
  );
};
