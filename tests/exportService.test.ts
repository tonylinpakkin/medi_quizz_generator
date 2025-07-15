import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MCQ } from '../types';

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
        save: vi.fn(),
        addPage: vi.fn(),
        internal: { pageSize: { getHeight: vi.fn().mockReturnValue(40) } },
      };
      return lastInstance;
    }),
  };
});

import { exportMCQsToWord, exportMCQsToPDF } from '../services/exportService';
import { jsPDF } from 'jspdf';

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

beforeEach(() => {
  lastInstance = undefined;
  (jsPDF as unknown as { mockClear: () => void }).mockClear();
});

describe('exportService', () => {
  it('exports word without throwing', async () => {
    await expect(exportMCQsToWord(mcqs)).resolves.not.toThrow();
  });

  it('exports pdf without throwing', () => {
    expect(() => exportMCQsToPDF(mcqs)).not.toThrow();
  });

  it('adds a new page when height is exceeded', () => {
    const longMcqs = [mcqs[0], { ...mcqs[0], id: '2' }];
    (globalThis as any).window = {};
    exportMCQsToPDF(longMcqs);
    delete (globalThis as any).window;
    expect(lastInstance.addPage).toHaveBeenCalled();
  });
});
