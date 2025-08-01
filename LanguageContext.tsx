import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh-Hant';

const translations: Record<Language, Record<string, string>> = {
  en: {
    pasteParagraph: '1. Paste Text or Upload a File',
    provideParagraph: 'Paste a paragraph in the box or upload a PDF, Word or text file. The AI will use this context to create questions.',
    uploadFile: 'Upload document (PDF, Word, or text)',
    fileReadError: 'Failed to read file. Please try another document.',
    generating: 'Generating...',
    generateMcq: 'Generate MCQ',
    reviewEdit: '2. Review & Edit Question',
    reviewDraft: 'This is a draft. Please review, edit, and approve the content. The AI-selected answer is pre-filled.',
    reviewInstruction: 'After reviewing, click Save Question to add it to Saved MCQs.',
    editMode: 'Edit Mode',
    biasFlag: 'Bias Detector Flag',
    potentialBias: 'Potential bias detected for terms: {terms}. Please review the text for appropriate context.',
    potentialBiasShort: 'Potential bias detected',
    questionStem: 'Question Stem',
    options: 'Options',
    citation: 'Citation',
    answerRationale: 'Answer Rationale',
    cancel: 'Cancel',
    saveQuestion: '3. Save Question',
    termsFlagged: 'Terms flagged: {terms}.',
    edit: 'Edit',
    delete: 'Delete',
    savedQuestions: 'Saved Questions',
    exportWord: 'Export Word',
    exportPDF: 'Export PDF',
    copy: 'Copy',
    copied: 'Copied!',
    generatingQuestion: 'AI is drafting your question...',
    generatingWait: 'This may take a few moments.',
    error: 'Error',
    pleaseEnterText: 'Please enter some text from your thesis.',
    failedGenerate: 'Failed to generate MCQ.',
    nonMedicalError: 'Only medical content is supported. Please provide medical text.',
    generateTab: 'Generate MCQ',
    savedTab: 'Saved MCQs',
    footerText: '\u00A9 2024 MCQ Drafter AI. For educational and research purposes only.',
    saveSuccess: 'MCQ saved.',
    viewSaved: 'View Saved MCQs',
    backToInput: 'Back to Input',
    progressStep1: 'Step 1: Input Text',
    progressStep2: 'Step 2: Review Question',
    progressStep3: 'Step 3: Saved MCQs',
    chooseQuestionCount: 'Select number of questions',
    numberOfQuestions: 'Number of questions',
    questionCountDisplay: 'Question {current} of {total}',
    welcome: 'Welcome to MCQ Drafter AI',
    onboardStep1: 'Enter or upload your text on the Generate MCQ tab.',
    onboardStep2: 'Review the AI-generated questions and make edits.',
    onboardStep3: 'Save questions or export them to Word or PDF.',
    onboardGotIt: 'Got it!',
    next: 'Next',
    back: 'Back',
    tour: 'Tour',
    close: 'Close',
  },
  'zh-Hant': {
    pasteParagraph: '1. \u8CBC\u4E0A\u6587\u5B57\u6216\u4E0A\u50B3\u6A94\u6848',
    provideParagraph: '\u63D0\u4F9B\u6BB5\u843D\u6216\u4E0A\u50B3 PDF/Word/\u6587\u672C\u6A94\uFF0CAI \u6703\u4F7F\u7528\u6B64\u5167\u5BB9\u7522\u751F\u984C\u76EE\u3002',
    uploadFile: '\u4E0A\u50B3 PDF\u3001Word \u6216\u6587\u672C\u6A94',
    fileReadError: '\u7121\u6CD5\u8B80\u53D6\u6A94\u6848\uFF0C\u8ACB\u91CD\u8A66\u3002',
    generating: '\u7522\u751F\u4E2D\u2026',
    generateMcq: '\u751F\u6210\u9078\u64C7\u984C',
    reviewEdit: '2. \u5BE9\u95B1\u4E26\u7DE8\u8F2F\u984C\u76EE',
    reviewDraft: '\u6B64\u70BA\u8349\u7A3F\uFF0C\u8ACB\u5BE9\u95B1\u3001\u7DE8\u8F2F\u4E26\u78BA\u8A8D\u5167\u5BB9\u3002AI \u9810\u9078\u7684\u7B54\u6848\u5DF2\u586B\u5165\u3002',
    reviewInstruction: '\u5BE9\u95B1\u5F8C\uFF0C\u9EDE\u64CA\u300C\u5132\u5B58\u984C\u76EE\u300D\u4EE5\u5C07\u5176\u52A0\u5165\u300C\u5DF2\u5132\u5B58\u984C\u76EE\u300D\u3002',
    editMode: '\u7DE8\u8F2F\u6A21\u5F0F',
    biasFlag: '\u504F\u898B\u5075\u6E2C\u8B66\u793A',
    potentialBias: '\u5075\u6E2C\u5230\u53EF\u80FD\u5177\u504F\u898B\u7684\u8A5E\u5F59\uFF1A{terms}\u3002\u8ACB\u6AA2\u8996\u6587\u5B57\u662F\u5426\u5408\u9069\u3002',
    potentialBiasShort: '\u53EF\u80FD\u7684\u504F\u898B\u5DF2\u5075\u6E2C',
    questionStem: '\u984C\u5E79',
    options: '\u9078\u9805',
    citation: '\u4F86\u6E90',
    answerRationale: '\u7B54\u6848\u89E3\u6790',
    cancel: '\u53D6\u6D88',
    saveQuestion: '3. \u5132\u5B58\u984C\u76EE',
    termsFlagged: '\u6A19\u8A18\u8A5E\u5F59\uFF1A{terms}\u3002',
    edit: '\u7DE8\u8F2F',
    delete: '\u522A\u9664',
    savedQuestions: '\u5DF2\u5132\u5B58\u7684\u984C\u76EE',
    exportWord: '\u532F\u51FA Word',
    exportPDF: '\u532F\u51FA PDF',
    copy: '\u8907\u88FD',
    copied: '\u5DF2\u8907\u88FD\uFF01',
    generatingQuestion: 'AI \u6B63\u5728\u64B0\u5BEB\u984C\u76EE\u2026',
    generatingWait: '\u9019\u9700\u8981\u4E00\u4E9B\u6642\u9593\u3002',
    error: '\u932F\u8AA4',
    pleaseEnterText: '\u8ACB\u8F38\u5165\u8AD6\u6587\u5167\u5BB9\u6587\u5B57\u3002',
    failedGenerate: '\u7121\u6CD5\u751F\u6210\u9078\u64C7\u984C\u3002',
    nonMedicalError: '\u6B64\u61C9\u7528\u50C5\u652F\u63F4\u91AB\u7642\u76F8\u95DC\u7684\u5167\u5BB9\uFF0C\u8ACB\u63D0\u4F9B\u91AB\u5B78\u6587\u672C\u3002',
    generateTab: '\u751F\u6210\u984C\u76EE',
    savedTab: '\u5DF2\u5132\u5B58\u984C\u76EE',
    footerText: '\u00A9 2024 MCQ Drafter AI\u3002\u50C5\u4F9B\u6559\u80B2\u8207\u7814\u7A76\u7528\u9014\u3002',
    saveSuccess: '\u984C\u76EE\u5DF2\u5132\u5B58\u3002',
    viewSaved: '\u6AA2\u8996\u5DF2\u5132\u5B58\u984C\u76EE',
    backToInput: '\u8FD4\u56DE\u8F38\u5165\u9801\u9762',
    progressStep1: '\u6B65\u9A5F 1\uFF1A\u8F38\u5165\u5167\u5BB9',
    progressStep2: '\u6B65\u9A5F 2\uFF1A\u5BE9\u95B1\u4E26\u7DE8\u8F2F',
    progressStep3: '\u6B65\u9A5F 3\uFF1A\u67E5\u770B\u5DF2\u5132\u5B58',
    chooseQuestionCount: '\u9078\u64C7\u8981\u751F\u6210\u7684\u984C\u6578',
    numberOfQuestions: '\u984C\u6578',
    questionCountDisplay: '\u7B2C {current}/{total} \u984C',
    welcome: '\u6B61\u8FCE\u4F7F\u7528 MCQ Drafter AI',
    onboardStep1: '\u5728\u300C\u751F\u6210\u984C\u76EE\u300D\u9801\u9762\u8F38\u5165\u6216\u4E0A\u50B3\u6587\u4EF6\u3002',
    onboardStep2: '\u6AA2\u8996 AI \u7522\u751F\u7684\u984C\u76EE\u4E26\u9032\u884C\u7DE8\u8F2F\u3002',
    onboardStep3: '\u5132\u5B58\u984C\u76EE\u6216\u532F\u51FA Word/PDF\u3002',
    onboardGotIt: '\u77E5\u9053\u4E86\uff01',
    next: '\u4E0B\u4E00\u6B65',
    back: '\u4E0A\u4E00\u6B65',
    tour: '\u5C55\u793A',
    close: '\u95DC\u9589',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => translations.en[key] || key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, vars: Record<string, string> = {}) => {
    const template = translations[language]?.[key] ?? translations.en[key] ?? key;
    return Object.entries(vars).reduce((str, [k, v]) => str.replace(`{${k}}`, v), template);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

