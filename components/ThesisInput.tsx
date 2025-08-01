
import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon } from './icons';
import { useLanguage } from '../LanguageContext';
import { parseFile } from '../services/fileParser';

interface ThesisInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onGenerate: (text: string, count: number) => void;
  isLoading: boolean;
}

export const ThesisInput: React.FC<ThesisInputProps> = ({
  text,
  onTextChange,
  onGenerate,
  isLoading,
}) => {
  const [reading, setReading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useLanguage();

  const handleGenerateClick = () => {
    setDropdownOpen((open) => !open);
  };

  const handleGenerateSelect = (count: number) => {
    setDropdownOpen(false);
    onGenerate(text, count);
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
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="e.g., 'Primary aldosteronism is the most common cause of secondary hypertension, with recent studies suggesting a prevalence of 5-10% in hypertensive populations...'"
        className="w-full h-48 p-3 bg-white border border-slate-400 rounded-md text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        disabled={isLoading || reading}
      />
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
      <div className="mt-4 flex justify-end relative">
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || reading || !text.trim()}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          <span className="mr-1">{isLoading ? t('generating') : t('generateMcq')}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>
        {dropdownOpen && !isLoading && !reading && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-md shadow-lg z-10">
            <div className="px-4 py-2 text-sm text-slate-500 border-b border-slate-200">
              {t('chooseQuestionCount')}
            </div>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleGenerateSelect(num)}
                className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100"
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
