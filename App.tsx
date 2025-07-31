
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ThesisInput } from './components/ThesisInput';
import { MCQReviewCard } from './components/MCQReviewCard';
import { SavedMCQList } from './components/SavedMCQList';
import { generateMCQFromText } from './services/geminiService';
import { isMedicalContent } from './services/medicalClassifier';
import { getAllMCQs, saveMCQ, deleteMCQ as deleteMCQFromDb } from './services/mcqStorage';
import { MCQ, APIState } from './types';
import { LoadingSpinner } from './components/icons';
import { useLanguage } from './LanguageContext';

const App: React.FC = () => {
  const [apiState, setApiState] = useState<APIState>(APIState.Idle);
  const [currentMcq, setCurrentMcq] = useState<MCQ | null>(null);
  const [savedMcqs, setSavedMcqs] = useState<MCQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useLanguage();

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

  const handleGenerateMCQ = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError(t('pleaseEnterText'));
      return;
    }
    setApiState(APIState.Loading);
    setError(null);
    setCurrentMcq(null);

    try {
      const medical = await isMedicalContent(text);
      if (!medical) {
        setError(t('nonMedicalError'));
        setApiState(APIState.Error);
        return;
      }

      const generatedMcq = await generateMCQFromText(text);
      setCurrentMcq(generatedMcq);
      setApiState(APIState.Success);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`${t('failedGenerate')} ${errorMessage}`);
      setApiState(APIState.Error);
    }
  }, []);

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
    setCurrentMcq(null);
    setApiState(APIState.Idle);
    setSuccess(t('saveSuccess'));
    setActiveTab('saved');
  };
  
  const handleCancelReview = () => {
    setCurrentMcq(null);
    setApiState(APIState.Idle);
    setError(null);
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
        <nav className="mb-6 border-b border-slate-200 flex space-x-6">
          <button
            className={`pb-2 ${activeTab === 'generate' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-600'}`}
            onClick={() => setActiveTab('generate')}
          >
            {t('generateTab')}
          </button>
          <button
            className={`pb-2 ${activeTab === 'saved' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-600'}`}
            onClick={() => setActiveTab('saved')}
          >
          {t('savedTab')}
          </button>
        </nav>

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        {currentMcq ? (
          <div className="animate-fade-in">
            <MCQReviewCard
              key={currentMcq.id}
              initialMcq={currentMcq}
              onSave={handleSaveMCQ}
              onCancel={handleCancelReview}
            />
          </div>
        ) : (
          <>
            {activeTab === 'generate' && (
              <>
                <ThesisInput onGenerate={handleGenerateMCQ} isLoading={apiState === APIState.Loading} />

                {apiState === APIState.Loading && (
                  <div className="flex flex-col items-center justify-center mt-12 text-center bg-white p-8 rounded-lg shadow-md border border-slate-200">
                    <LoadingSpinner className="w-12 h-12 text-blue-600" />
                    <p className="mt-4 text-lg font-medium text-slate-600">{t('generatingQuestion')}</p>
                    <p className="text-sm text-slate-500">{t('generatingWait')}</p>
                  </div>
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
