// @vitest-environment jsdom
import React from 'react';
import { vi, expect, describe, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MCQReviewCard } from '../components/MCQReviewCard';
import { LanguageProvider } from '../LanguageContext';
import { ToastProvider } from '../ToastContext';
import type { MCQ } from '../types';

const sampleMcq: MCQ = {
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

describe('MCQReviewCard', () => {
  it('calls onSave when Save Question button is clicked', () => {
    const onSave = vi.fn();
    const onUpdate = vi.fn();
    const onDiscard = vi.fn();

    render(
      <LanguageProvider>
        <ToastProvider>
          <MCQReviewCard
            initialMcq={sampleMcq}
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

    expect(onSave).toHaveBeenCalledWith(sampleMcq);
  });
});

