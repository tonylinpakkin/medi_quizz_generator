import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import cors from 'cors';
import type { MCQ } from '../types';

const db = new Database('mcqs.sqlite');

const insertMcqStmt = db.prepare('INSERT INTO mcqs (id, stem, correctAnswerId, citationSource) VALUES (?, ?, ?, ?)');
const insertOptionStmt = db.prepare('INSERT INTO options (id, mcqId, text) VALUES (?, ?, ?)');
const selectMcqsStmt = db.prepare('SELECT id, stem, correctAnswerId, citationSource FROM mcqs');
const selectOptionsStmt = db.prepare('SELECT id, mcqId, text FROM options');
const updateMcqStmt = db.prepare('UPDATE mcqs SET stem = ?, correctAnswerId = ?, citationSource = ? WHERE id = ?');
const deleteOptionsByMcqStmt = db.prepare('DELETE FROM options WHERE mcqId = ?');
const deleteMcqStmt = db.prepare('DELETE FROM mcqs WHERE id = ?');

interface MCQRow {
  id: string;
  stem: string;
  correctAnswerId: string;
  citationSource: string;
}

interface OptionRow {
  id: string;
  mcqId: string;
  text: string;
}

// Initialize tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS mcqs (
    id TEXT PRIMARY KEY,
    stem TEXT,
    correctAnswerId TEXT,
    citationSource TEXT
  );

  CREATE TABLE IF NOT EXISTS options (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT,
    mcqId TEXT,
    text TEXT
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

// Helper to fetch MCQs with options
const getAllMcqs = (): Promise<MCQ[]> => {
  const mcqs = selectMcqsStmt.all() as MCQRow[];
  const options = selectOptionsStmt.all() as OptionRow[];
  const result = mcqs.map(m => ({
    id: m.id,
    stem: m.stem,
    correctAnswerId: m.correctAnswerId,
    citation: { source: m.citationSource },
    options: options.filter(o => o.mcqId === m.id).map(o => ({ id: o.id, text: o.text }))
  }));
  return Promise.resolve(result);
};

const insertMcq = (id: string, mcq: MCQ): Promise<void> => {
  insertMcqStmt.run(id, mcq.stem, mcq.correctAnswerId, mcq.citation.source);
  for (const opt of mcq.options) {
    insertOptionStmt.run(opt.id, id, opt.text);
  }
  return Promise.resolve();
};

const updateMcq = (id: string, mcq: MCQ): Promise<void> => {
  updateMcqStmt.run(mcq.stem, mcq.correctAnswerId, mcq.citation.source, id);
  deleteOptionsByMcqStmt.run(id);
  for (const opt of mcq.options) {
    insertOptionStmt.run(opt.id, id, opt.text);
  }
  return Promise.resolve();
};

const removeMcq = (id: string): Promise<void> => {
  deleteOptionsByMcqStmt.run(id);
  deleteMcqStmt.run(id);
  return Promise.resolve();
};

app.get('/mcqs', async (_req: Request, res: Response) => {
  try {
    const data = await getAllMcqs();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/mcqs', async (req: Request, res: Response) => {
  const mcq = req.body;
  const id = mcq.id || randomUUID();
  try {
    await insertMcq(id, mcq);
    const data = await getAllMcqs();
    res.status(201).json(data.find(m => m.id === id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/mcqs/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const mcq = req.body;
  try {
    await updateMcq(id, mcq);
    const data = await getAllMcqs();
    res.json(data.find(m => m.id === id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/mcqs/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await removeMcq(id);
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
