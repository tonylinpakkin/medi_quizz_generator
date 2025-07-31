import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Extracts text content from a File. Supports plain text, PDF, and Word (docx) files.
 * @param file Browser File object to read
 * @returns text content of file
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    return readAsText(file);
  }

  if (ext === 'pdf') {
    const typedarray = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ');
      text += '\n';
    }
    return text;
  }

  if (ext === 'docx' || ext === 'doc') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  throw new Error('Unsupported file type');
};

const readAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
