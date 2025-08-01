
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ThesisInput } from './components/ThesisInput';
import { MCQReviewCard } from './components/MCQReviewCard';
import { SavedMCQList } from './components/SavedMCQList';
import { ProgressIndicator } from './components/ProgressIndicator';
import { generateMCQFromText } from './services/geminiService';
import { isMedicalContent } from './services/medicalClassifier';
import { getAllMCQs, saveMCQ, deleteMCQ as deleteMCQFromDb } from './services/mcqStorage';
import { MCQ, APIState } from './types';
import LoadingOverlay from './components/LoadingOverlay';
import { useLanguage } from './LanguageContext';

const App: React.FC = () => {
  const [apiState, setApiState] = useState<APIState>(APIState.Idle);
  const [currentMcq, setCurrentMcq] = useState<MCQ | null>(null);
  const [inputText, setInputText] = useState('');
  const [savedMcqs, setSavedMcqs] = useState<MCQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [success, setSuccess] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const { t } = useLanguage();

  const currentStep = currentMcq ? 2 : activeTab === 'saved' ? 3 : 1;

  useEffect(() => {
    getAllMCQs().then(setSavedMcqs).catch((err) => {
      console.error('Failed to load MCQs from IndexedDB', err);
    });
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleGenerateMCQ = useCallback(async (text: string, count = 1) => {
    if (!text.trim()) {
      setError(t('pleaseEnterText'));
      return;
    }

    if (count > 1) {
      setQuestionCount(count);
      setCurrentQuestionIndex(1);
      setRemainingGenerations(count - 1);
    }

    setApiState(APIState.Loading);
    setError(null);
    setCurrentMcq(null);

    try {
      const medical = await isMedicalContent(text);
      if (!medical) {
        setError(t('nonMedicalError'));
        setApiState(APIState.Error);
        setRemainingGenerations(0);
        setQuestionCount(1);
        setCurrentQuestionIndex(1);
        return;
      }

      const generatedMcq = await generateMCQFromText(text, currentQuestionIndex, questionCount);
      setCurrentMcq(generatedMcq);
      setApiState(APIState.Success);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`${t('failedGenerate')} ${errorMessage}`);
      setApiState(APIState.Error);
      setRemainingGenerations(0);
      setQuestionCount(1);
      setCurrentQuestionIndex(1);
    }
  }, [t, questionCount, currentQuestionIndex]);

  const handleSaveMCQ = (mcqToSave: MCQ) => {
    saveMCQ(mcqToSave).catch(err => console.error('Failed to save MCQ', err));
    setSavedMcqs(prevMcqs => {
      const existingIndex = prevMcqs.findIndex(mcq => mcq.id === mcqToSave.id);
      if (existingIndex > -1) {
        const newMcqs = [...prevMcqs];
        newMcqs[existingIndex] = mcqToSave;
        return newMcqs;
      } else {
        return [...prevMcqs, mcqToSave];
      }
    });
    if (remainingGenerations > 0) {
      setRemainingGenerations(prev => prev - 1);
      setCurrentQuestionIndex(prev => prev + 1);
      handleGenerateMCQ(inputText, 1);
    } else {
      setCurrentMcq(null);
      setApiState(APIState.Idle);
      setQuestionCount(1);
      setCurrentQuestionIndex(1);
    }
    setSuccess(t('saveSuccess'));
  };
  
  const handleCancelReview = () => {
    setCurrentMcq(null);
    setApiState(APIState.Idle);
    setError(null);
    setRemainingGenerations(0);
    setQuestionCount(1);
    setCurrentQuestionIndex(1);
  };

  const handleEditMCQ = (mcqId: string) => {
    const mcqToEdit = savedMcqs.find(mcq => mcq.id === mcqId);
    if (mcqToEdit) {
      setCurrentMcq(mcqToEdit);
      setApiState(APIState.Success); 
    }
  };
  
  const handleDeleteMCQ = (mcqId: string) => {
    deleteMCQFromDb(mcqId).catch(err => console.error('Failed to delete MCQ', err));
    setSavedMcqs(prevMcqs => prevMcqs.filter(mcq => mcq.id !== mcqId));
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-6 border-b border-slate-200 flex space-x-2">
          <button
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
        <ProgressIndicator step={currentStep} />

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button
              onClick={() => setActiveTab('saved')}
              className="ml-4 px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded hover:bg-green-300 transition-colors"
            >
              {t('viewSaved')}
            </button>
          </div>
        )}

        {currentMcq ? (
          <div className="animate-fade-in">
            <MCQReviewCard
              key={currentMcq.id}
              initialMcq={currentMcq}
              onSave={handleSaveMCQ}
              onCancel={handleCancelReview}
              questionIndex={currentQuestionIndex}
              totalQuestions={questionCount}
            />
          </div>
        ) : (
          <>
            {activeTab === 'generate' && (
              <>
                <ThesisInput
                  text={inputText}
                  onTextChange={setInputText}
                  onGenerate={handleGenerateMCQ}
                  isLoading={apiState === APIState.Loading}
                />

                {apiState === APIState.Loading && (
                  <LoadingOverlay />
                )}

                {apiState === APIState.Error && (
                  <div className="mt-8 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                    <h3 className="font-bold">{t('error')}</h3>
                    <p>{error}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'saved' && (
              <SavedMCQList
                mcqs={savedMcqs}
                onEdit={handleEditMCQ}
                onDelete={handleDeleteMCQ}
              />
            )}
          </>
        )}
      </main>
      <footer className="text-center py-4 text-sm text-slate-400">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
};

export default App;
