// @vitest-environment jsdom
import React from 'react';
import { vi, expect, describe, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QuestionReviewCard } from '../components/QuestionReviewCard';
import { LanguageProvider } from '../LanguageContext';
import { ToastProvider } from '../ToastContext';
import type { Question } from '../types';

const sampleQuestion: Question = {
  id: '1',
  stem: 'Sample question?',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
  ],
  correctAnswerId: 'a',
  rationale: 'Because it is correct.',
  citation: { source: 'source' },
};

describe('QuestionReviewCard', () => {
  it('calls onSave when Save Question button is clicked', () => {
    const onSave = vi.fn();
    const onUpdate = vi.fn();
    const onDiscard = vi.fn();

    render(
      <LanguageProvider>
        <ToastProvider>
          <QuestionReviewCard
            initialQuestion={sampleQuestion}
            onUpdate={onUpdate}
            onDiscard={onDiscard}
            onSave={onSave}
            questionIndex={1}
            totalQuestions={1}
          />
        </ToastProvider>
      </LanguageProvider>
    );

    const saveButton = screen.getByRole('button', { name: /save question/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(sampleQuestion);
  });
});

