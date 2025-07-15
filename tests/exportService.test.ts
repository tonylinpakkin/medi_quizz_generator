import { describe, it, expect, vi } from 'vitest';
import type { MCQ } from '../types';

vi.mock('docx', () => {
  return {
    Document: vi.fn().mockImplementation(() => ({ })),
    Packer: { toBlob: vi.fn().mockResolvedValue(new Blob()) },
    Paragraph: vi.fn(),
  };
});

vi.mock('jspdf', () => {
  return {
    jsPDF: vi.fn().mockImplementation(() => ({ text: vi.fn(), save: vi.fn() })),
  };
});

import { exportMCQsToWord, exportMCQsToPDF } from '../services/exportService';

const mcqs: MCQ[] = [
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

describe('exportService', () => {
  it('exports word without throwing', async () => {
    await expect(exportMCQsToWord(mcqs)).resolves.not.toThrow();
  });

  it('exports pdf without throwing', () => {
    expect(() => exportMCQsToPDF(mcqs)).not.toThrow();
  });
});
