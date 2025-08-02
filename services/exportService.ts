import { Document, Packer, Paragraph } from 'docx';
import { jsPDF } from 'jspdf';
import type { Question } from '../types';

export const exportQuestionsToWord = async (questions: Question[]): Promise<void> => {
  const paragraphs: Paragraph[] = [];

  questions.forEach((question, index) => {
    paragraphs.push(new Paragraph({ text: `${index + 1}. ${question.stem}` }));
    question.options?.forEach(opt => {
      paragraphs.push(new Paragraph({ text: `${opt.id}. ${opt.text}` }));
    });
    const answerText = question.correctAnswerId ?? question.answer;
    if (answerText !== undefined) {
      paragraphs.push(new Paragraph({ text: `Answer: ${answerText}` }));
    }
    if (question.rationale) {
      paragraphs.push(new Paragraph({ text: `Rationale: ${question.rationale}` }));
    }
    paragraphs.push(new Paragraph({ text: `Source: ${question.citation.source}` }));
    paragraphs.push(new Paragraph({ text: '' }));
  });

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.docx';
    a.click();
    URL.revokeObjectURL(url);
  }
};

export const exportQuestionsToPDF = (questions: Question[]): void => {
  if (typeof window === 'undefined') return;
  const doc = new jsPDF();
  let y = 10;
  const pageHeight = (doc as any).internal?.pageSize?.getHeight?.() ?? 0;
  const pageWidth = (doc as any).internal?.pageSize?.getWidth?.() ?? 0;
  const margin = 10;

  const addWrappedText = (text: string, x: number) => {
    const maxWidth = pageWidth - margin - x;
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach(line => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, x, y);
      y += 10;
    });
  };

  questions.forEach((question, index) => {
    addWrappedText(`${index + 1}. ${question.stem}`, margin);
    question.options?.forEach(opt => { addWrappedText(`${opt.id}. ${opt.text}`, margin + 10); });
    const answerText = question.correctAnswerId ?? question.answer;
    if (answerText !== undefined) { addWrappedText(`Answer: ${answerText}`, margin); }
    if (question.rationale) { addWrappedText(`Rationale: ${question.rationale}`, margin); }
    addWrappedText(`Source: ${question.citation.source}`, margin);
    y += 10;
  });

  doc.save('questions.pdf');
};
