
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ThesisInput } from './components/ThesisInput';
import { MCQReviewCard } from './components/MCQReviewCard';
import { SavedMCQList } from './components/SavedMCQList';
import { generateMCQFromText } from './services/geminiService';
import { MCQ, APIState } from './types';
import { LoadingSpinner } from './components/icons';

const App: React.FC = () => {
  const [apiState, setApiState] = useState<APIState>(APIState.Idle);
  const [currentMcq, setCurrentMcq] = useState<MCQ | null>(null);
  const [savedMcqs, setSavedMcqs] = useState<MCQ[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost:3001/mcqs';

  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to load saved questions');
        const data = await res.json();
        setSavedMcqs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMcqs();
  }, []);

  const handleGenerateMCQ = useCallback(async (text: string) => {
    if (!text.trim()) {
      setError("Please enter some text from your thesis.");
      return;
    }
    setApiState(APIState.Loading);
    setError(null);
    setCurrentMcq(null);

    try {
      const generatedMcq = await generateMCQFromText(text);
      setCurrentMcq(generatedMcq);
      setApiState(APIState.Success);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate MCQ. ${errorMessage}`);
      setApiState(APIState.Error);
    }
  }, []);

  const handleSaveMCQ = async (mcqToSave: MCQ) => {
    const exists = savedMcqs.some(m => m.id === mcqToSave.id);
    const method = exists ? 'PUT' : 'POST';
    const url = exists ? `${API_BASE}/${mcqToSave.id}` : API_BASE;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mcqToSave)
    });

    if (exists) {
      setSavedMcqs(prev => prev.map(m => (m.id === mcqToSave.id ? mcqToSave : m)));
    } else {
      setSavedMcqs(prev => [...prev, mcqToSave]);
    }

    setCurrentMcq(null);
    setApiState(APIState.Idle);
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
  
  const handleDeleteMCQ = async (mcqId: string) => {
    await fetch(`${API_BASE}/${mcqId}`, { method: 'DELETE' });
    setSavedMcqs(prevMcqs => prevMcqs.filter(mcq => mcq.id !== mcqId));
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
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
            <ThesisInput onGenerate={handleGenerateMCQ} isLoading={apiState === APIState.Loading} />

            {apiState === APIState.Loading && (
              <div className="flex flex-col items-center justify-center mt-12 text-center bg-white p-8 rounded-lg shadow-md border border-slate-200">
                <LoadingSpinner className="w-12 h-12 text-blue-600" />
                <p className="mt-4 text-lg font-medium text-slate-600">AI is drafting your question...</p>
                <p className="text-sm text-slate-500">This may take a few moments.</p>
              </div>
            )}

            {apiState === APIState.Error && (
              <div className="mt-8 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
              </div>
            )}

            <SavedMCQList 
              mcqs={savedMcqs}
              onEdit={handleEditMCQ}
              onDelete={handleDeleteMCQ}
            />
          </>
        )}
      </main>
      <footer className="text-center py-4 text-sm text-slate-400">
        <p>&copy; 2024 MCQ Drafter AI. For educational and research purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
