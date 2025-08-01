import { Document, Packer, Paragraph } from 'docx';
import { jsPDF } from 'jspdf';
import type { MCQ } from '../types';

export const exportMCQsToWord = async (mcqs: MCQ[]): Promise<void> => {
  const paragraphs: Paragraph[] = [];

  mcqs.forEach((mcq, index) => {
    paragraphs.push(new Paragraph({ text: `${index + 1}. ${mcq.stem}` }));
    mcq.options.forEach(opt => {
      paragraphs.push(new Paragraph({ text: `${opt.id}. ${opt.text}` }));
    });
    paragraphs.push(new Paragraph({ text: `Answer: ${mcq.correctAnswerId}` }));
    if (mcq.rationale) {
      paragraphs.push(new Paragraph({ text: `Rationale: ${mcq.rationale}` }));
    }
    paragraphs.push(new Paragraph({ text: `Source: ${mcq.citation.source}` }));
    paragraphs.push(new Paragraph({ text: '' }));
  });

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcqs.docx';
    a.click();
    URL.revokeObjectURL(url);
  }
}; 

export const exportMCQsToPDF = (mcqs: MCQ[]): void => {
  if (typeof window === 'undefined') return;
  const doc = new jsPDF();
  let y = 10;
  const pageHeight = (doc as any).internal?.pageSize?.getHeight?.() ?? 0;
  const pageWidth = (doc as any).internal?.pageSize?.getWidth?.() ?? 0;
  const margin = 10;

  const addWrappedText = (text: string, x: number) => {
    const maxWidth = pageWidth - margin - x;
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, x, y);
      y += 10;
    });
  };

  mcqs.forEach((mcq, index) => {
    addWrappedText(`${index + 1}. ${mcq.stem}`, margin);
    mcq.options.forEach(opt => { addWrappedText(`${opt.id}. ${opt.text}`, margin + 10); });
    addWrappedText(`Answer: ${mcq.correctAnswerId}`, margin);
    if (mcq.rationale) { addWrappedText(`Rationale: ${mcq.rationale}`, margin); }
    addWrappedText(`Source: ${mcq.citation.source}`, margin);
    y += 10;
  });

  doc.save('mcqs.pdf');
};
