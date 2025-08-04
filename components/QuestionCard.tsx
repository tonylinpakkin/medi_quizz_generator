import React, { useState, useMemo, useEffect } from 'react';
import type { Question, QuestionOption } from '../types';
import { QuestionType } from '../types';
import { detectBias } from '../services/biasDetector';
import { AlertTriangleIcon, EditIcon, ClipboardIcon, TrashIcon, SaveIcon, CheckCircleIcon, ChevronDownIcon, PlusCircleIcon } from './icons';
import { questionToPlainText } from '../services/questionFormatter';
import { useLanguage } from '../LanguageContext';
import { useToast } from '../ToastContext';
import { BiasHighlightedText } from './BiasHighlightedText';
import { SourceContextPanel } from './SourceContextPanel';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onUpdate: (question: Question) => void;
  onDiscard: (id: string) => void;
  onSave: (question: Question) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question: initialQuestion, index, total, onUpdate, onDiscard, onSave }) => {
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question>(initialQuestion);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const { t } = useLanguage();
  const { addToast } = useToast();

  const biasWarnings = useMemo(() => {
    const optionTexts = question.options?.map(o => o.text) ?? [];
    const answerText = typeof question.answer === 'string' ? question.answer : '';
    const allText = [question.stem, ...optionTexts, answerText].join(' ');
    return detectBias(allText);
  }, [question]);
  const flaggedWordsSet = useMemo(() => new Set(biasWarnings), [biasWarnings]);

  useEffect(() => {
    if (!isEditing) {
      onUpdate(question);
    }
  }, [question, isEditing, onUpdate]);

  const handleOptionChange = (optionId: string, newText: string) => {
    if (!editedQuestion.options) return;
    const newOptions = editedQuestion.options.map(opt =>
      opt.id === optionId ? { ...opt, text: newText } : opt
    );
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const handleAddOption = () => {
    const options = editedQuestion.options ? [...editedQuestion.options] : [];
    const nextId = String.fromCharCode('A'.charCodeAt(0) + options.length);
    const newOption: QuestionOption = { id: nextId, text: '' };
    options.push(newOption);
    setEditedQuestion({ ...editedQuestion, options });
  };

  const handleDeleteOption = (optionId: string) => {
    const options = editedQuestion.options?.filter(o => o.id !== optionId) || [];
    const correct = editedQuestion.correctAnswerId === optionId ? undefined : editedQuestion.correctAnswerId;
    setEditedQuestion({ ...editedQuestion, options, correctAnswerId: correct });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(questionToPlainText(question));
      addToast(t('copySuccess'), 'info');
    } catch {
      addToast(t('copyFail'), 'error');
    }
  };

  const handleSave = () => {
    setQuestion(editedQuestion);
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuestion(question);
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-slate-700 flex items-center">
            {t('reviewEdit')}
            {isEditing && (
              <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                <EditIcon className="w-3 h-3 mr-1" />
                {t('editMode')}
              </span>
            )}
          </h3>
          <p className="text-slate-600 text-lg font-semibold mt-1">
            {t('questionCountDisplay', { current: String(index), total: String(total) })}
          </p>
        </div>
        {!isEditing && (
          <p className="text-slate-500 mb-4 text-sm">{t('reviewInstruction')}</p>
        )}
      </div>

      {biasWarnings.length > 0 && !isEditing && (
        <div className="mt-4 mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg flex items-start">
          <AlertTriangleIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold">{t('biasFlag')}</h4>
            <p className="text-sm">{t('potentialBias', { terms: biasWarnings.join(', ') })}</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mt-4">
        <label className="block">
          <span className="font-semibold text-slate-600">{t('questionStem')}</span>
          {isEditing ? (
            <textarea
              value={editedQuestion.stem}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, stem: e.target.value })}
              rows={3}
              className="mt-1 w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="mt-1 w-full p-2 bg-slate-50 text-slate-800 rounded-md border border-slate-200">
              <BiasHighlightedText text={question.stem} flaggedWords={flaggedWordsSet} />
            </p>
          )}
        </label>

        {question.type === QuestionType.ShortAnswer ? (
          <label className="block">
            <span className="font-semibold text-slate-600">{t('answer')}</span>
            {isEditing ? (
              <input
                type="text"
                value={editedQuestion.answer as string}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, answer: e.target.value })}
                className="mt-1 w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 w-full p-2 bg-slate-50 text-slate-800 rounded-md border border-slate-200">{question.answer as string}</p>
            )}
          </label>
        ) : (
          <div className="space-y-2">
            <span className="font-semibold text-slate-600">{t('options')}</span>
            {isEditing ? (
              <>
                {editedQuestion.options?.map(option => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`correctAnswer-edit-${question.id}`}
                      value={option.id}
                      checked={editedQuestion.correctAnswerId === option.id}
                      onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswerId: e.target.value })}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      className="w-full p-2 bg-yellow-50 border-2 border-blue-400 text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(option.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
                >
                  <PlusCircleIcon className="w-4 h-4 mr-1" />
                  {t('addOption')}
                </button>
              </>
            ) : (
              question.options?.map(option => (
                <div key={option.id} className={`flex items-start p-2 rounded-md ${option.id === question.correctAnswerId ? 'bg-green-50' : 'bg-transparent'}`}>
                  <input
                    type="radio"
                    name={`correctAnswer-read-${question.id}`}
                    value={option.id}
                    checked={question.correctAnswerId === option.id}
                    onChange={(e) => setQuestion({ ...question, correctAnswerId: e.target.value })}
                    className="h-5 w-5 mt-0.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label htmlFor={`read-option-${option.id}`} className="ml-3 block text-sm text-slate-800">
                    <BiasHighlightedText text={option.text} flaggedWords={flaggedWordsSet} />
                  </label>
                  {option.id === question.correctAnswerId && <CheckCircleIcon className="w-5 h-5 ml-auto text-green-600 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        )}

        <div className={`pt-4 space-y-4 overflow-hidden transition-all duration-300 ${isDetailsVisible ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <SourceContextPanel
            citation={question.citation}
            rationale={isEditing ? editedQuestion.rationale : question.rationale}
            isEditing={isEditing}
            onRationaleChange={(value) => setEditedQuestion({ ...editedQuestion, rationale: value })}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
        <button
          onClick={() => setIsDetailsVisible(!isDetailsVisible)}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {isDetailsVisible ? t('hideDetails') : t('showDetails')}
          <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform duration-200 ${isDetailsVisible ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                {t('saveChanges')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSave(question)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <SaveIcon className="w-4 h-4 mr-2" />
                {t('saveQuestion')}
              </button>
              <button
                onClick={handleCopy}
                type="button"
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
              >
                <ClipboardIcon className="w-4 h-4 mr-2" />
                {t('copy')}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                {t('edit')}
              </button>
              <button
                onClick={() => onDiscard(question.id)}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {t('discard')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
