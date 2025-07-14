import { openDB, DBSchema } from 'idb';
import { MCQ } from '../types';

interface MCQDB extends DBSchema {
  mcqs: {
    key: string;
    value: MCQ;
  };
}

const dbPromise = openDB<MCQDB>('mcq-db', 1, {
  upgrade(db) {
    db.createObjectStore('mcqs', { keyPath: 'id' });
  },
});

export const getAllMCQs = async (): Promise<MCQ[]> => {
  return (await dbPromise).getAll('mcqs');
};

export const saveMCQ = async (mcq: MCQ): Promise<void> => {
  await (await dbPromise).put('mcqs', mcq);
};

export const deleteMCQ = async (id: string): Promise<void> => {
  await (await dbPromise).delete('mcqs', id);
};
