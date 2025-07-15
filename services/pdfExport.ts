import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { MCQ } from '../types';
import { arrayBufferToBase64 } from './base64';

(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

const TC_FONT_URL = 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf';

async function loadChineseFont(): Promise<void> {
  if (!('NotoSansCJKtc-Regular.otf' in pdfMake.vfs)) {
    const res = await fetch(TC_FONT_URL);
    const buffer = await res.arrayBuffer();
    const base64String = arrayBufferToBase64(buffer);
    pdfMake.vfs['NotoSansCJKtc-Regular.otf'] = base64String;
    pdfMake.fonts = {
      ...pdfMake.fonts,
      NotoSansTC: {
        normal: 'NotoSansCJKtc-Regular.otf',
        bold: 'NotoSansCJKtc-Regular.otf',
        italics: 'NotoSansCJKtc-Regular.otf',
        bolditalics: 'NotoSansCJKtc-Regular.otf'
      }
    };
  }
}

export const exportMcqToPdf = async (mcq: MCQ, lang: string): Promise<void> => {
  if (lang === 'zh-Hant') {
    await loadChineseFont();
  }

  const dd: any = {
    content: [
      { text: mcq.stem, style: 'header' },
      { ul: mcq.options.map(o => `${o.id}. ${o.text}`) },
      { text: `${mcq.citation.source}`, margin: [0, 10, 0, 0] },
      { text: mcq.rationale, margin: [0, 10, 0, 0] }
    ],
    defaultStyle: {
      font: lang === 'zh-Hant' ? 'NotoSansTC' : 'Roboto'
    }
  };

  pdfMake.createPdf(dd).download('mcq.pdf');
};
