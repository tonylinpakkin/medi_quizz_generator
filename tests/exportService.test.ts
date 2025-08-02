import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Question } from '../types';

vi.mock('docx', () => {
  return {
    Document: vi.fn().mockImplementation(() => ({ })),
    Packer: { toBlob: vi.fn().mockResolvedValue(new Blob()) },
    Paragraph: vi.fn(),
  };
});

let lastInstance: any;
vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => {
      lastInstance = {
        text: vi.fn(),
        splitTextToSize: vi.fn().mockImplementation((text: string) => [text]),
        save: vi.fn(),
        addPage: vi.fn(),
        internal: {
          pageSize: {
            getHeight: vi.fn().mockReturnValue(40),
            getWidth: vi.fn().mockReturnValue(80),
          },
        },
      };
      return lastInstance;
    }),
  };
});

import { exportQuestionsToWord, exportQuestionsToPDF } from '../services/exportService';
import { jsPDF } from 'jspdf';

const questions: Question[] = [
  {
    id: '1',
    stem: 'Stem',
    options: [
      { id: 'A', text: 'Opt A' },
      { id: 'B', text: 'Opt B' },
      { id: 'C', text: 'Opt C' },
      { id: 'D', text: 'Opt D' },
    ],
    correctAnswerId: 'A',
    rationale: 'Because',
    citation: { source: 'PubMed' },
  },
];

beforeEach(() => {
  lastInstance = undefined;
  (jsPDF as unknown as { mockClear: () => void }).mockClear();
});

describe('exportService', () => {
  it('exports word without throwing', async () => {
    await expect(exportQuestionsToWord(questions)).resolves.not.toThrow();
  });

  it('exports pdf without throwing', () => {
    expect(() => exportQuestionsToPDF(questions)).not.toThrow();
  });

  it('adds a new page when height is exceeded', () => {
    const longQuestions = [questions[0], { ...questions[0], id: '2' }];
    (globalThis as any).window = {};
    exportQuestionsToPDF(longQuestions);
    delete (globalThis as any).window;
    expect(lastInstance.addPage).toHaveBeenCalled();
  });

  it('wraps text when width is exceeded', () => {
    const longQuestion = { ...questions[0], stem: 'This is a very long stem that should exceed the page width and trigger wrapping in the PDF export function.' };
    (globalThis as any).window = {};
    exportQuestionsToPDF([longQuestion]);
    delete (globalThis as any).window;
    expect(lastInstance.splitTextToSize).toHaveBeenCalled();
  });
});
