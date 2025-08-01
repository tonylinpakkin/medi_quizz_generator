import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UITour from '../components/UITour';
import { LanguageProvider } from '../LanguageContext';

const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('UITour', () => {
  it('advances through steps and calls onFinish', () => {
    const finish = vi.fn();
    const { getByText } = render(<UITour onFinish={finish} />, { wrapper: Wrapper });

    expect(getByText('Enter or upload your text on the Generate MCQ tab.')).toBeInTheDocument();
    fireEvent.click(getByText('Next'));
    expect(getByText('Review the AI-generated questions and make edits.')).toBeInTheDocument();
    fireEvent.click(getByText('Back'));
    expect(getByText('Enter or upload your text on the Generate MCQ tab.')).toBeInTheDocument();
    fireEvent.click(getByText('Next'));
    fireEvent.click(getByText('Next'));
    fireEvent.click(getByText('Got it!'));
    expect(finish).toHaveBeenCalled();
  });
});
