
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ThesisInput } from './components/ThesisInput';
import { MCQReviewCard } from './components/MCQReviewCard';
import { SavedMCQList } from './components/SavedMCQList';
import { Tour } from './components/Tour';
import { generateQuestionFromText } from './services/geminiService';
import { isMedicalContent } from './services/medicalClassifier';
import { getAllMCQs, saveMCQ, deleteMCQ as deleteMCQFromDb } from './services/mcqStorage';
import { Question, QuestionType, APIState } from './types';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import { ToastProvider, useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const [apiState, setApiState] = useState<APIState>(APIState.Idle);
  const [currentMcqs, setCurrentMcqs] = useState<Question[]>([]);
  const [inputText, setInputText] = useState('');
  const [savedMcqs, setSavedMcqs] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [questionCount, setQuestionCount] = useState(1);
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MCQ);
  const [runTour, setRunTour] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    getAllMCQs().then(setSavedMcqs).catch((err) => {
      console.error('Failed to load MCQs from IndexedDB', err);
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
    setCurrentMcqs([]);
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
        const mcq = await generateQuestionFromText(text, QuestionType.MCQ, i, count);
        generated.push(mcq);
        setCurrentMcqs([...generated]);
      }

      setApiState(APIState.Success);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`${t('failedGenerate')} ${errorMessage}`);
      setApiState(APIState.Error);
      setQuestionCount(1);
      setCurrentMcqs([]);
    }
  }, [t, questionType]);

  const handleUpdateCurrentMCQ = useCallback((updatedMcq: Question) => {
    setCurrentMcqs(prev => prev.map(mcq => mcq.id === updatedMcq.id ? updatedMcq : mcq));
  }, []);

  const handleSaveAll = useCallback(async () => {
    try {
      for (const mcq of currentMcqs) {
        await saveMCQ(mcq);
      }
      setSavedMcqs(prev => [...prev, ...currentMcqs]);
      setCurrentMcqs([]);
      setApiState(APIState.Idle);
      setQuestionCount(1);
      addToast(t('saveSuccessMultiple', { count: currentMcqs.length }), 'success');
    } catch (err) {
      console.error('Failed to save all MCQs', err);
      setError(t('failedSave'));
      setApiState(APIState.Error);
    }
  }, [currentMcqs, t]);
  
  const handleDiscardAll = useCallback(() => {
    setCurrentMcqs([]);
    setApiState(APIState.Idle);
    setError(null);
    setQuestionCount(1);
  }, []);

  const handleDiscardSingle = useCallback((mcqId: string) => {
    setCurrentMcqs(prev => prev.filter(mcq => mcq.id !== mcqId));
  }, []);

  const handleSaveSingle = useCallback(async (mcq: Question) => {
    try {
      await saveMCQ(mcq);
      setSavedMcqs(prev => [...prev, mcq]);
      setCurrentMcqs(prev => prev.filter(m => m.id !== mcq.id));
      addToast(t('saveSuccess'), 'success');
    } catch (err) {
      console.error('Failed to save MCQ', err);
      setError(t('failedSave'));
      setApiState(APIState.Error);
    }
  }, [addToast, t]);

  const handleUpdateSavedMCQ = useCallback((updatedMcq: Question) => {
    saveMCQ(updatedMcq).catch(err => console.error('Failed to update MCQ', err));
    setSavedMcqs(prevMcqs => prevMcqs.map(mcq => mcq.id === updatedMcq.id ? updatedMcq : mcq));
  }, []);
  
  const handleDeleteMCQ = useCallback((mcqId: string) => {
    deleteMCQFromDb(mcqId).catch(err => console.error('Failed to delete MCQ', err));
    setSavedMcqs(prevMcqs => prevMcqs.filter(mcq => mcq.id !== mcqId));
  }, []);

  const handleDeleteSelectedMCQs = useCallback((mcqIds: string[]) => {
    mcqIds.forEach(mcqId => {
      deleteMCQFromDb(mcqId).catch(err => console.error('Failed to delete MCQ', err));
    });
    setSavedMcqs(prevMcqs => prevMcqs.filter(mcq => !mcqIds.includes(mcq.id)));
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
        <nav className="mb-6 border-b border-slate-200 flex space-x-2">
          <button
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

            {currentMcqs.length > 0 && (
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
                  {currentMcqs.map((mcq, idx) => (
                    <MCQReviewCard
                      key={mcq.id}
                      initialMcq={mcq}
                      onUpdate={handleUpdateCurrentMCQ}
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
          <SavedMCQList
            mcqs={savedMcqs}
            onUpdate={handleUpdateSavedMCQ}
            onDelete={handleDeleteMCQ}
            onDeleteSelected={handleDeleteSelectedMCQs}
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
