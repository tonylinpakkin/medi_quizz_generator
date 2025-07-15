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

  mcqs.forEach((mcq, index) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 10;
    }
    doc.text(`${index + 1}. ${mcq.stem}`, 10, y); y += 10;
    mcq.options.forEach(opt => { doc.text(`${opt.id}. ${opt.text}`, 20, y); y += 10; });
    doc.text(`Answer: ${mcq.correctAnswerId}`, 10, y); y += 10;
    if (mcq.rationale) { doc.text(`Rationale: ${mcq.rationale}`, 10, y); y += 10; }
    doc.text(`Source: ${mcq.citation.source}`, 10, y); y += 20;
  });

  doc.save('mcqs.pdf');
};
