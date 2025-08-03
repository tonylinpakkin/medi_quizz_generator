
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ThesisInput } from './components/ThesisInput';
import { QuestionReviewCard } from './components/QuestionReviewCard';
import { SavedQuestionList } from './components/SavedQuestionList';
import { Tour } from './components/Tour';
import { generateQuestionFromText } from './services/geminiService';
import { isMedicalContent } from './services/medicalClassifier';
import { getAllQuestions, saveQuestion, deleteQuestion as deleteQuestionFromDb } from './services/questionStorage';
import { Question, APIState, QuestionType } from './types';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import { ToastProvider, useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const [apiState, setApiState] = useState<APIState>(APIState.Idle);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [inputText, setInputText] = useState('');
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [questionCount, setQuestionCount] = useState(1);
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MultipleChoice);
  const [runTour, setRunTour] = useState(false);
  const { t } = useLanguage();

  const generateTabRef = useRef<HTMLButtonElement>(null);
  const savedTabRef = useRef<HTMLButtonElement>(null);

  const handleTabKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const nextTab = event.currentTarget === generateTabRef.current ? 'saved' : 'generate';
      setActiveTab(nextTab);
      const nextRef = nextTab === 'generate' ? generateTabRef : savedTabRef;
      nextRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    getAllQuestions().then(setSavedQuestions).catch((err) => {
      console.error('Failed to load questions from IndexedDB', err);
    });
  }, []);

  useEffect(() => {
    if (localStorage.getItem('onboardingSeen') !== '1') {
      setRunTour(true);
    }
  }, []);

  const handleGenerateQuestion = useCallback(async (text: string, count = 1) => {
    if (!text.trim()) {
      setError(t('pleaseEnterText'));
      return;
    }

    setApiState(APIState.Loading);
    setError(null);
    setCurrentQuestions([]);
    setQuestionCount(count);

    try {
      const medical = await isMedicalContent(text);
      if (!medical) {
        setError(t('nonMedicalError'));
        setApiState(APIState.Error);
        setQuestionCount(1);
        return;
      }

      const generated: Question[] = [];
      for (let i = 1; i <= count; i++) {
        const question = await generateQuestionFromText(text, questionType, i, count);
        generated.push(question);
        setCurrentQuestions([...generated]);
      }

      setApiState(APIState.Success);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`${t('failedGenerate')} ${errorMessage}`);
      setApiState(APIState.Error);
      setQuestionCount(1);
      setCurrentQuestions([]);
    }
  }, [t, questionType]);

  const handleUpdateCurrentQuestion = useCallback((updatedQuestion: Question) => {
    setCurrentQuestions(prev => prev.map(question => question.id === updatedQuestion.id ? updatedQuestion : question));
  }, []);

  const handleSaveAll = useCallback(async () => {
    try {
      for (const question of currentQuestions) {
        await saveQuestion(question);
      }
      setSavedQuestions(prev => [...prev, ...currentQuestions]);
      setCurrentQuestions([]);
      setApiState(APIState.Idle);
      setQuestionCount(1);
      addToast(t('saveSuccessMultiple', { count: currentQuestions.length }), 'success');
    } catch (err) {
      console.error('Failed to save all questions', err);
      setError(t('failedSave'));
      setApiState(APIState.Error);
    }
  }, [currentQuestions, t]);
  
  const handleDiscardAll = useCallback(() => {
    setCurrentQuestions([]);
    setApiState(APIState.Idle);
    setError(null);
    setQuestionCount(1);
  }, []);

  const handleDiscardSingle = useCallback((questionId: string) => {
    setCurrentQuestions(prev => prev.filter(question => question.id !== questionId));
  }, []);

  const handleSaveSingle = useCallback(async (question: Question) => {
    try {
      await saveQuestion(question);
      setSavedQuestions(prev => [...prev, question]);
      setCurrentQuestions(prev => prev.filter(m => m.id !== question.id));
      addToast(t('saveSuccess'), 'success');
    } catch (err) {
      console.error('Failed to save question', err);
      setError(t('failedSave'));
      setApiState(APIState.Error);
    }
  }, [addToast, t]);

  const handleUpdateSavedQuestion = useCallback((updatedQuestion: Question) => {
    saveQuestion(updatedQuestion).catch(err => console.error('Failed to update question', err));
    setSavedQuestions(prevQuestions => prevQuestions.map(question => question.id === updatedQuestion.id ? updatedQuestion : question));
  }, []);
  
  const handleDeleteQuestion = useCallback((questionId: string) => {
    deleteQuestionFromDb(questionId).catch(err => console.error('Failed to delete question', err));
    setSavedQuestions(prevQuestions => prevQuestions.filter(question => question.id !== questionId));
  }, []);

  const handleDeleteSelectedQuestions = useCallback((questionIds: string[]) => {
    questionIds.forEach(questionId => {
      deleteQuestionFromDb(questionId).catch(err => console.error('Failed to delete question', err));
    });
    setSavedQuestions(prevQuestions => prevQuestions.filter(question => !questionIds.includes(question.id)));
  }, []);

  const handleTourClose = () => {
    setRunTour(false);
    localStorage.setItem('onboardingSeen', '1');
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Tour run={runTour} onClose={handleTourClose} />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <nav role="tablist" className="mb-6 border-b border-slate-200 flex space-x-2">
          <button
            role="tab"
            aria-selected={activeTab === 'generate'}
            tabIndex={activeTab === 'generate' ? 0 : -1}
            ref={generateTabRef}
            onKeyDown={handleTabKeyDown}
            id="tour-generate-tab"
            className={`px-4 py-2 rounded-t shadow-sm ${
              activeTab === 'generate'
                ? 'bg-white text-blue-600 font-semibold'
                : 'text-slate-600'
            }`}
            onClick={() => setActiveTab('generate')}
          >
            {t('generateTab')}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'saved'}
            tabIndex={activeTab === 'saved' ? 0 : -1}
            ref={savedTabRef}
            onKeyDown={handleTabKeyDown}
            id="tour-saved-tab"
            className={`px-4 py-2 rounded-t shadow-sm ${
              activeTab === 'saved'
                ? 'bg-white text-blue-600 font-semibold'
                : 'text-slate-600'
            }`}
            onClick={() => setActiveTab('saved')}
          >
          {t('savedTab')}
          </button>
        </nav>

        {activeTab === 'generate' && (
          <>
            <ThesisInput
              text={inputText}
              onTextChange={setInputText}
              onGenerate={handleGenerateQuestion}
              isLoading={apiState === APIState.Loading}
              onError={(fileError) => {
                setError(fileError);
                setApiState(APIState.Error);
              }}
              questionType={questionType}
              onQuestionTypeChange={setQuestionType}
            />

            {apiState === APIState.Loading && <LoadingOverlay />}

            {apiState === APIState.Error && error && (
              <ErrorOverlay
                message={error}
                onClose={() => {
                  setApiState(APIState.Idle);
                  setError(null);
                  setQuestionCount(1);
                }}
              />
            )}

            {currentQuestions.length > 0 && (
              <div className="mt-8 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-700">{t('reviewDraft')}</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveAll}
                      className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
                    >
                      {t('saveAll')}
                    </button>
                    <button
                      onClick={handleDiscardAll}
                      className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-md border border-slate-300 hover:bg-slate-100"
                    >
                      {t('discardAll')}
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {currentQuestions.map((question, idx) => (
                    <QuestionReviewCard
                      key={question.id}
                      initialQuestion={question}
                      onUpdate={handleUpdateCurrentQuestion}
                      onDiscard={handleDiscardSingle}
                      onSave={handleSaveSingle}
                      questionIndex={idx + 1}
                      totalQuestions={questionCount}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <SavedQuestionList
            questions={savedQuestions}
            onUpdate={handleUpdateSavedQuestion}
            onDelete={handleDeleteQuestion}
            onDeleteSelected={handleDeleteSelectedQuestions}
            onSwitchToGenerateTab={() => setActiveTab('generate')}
          />
        )}
      </main>
      <footer className="text-center py-4 text-sm text-slate-400">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
