export async function parseFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ext = name.substring(name.lastIndexOf('.') + 1);
  if (ext === 'txt') {
    return file.text();
  }
  if (ext === 'pdf') {
    const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174/build/pdf?esm');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(' ') + '\n';
    }
    return text;
  }
  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('https://esm.sh/mammoth@1.4.25');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
}
