
import React, { useMemo, useState } from 'react';
import type { MCQ } from '../types';
import { detectBias } from '../services/biasDetector';
import { EditIcon, TrashIcon, SaveIcon, FileTextIcon, CheckCircleIcon, AlertTriangleIcon, ClipboardIcon } from './icons';
import { mcqToPlainText } from '../services/mcqFormatter';
import { exportMCQsToWord, exportMCQsToPDF } from '../services/exportService';
import { useLanguage } from '../LanguageContext';

// A re-usable component to highlight potentially biased text
const BiasHighlightedText: React.FC<{text: string; flaggedWords: Set<string>}> = ({ text, flaggedWords }) => {
    const { t } = useLanguage();
    if (flaggedWords.size === 0) {
        return <>{text}</>;
    }

    const escapedWords = Array.from(flaggedWords).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
    
    // Handle cases where the text might be null or undefined
    if(!text) return null;
    
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                flaggedWords.has(part.toLowerCase()) ? (
                    <mark key={i} className="bg-yellow-200 px-1 rounded" title={t('potentialBiasShort')}>
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};


interface SavedMCQItemProps {
  mcq: MCQ;
  onUpdate: (mcq: MCQ) => void;
  onDelete: (id:string) => void;
  isSelected: boolean;
  onSelectionChange: (id: string, isSelected: boolean) => void;
}

const SavedMCQItem: React.FC<SavedMCQItemProps> = ({ mcq, onUpdate, onDelete, isSelected, onSelectionChange }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMcq, setEditedMcq] = useState<MCQ>(mcq);

  const biasWarnings = useMemo(() => {
    const allText = [mcq.stem, ...mcq.options.map(o => o.text)].join(' ');
    return detectBias(allText);
  }, [mcq]);
  const flaggedWordsSet = useMemo(() => new Set(biasWarnings), [biasWarnings]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mcqToPlainText(mcq));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore copy errors
    }
  };

  return (
    <li className="relative bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectionChange(mcq.id, e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      {biasWarnings.length > 0 && (
          <div className="p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg flex items-start">
              <AlertTriangleIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0"/>
              <div>
                  <h4 className="font-bold">{t('biasFlag')}</h4>
                  <p className="text-sm">{t('termsFlagged', { terms: biasWarnings.join(', ') })}</p>
              </div>
          </div>
      )}
      
      {isEditing ? (
        <textarea
          value={editedMcq.stem}
          onChange={(e) => setEditedMcq({ ...editedMcq, stem: e.target.value })}
          rows={3}
          className="mt-1 w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="font-semibold text-slate-700">
          <BiasHighlightedText text={mcq.stem} flaggedWords={flaggedWordsSet} />
        </p>
      )}

      <ul className="space-y-2">
        {isEditing ? (
          editedMcq.options.map(option => (
            <li key={option.id} className="flex items-center space-x-3">
              <input
                type="radio"
                name={`correctAnswer-${mcq.id}`}
                value={option.id}
                checked={editedMcq.correctAnswerId === option.id}
                onChange={(e) => setEditedMcq({ ...editedMcq, correctAnswerId: e.target.value })}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => {
                  const newOptions = editedMcq.options.map(o => o.id === option.id ? { ...o, text: e.target.value } : o);
                  setEditedMcq({ ...editedMcq, options: newOptions });
                }}
                className="w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </li>
          ))
        ) : (
          mcq.options.map(option => (
            <li key={option.id} className={`flex items-start p-2 rounded-md ${option.id === mcq.correctAnswerId ? 'bg-green-50' : 'bg-slate-50'}`}>
              <span className={`font-mono mr-3 text-sm ${option.id === mcq.correctAnswerId ? 'text-green-700 font-bold' : 'text-slate-500'}`}>{option.id}.</span>
              <span className={option.id === mcq.correctAnswerId ? 'text-green-900' : 'text-slate-800'}>
                <BiasHighlightedText text={option.text} flaggedWords={flaggedWordsSet} />
              </span>
              {option.id === mcq.correctAnswerId && <CheckCircleIcon className="w-5 h-5 ml-auto text-green-600 flex-shrink-0" />}
            </li>
          ))
        )}
      </ul>

      <div className="pt-2">
        <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-100 p-2 rounded-md">
            <FileTextIcon className="w-4 h-4 text-slate-400"/>
            <span>{mcq.citation.source}</span>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedMcq.rationale}
          onChange={(e) => setEditedMcq({ ...editedMcq, rationale: e.target.value })}
          rows={3}
          className="mt-1 w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        mcq.rationale && (
          <p className="text-sm text-slate-600 pt-2">{mcq.rationale}</p>
        )
      )}
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
        {isEditing ? (
          <>
            <button onClick={() => {
              setIsEditing(false);
              setEditedMcq(mcq);
            }} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
              {t('cancel')}
            </button>
            <button onClick={() => {
              onUpdate(editedMcq);
              setIsEditing(false);
            }} className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
              <SaveIcon className="w-4 h-4 mr-2" />
              {t('saveChanges')}
            </button>
          </>
        ) : (
          <>
            <button onClick={handleCopy} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
              <ClipboardIcon className="w-4 h-4 mr-2" />
              {copied ? t('copied') : t('copy')}
            </button>
            <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
              <EditIcon className="w-4 h-4 mr-2" />
              {t('edit')}
            </button>
            <button onClick={() => onDelete(mcq.id)} className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
              <TrashIcon className="w-4 h-4 mr-2" />
              {t('delete')}
            </button>
          </>
        )}
      </div>
    </li>
  );
};

interface SavedMCQListProps {
  mcqs: MCQ[];
  onUpdate: (mcq: MCQ) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
}

export const SavedMCQList: React.FC<SavedMCQListProps> = ({ mcqs, onUpdate, onDelete, onDeleteSelected }) => {
  const { t } = useLanguage();
  const [selectedMcqIds, setSelectedMcqIds] = useState(new Set<string>());

  if (mcqs.length === 0) {
    return null;
  }

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedMcqIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMcqIds(new Set(mcqs.map(mcq => mcq.id)));
    } else {
      setSelectedMcqIds(new Set());
    }
  };

  const selectedMcqs = mcqs.filter(mcq => selectedMcqIds.has(mcq.id));
  const allSelected = selectedMcqIds.size === mcqs.length && mcqs.length > 0;

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-700">{t('savedQuestions')}</h2>
        <div className="space-x-3">
          <button
            onClick={() => exportMCQsToWord(selectedMcqs)}
            disabled={selectedMcqs.length === 0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50"
          >
            {t('exportWord')}
          </button>
          <button
            onClick={() => exportMCQsToPDF(selectedMcqs)}
            disabled={selectedMcqs.length === 0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50"
          >
            {t('exportPDF')}
          </button>
          <button
            onClick={() => {
              onDeleteSelected(Array.from(selectedMcqIds));
              setSelectedMcqIds(new Set());
            }}
            disabled={selectedMcqs.length === 0}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
          >
            {t('delete')}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700">{t('selectAll')}</span>
        </label>
      </div>
      <ul className="space-y-6">
        {mcqs.map(mcq => (
          <SavedMCQItem
            key={mcq.id}
            mcq={mcq}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isSelected={selectedMcqIds.has(mcq.id)}
            onSelectionChange={handleSelectionChange}
          />
        ))}
      </ul>
    </div>
  );
};
