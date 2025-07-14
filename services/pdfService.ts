import { PDFDocument, rgb } from 'pdf-lib';
import { MCQ } from '../types';
import { Language, translations } from '../translations';

export const exportMCQToPDF = async (mcq: MCQ, lang: Language) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const fontBytes = await fetch('/assets/fonts/NotoSansTC-Regular.otf').then(r => r.arrayBuffer());
  const font = await pdfDoc.embedFont(fontBytes);

  const t = translations[lang];
  let y = height - 50;
  page.drawText(`${t.question}: ${mcq.stem}`, { x: 50, y, size: 14, font, color: rgb(0,0,0) });
  y -= 25;
  mcq.options.forEach(opt => {
    page.drawText(`${opt.id}. ${opt.text}`, { x: 60, y, size: 12, font });
    y -= 20;
  });
  page.drawText(`${t.correctAnswer}: ${mcq.correctAnswerId}`, { x: 50, y, size: 12, font });
  y -= 20;
  page.drawText(`${t.rationale}: ${mcq.rationale}`, { x: 50, y, size: 12, font });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mcq-${mcq.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
