import { openDB, DBSchema } from 'idb';
import { Question } from '../types';

interface QuestionDB extends DBSchema {
  questions: {
    key: string;
    value: Question;
  };
}

const dbPromise = openDB<QuestionDB>('question-db', 1, {
  upgrade(db) {
    db.createObjectStore('questions', { keyPath: 'id' });
  },
});

export const getAllQuestions = async (): Promise<Question[]> => {
  return (await dbPromise).getAll('questions');
};

export const saveQuestion = async (question: Question): Promise<void> => {
  await (await dbPromise).put('questions', question);
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await (await dbPromise).delete('questions', id);
};
