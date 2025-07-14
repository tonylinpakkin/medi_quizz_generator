export type Language = 'en' | 'zh';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    title: 'MCQ Drafter AI',
    tagline: 'Generate exam questions from your research in seconds.',
    pasteThesis: '1. Paste Your Thesis Paragraph',
    thesisHelp: 'Provide a paragraph from your thesis or clinical notes. The AI will use this context to create a question.',
    generateButton: 'Generate MCQ',
    generating: 'Generating...',
    reviewEdit: 'Review & Edit Question',
    reviewHelp: 'This is a draft. Please review, edit, and approve the content. The AI-selected answer is pre-filled.',
    questionStem: 'Question Stem',
    options: 'Options',
    citation: 'Citation',
    answerRationale: 'Answer Rationale',
    cancel: 'Cancel',
    saveQuestion: 'Save Question',
    biasFlag: 'Bias Detector Flag',
    biasDetected: 'Potential bias detected for terms:',
    biasTerms: 'Terms flagged:',
    generateTab: 'Generate MCQ',
    savedTab: 'Saved MCQs',
    savedQuestions: 'Saved Questions',
    edit: 'Edit',
    delete: 'Delete',
    exportPdf: 'Export PDF',
    loadingTitle: 'AI is drafting your question...',
    loadingSubtitle: 'This may take a few moments.',
    errorTitle: 'Error',
    enterTextError: 'Please enter some text from your thesis.',
    footer: '© 2024 MCQ Drafter AI. For educational and research purposes only.',
    correctAnswer: 'Correct Answer',
    rationale: 'Rationale',
    question: 'Question'
  },
  zh: {
    title: 'MCQ 擬題 AI',
    tagline: '根據您的研究在數秒內生成考題。',
    pasteThesis: '1. 貼上您的論文段落',
    thesisHelp: '提供論文或臨床筆記中的一段文字，AI 將據此產生題目。',
    generateButton: '產生 MCQ',
    generating: '生成中...',
    reviewEdit: '審核並編輯題目',
    reviewHelp: '這是草稿，請審核、編輯並確認內容。AI 已選好答案。',
    questionStem: '題目',
    options: '選項',
    citation: '出處',
    answerRationale: '解答說明',
    cancel: '取消',
    saveQuestion: '保存題目',
    biasFlag: '偏見偵測警示',
    biasDetected: '偵測到可能含有偏見的詞語：',
    biasTerms: '標記詞語：',
    generateTab: '產生 MCQ',
    savedTab: '已儲存 MCQ',
    savedQuestions: '已儲存題目',
    edit: '編輯',
    delete: '刪除',
    exportPdf: '匯出 PDF',
    loadingTitle: 'AI 正在生成題目...',
    loadingSubtitle: '可能需要一點時間。',
    errorTitle: '錯誤',
    enterTextError: '請輸入論文中的文字。',
    footer: '© 2024 MCQ 擬題 AI。僅供教育與研究使用。',
    correctAnswer: '正確答案',
    rationale: '說明',
    question: '題目'
  }
};

import React, { createContext, useContext } from 'react';

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (l: Language) => void;
}>({ language: 'en', setLanguage: () => {} });

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);
  const t = (key: string) => translations[language][key] || translations.en[key] || key;
  return t;
};
