import { openDB, DBSchema } from 'idb';
import { Question } from '../types';

interface MCQDB extends DBSchema {
  mcqs: {
    key: string;
    value: Question;
  };
}

const dbPromise = openDB<MCQDB>('mcq-db', 1, {
  upgrade(db) {
    db.createObjectStore('mcqs', { keyPath: 'id' });
  },
});

export const getAllMCQs = async (): Promise<Question[]> => {
  return (await dbPromise).getAll('mcqs');
};

export const saveMCQ = async (mcq: Question): Promise<void> => {
  await (await dbPromise).put('mcqs', mcq);
};

export const deleteMCQ = async (id: string): Promise<void> => {
  await (await dbPromise).delete('mcqs', id);
};
