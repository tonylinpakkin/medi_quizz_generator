
import React, { useMemo } from 'react';
import type { MCQ } from '../types';
import { detectBias } from '../services/biasDetector';
import { EditIcon, TrashIcon, FileTextIcon, CheckCircleIcon, AlertTriangleIcon } from './icons';

// A re-usable component to highlight potentially biased text
const BiasHighlightedText: React.FC<{text: string; flaggedWords: Set<string>}> = ({ text, flaggedWords }) => {
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
                    <mark key={i} className="bg-yellow-200 px-1 rounded" title="Potential bias detected">
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
  onEdit: (id: string) => void;
  onDelete: (id:string) => void;
}

const SavedMCQItem: React.FC<SavedMCQItemProps> = ({ mcq, onEdit, onDelete }) => {
  const biasWarnings = useMemo(() => {
    const allText = [mcq.stem, ...mcq.options.map(o => o.text)].join(' ');
    return detectBias(allText);
  }, [mcq]);
  const flaggedWordsSet = useMemo(() => new Set(biasWarnings), [biasWarnings]);

  return (
    <li className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
      {biasWarnings.length > 0 && (
          <div className="p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg flex items-start">
              <AlertTriangleIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0"/>
              <div>
                  <h4 className="font-bold">Bias Detector Flag</h4>
                  <p className="text-sm">Terms flagged: <span className="font-semibold">{biasWarnings.join(', ')}</span>.</p>
              </div>
          </div>
      )}
      
      <p className="font-semibold text-slate-700">
        <BiasHighlightedText text={mcq.stem} flaggedWords={flaggedWordsSet} />
      </p>

      <ul className="space-y-2">
        {mcq.options.map(option => (
          <li key={option.id} className={`flex items-start p-2 rounded-md ${option.id === mcq.correctAnswerId ? 'bg-green-50' : 'bg-slate-50'}`}>
            <span className={`font-mono mr-3 text-sm ${option.id === mcq.correctAnswerId ? 'text-green-700 font-bold' : 'text-slate-500'}`}>{option.id}.</span>
            <span className={option.id === mcq.correctAnswerId ? 'text-green-900' : 'text-slate-800'}>
              <BiasHighlightedText text={option.text} flaggedWords={flaggedWordsSet} />
            </span>
            {option.id === mcq.correctAnswerId && <CheckCircleIcon className="w-5 h-5 ml-auto text-green-600 flex-shrink-0" />}
          </li>
        ))}
      </ul>

      <div className="pt-2">
        <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-100 p-2 rounded-md">
            <FileTextIcon className="w-4 h-4 text-slate-400"/>
            <span>{mcq.citation.source}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
        <button onClick={() => onEdit(mcq.id)} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
          <EditIcon className="w-4 h-4 mr-2" />
          Edit
        </button>
        <button onClick={() => onDelete(mcq.id)} className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete
        </button>
      </div>
    </li>
  );
};

interface SavedMCQListProps {
  mcqs: MCQ[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SavedMCQList: React.FC<SavedMCQListProps> = ({ mcqs, onEdit, onDelete }) => {
  if (mcqs.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">Saved Questions</h2>
      <ul className="space-y-6">
        {mcqs.map(mcq => (
          <SavedMCQItem key={mcq.id} mcq={mcq} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
};
