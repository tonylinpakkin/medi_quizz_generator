
import React, { useState } from 'react';
import { GripVerticalIcon, FileTextIcon } from './icons';
import { useLanguage } from '../LanguageContext';
import { parseFile } from '../services/fileParser';

interface ThesisInputProps {
  text: string;
  onTextChange: (text: string) => void;
  isLoading: boolean;
  onError: (message: string) => void;
  onReadingChange?: (reading: boolean) => void;
}

export const ThesisInput: React.FC<ThesisInputProps> = ({
  text,
  onTextChange,
  isLoading,
  onError,
  onReadingChange,
}) => {
  const [reading, setReading] = useState(false);
  const { t } = useLanguage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    onReadingChange?.(true);
    try {
      const fileText = await parseFile(file);
      onTextChange(fileText);
    } catch (err) {
      onError(t('fileReadError'));
    } finally {
      setReading(false);
      onReadingChange?.(false);
    }
  };

  return (
    <div className="relative bg-white p-6 rounded-2xl shadow-md border border-slate-200">
      <GripVerticalIcon className="w-5 h-5 text-slate-400 absolute top-4 right-4" />
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
      <label
        htmlFor="tour-file-upload"
        className="mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100"
      >
        <FileTextIcon className="w-6 h-6 text-slate-500 mb-2" />
        <span className="text-slate-600">{t('uploadFile')}</span>
        <input
          id="tour-file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          disabled={isLoading || reading}
          className="hidden"
        />
      </label>
    </div>
  );
};
