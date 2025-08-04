import React from 'react';
import type { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { ConfigurationPanel } from './ConfigurationPanel';
import { useLanguage } from '../LanguageContext';

interface ReviewQuestionsPageProps {
  questions: Question[];
  totalQuestions: number;
  onUpdateQuestion: (question: Question) => void;
  onDiscardQuestion: (id: string) => void;
  onSaveQuestion: (question: Question) => void;
  onSaveAll: () => void;
  onDiscardAll: () => void;
}

export const ReviewQuestionsPage: React.FC<ReviewQuestionsPageProps> = ({
  questions,
  totalQuestions,
  onUpdateQuestion,
  onDiscardQuestion,
  onSaveQuestion,
  onSaveAll,
  onDiscardAll,
}) => {
  const { t } = useLanguage();

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-700">{t('reviewDraft')}</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <ConfigurationPanel
          questions={questions}
          onSaveAll={onSaveAll}
          onDiscardAll={onDiscardAll}
        />
        <div className="flex-1 space-y-6">
          {questions.map((question, idx) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={idx + 1}
              total={totalQuestions}
              onUpdate={onUpdateQuestion}
              onDiscard={onDiscardQuestion}
              onSave={onSaveQuestion}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewQuestionsPage;
