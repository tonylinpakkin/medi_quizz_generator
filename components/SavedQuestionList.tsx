
import React, { useMemo, useState } from 'react';
import type { Question } from '../types';
import { QuestionType } from '../types';
import { detectBias } from '../services/biasDetector';
import { EditIcon, TrashIcon, SaveIcon, FileTextIcon, CheckCircleIcon, AlertTriangleIcon, ClipboardIcon } from './icons';
import { questionToPlainText } from '../services/questionFormatter';
import { exportQuestionsToWord, exportQuestionsToPDF } from '../services/exportService';
import { useLanguage } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { PlusCircleIcon } from './icons';
import { BiasHighlightedText } from './BiasHighlightedText';


interface SavedQuestionItemProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: (id:string) => void;
  isSelected: boolean;
  onSelectionChange: (id: string, isSelected: boolean) => void;
}

const SavedQuestionItem: React.FC<SavedQuestionItemProps> = ({ question, onUpdate, onDelete, isSelected, onSelectionChange }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);

  const biasWarnings = useMemo(() => {
    const optionTexts = question.options?.map(o => o.text) ?? [];
    const answerText = typeof question.answer === 'string' ? question.answer : '';
    const allText = [question.stem, ...optionTexts, answerText].join(' ');
    return detectBias(allText);
  }, [question]);
  const flaggedWordsSet = useMemo(() => new Set(biasWarnings), [biasWarnings]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(questionToPlainText(question));
      addToast(t('copySuccess'), 'info');
    } catch {
      addToast(t('copyFail'), 'error');
    }
  };

  return (
    <li className="relative bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectionChange(question.id, e.target.checked)}
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
          value={editedQuestion.stem}
          onChange={(e) => setEditedQuestion({ ...editedQuestion, stem: e.target.value })}
          rows={3}
          className="mt-1 w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="font-semibold text-slate-700">
          <BiasHighlightedText text={question.stem} flaggedWords={flaggedWordsSet} />
        </p>
      )}

      {question.type === QuestionType.ShortAnswer ? (
        <div>
          {isEditing ? (
            <input
              type="text"
              value={editedQuestion.answer as string}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, answer: e.target.value })}
              className="w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="p-2 bg-slate-50 text-slate-800 rounded-md border border-slate-200">{question.answer as string}</p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {isEditing ? (
            editedQuestion.options?.map(option => (
              <li key={option.id} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`correctAnswer-${question.id}`}
                  value={option.id}
                  checked={editedQuestion.correctAnswerId === option.id}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswerId: e.target.value })}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = editedQuestion.options!.map(o => o.id === option.id ? { ...o, text: e.target.value } : o);
                    setEditedQuestion({ ...editedQuestion, options: newOptions });
                  }}
                  className="w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </li>
            ))
          ) : (
            question.options?.map(option => (
              <li key={option.id} className={`flex items-start p-2 rounded-md ${option.id === question.correctAnswerId ? 'bg-green-50' : 'bg-slate-50'}`}>
                <span className={`font-mono mr-3 text-sm ${option.id === question.correctAnswerId ? 'text-green-700 font-bold' : 'text-slate-500'}`}>{option.id}.</span>
                <span className={option.id === question.correctAnswerId ? 'text-green-900' : 'text-slate-800'}>
                  <BiasHighlightedText text={option.text} flaggedWords={flaggedWordsSet} />
                </span>
                {option.id === question.correctAnswerId && <CheckCircleIcon className="w-5 h-5 ml-auto text-green-600 flex-shrink-0" />}
              </li>
            ))
          )}
        </ul>
      )}

      <div className="pt-2">
        <div className="flex items-center space-x-2 text-sm text-slate-500 bg-slate-100 p-2 rounded-md">
            <FileTextIcon className="w-4 h-4 text-slate-400"/>
            <span>{question.citation.source}</span>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedQuestion.rationale}
          onChange={(e) => setEditedQuestion({ ...editedQuestion, rationale: e.target.value })}
          rows={3}
          className="mt-1 w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        question.rationale && (
          <p className="text-sm text-slate-600 pt-2">{question.rationale}</p>
        )
      )}
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
        {isEditing ? (
          <>
            <button onClick={() => {
              setIsEditing(false);
              setEditedQuestion(question);
            }} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
              {t('cancel')}
            </button>
            <button onClick={() => {
              onUpdate(editedQuestion);
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
              {t('copy')}
            </button>
            <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors">
              <EditIcon className="w-4 h-4 mr-2" />
              {t('edit')}
            </button>
            <button onClick={() => onDelete(question.id)} className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
              <TrashIcon className="w-4 h-4 mr-2" />
              {t('delete')}
            </button>
          </>
        )}
      </div>
    </li>
  );
};

interface SavedQuestionListProps {
  questions: Question[];
  onUpdate: (question: Question) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onSwitchToGenerateTab: () => void;
}

export const SavedQuestionList: React.FC<SavedQuestionListProps> = ({ questions, onUpdate, onDelete, onDeleteSelected, onSwitchToGenerateTab }) => {
  const { t } = useLanguage();
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set<string>());

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border border-slate-200">
        <PlusCircleIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-800">{t('noSavedQuestionsTitle')}</h3>
        <p className="mt-2 text-sm text-slate-500">{t('noSavedQuestionsBody')}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onSwitchToGenerateTab}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('generateYourFirstQuestion')}
          </button>
        </div>
      </div>
    );
  }

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedQuestionIds(prev => {
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
      setSelectedQuestionIds(new Set(questions.map(question => question.id)));
    } else {
      setSelectedQuestionIds(new Set());
    }
  };

  const selectedQuestions = questions.filter(question => selectedQuestionIds.has(question.id));
  const allSelected = selectedQuestionIds.size === questions.length && questions.length > 0;

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-700">{t('savedQuestions')}</h2>
        <div className="space-x-3">
          <button
            onClick={() => exportQuestionsToWord(selectedQuestions)}
            disabled={selectedQuestions.length === 0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50"
          >
            {t('exportWord')}
          </button>
          <button
            onClick={() => exportQuestionsToPDF(selectedQuestions)}
            disabled={selectedQuestions.length === 0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50"
          >
            {t('exportPDF')}
          </button>
          <button
            onClick={() => {
              onDeleteSelected(Array.from(selectedQuestionIds));
              setSelectedQuestionIds(new Set());
            }}
            disabled={selectedQuestions.length === 0}
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
        {questions.map(question => (
          <SavedQuestionItem
            key={question.id}
            question={question}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isSelected={selectedQuestionIds.has(question.id)}
            onSelectionChange={handleSelectionChange}
          />
        ))}
      </ul>
    </div>
  );
};
