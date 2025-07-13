
import React, { useState, useMemo } from 'react';
import type { MCQ } from '../types';
import { detectBias } from '../services/biasDetector';
import { AlertTriangleIcon, SaveIcon, FileTextIcon } from './icons';

interface MCQReviewCardProps {
  initialMcq: MCQ;
  onSave: (mcq: MCQ) => void;
  onCancel: () => void;
}

export const MCQReviewCard: React.FC<MCQReviewCardProps> = ({ initialMcq, onSave, onCancel }) => {
  const [mcq, setMcq] = useState<MCQ>(initialMcq);
  const [selectedAnswer, setSelectedAnswer] = useState(mcq.correctAnswerId);

  const biasWarnings = useMemo(() => {
    const allText = [mcq.stem, ...mcq.options.map(o => o.text)].join(' ');
    return detectBias(allText);
  }, [mcq]);

  const handleOptionChange = (optionId: string, newText: string) => {
    const newOptions = mcq.options.map(opt =>
      opt.id === optionId ? { ...opt, text: newText } : opt
    );
    setMcq({ ...mcq, options: newOptions });
  };
  
  const handleSave = () => {
    onSave({ ...mcq, correctAnswerId: selectedAnswer });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <h3 className="text-xl font-semibold text-slate-700 mb-2">Review &amp; Edit Question</h3>
      <p className="text-slate-500 mb-4">This is a draft. Please review, edit, and approve the content. The AI-selected answer is pre-filled.</p>
      
      {biasWarnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg flex items-start">
              <AlertTriangleIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0"/>
              <div>
                  <h4 className="font-bold">Bias Detector Flag</h4>
                  <p className="text-sm">Potential bias detected for terms: <span className="font-semibold">{biasWarnings.join(', ')}</span>. Please review the text for appropriate context.</p>
              </div>
          </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="font-semibold text-slate-600">Question Stem</span>
          <textarea
            value={mcq.stem}
            onChange={(e) => setMcq({ ...mcq, stem: e.target.value })}
            rows={3}
            className="mt-1 w-full p-2 bg-white border border-slate-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div className="space-y-2">
            <span className="font-semibold text-slate-600">Options</span>
            {mcq.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
                <input
                    type="radio"
                    name="correctAnswer"
                    id={`option-${option.id}`}
                    value={option.id}
                    checked={selectedAnswer === option.id}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="w-full p-2 bg-white border border-slate-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
            ))}
        </div>
        
        <div className="pt-2">
            <h4 className="font-semibold text-slate-600">Citation</h4>
            <div className="mt-1 flex items-center space-x-2 text-sm text-slate-500 bg-slate-100 p-2 rounded-md">
                <FileTextIcon className="w-4 h-4 text-slate-400"/>
                <span>{mcq.citation.source}</span>
            </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end items-center space-x-3">
          <button
            onClick={onCancel}
            type="button"
            className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
              onClick={handleSave}
              className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors"
          >
              <SaveIcon className="w-5 h-5 mr-2" />
              Save Question
          </button>
      </div>
    </div>
  );
};
