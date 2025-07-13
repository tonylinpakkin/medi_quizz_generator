import express, { Request, Response } from 'express';
import litesql from 'litesql';
import { randomUUID } from 'crypto';
import cors from 'cors';
import type { MCQ } from '../types';

const db = litesql.db('mcqs.sqlite');

interface MCQRow {
  id: string;
  stem: string;
  correctAnswerId: string;
  citationSource: string;
}

interface OptionRow {
  rowid: number;
  id: string;
  mcqId: string;
  text: string;
}

// Initialize tables if they don't exist
// litesql will ignore creation if table already exists
// `pk` is shorthand for "INTEGER PRIMARY KEY AUTOINCREMENT"

db.createTable('mcqs', {
  id: 'text primary key',
  stem: 'text',
  correctAnswerId: 'text',
  citationSource: 'text'
}).run();

db.createTable('options', {
  rowid: 'pk',
  id: 'text',
  mcqId: 'text',
  text: 'text'
}).run();

const mcqsTable = new litesql.Table('mcqs', 'id', db);
const optionsTable = new litesql.Table('options', 'rowid', db);

const app = express();
app.use(cors());
app.use(express.json());

// Helper to fetch MCQs with options
const getAllMcqs = async (): Promise<MCQ[]> => {
  const mcqs = await new Promise<MCQRow[]>((resolve, reject) => {
    mcqsTable.find().all((err: Error | null, rows: MCQRow[]) => {
      if (err) reject(err); else resolve(rows);
    });
  });
  const options = await new Promise<OptionRow[]>((resolve, reject) => {
    optionsTable.find().all((err: Error | null, rows: OptionRow[]) => {
      if (err) reject(err); else resolve(rows);
    });
  });
  return mcqs.map(m => ({
    id: m.id,
    stem: m.stem,
    correctAnswerId: m.correctAnswerId,
    citation: { source: m.citationSource },
    options: options.filter(o => o.mcqId === m.id).map(o => ({ id: o.id, text: o.text }))
  }));
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
    await new Promise((resolve, reject) => {
      mcqsTable.insert({ id, stem: mcq.stem, correctAnswerId: mcq.correctAnswerId, citationSource: mcq.citation.source }).run(err => err ? reject(err) : resolve(null));
    });
    for (const opt of mcq.options) {
      await new Promise((resolve, reject) => {
        optionsTable.insert({ id: opt.id, mcqId: id, text: opt.text }).run(err => err ? reject(err) : resolve(null));
      });
    }
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
    await new Promise((resolve, reject) => {
      mcqsTable.update({ stem: mcq.stem, correctAnswerId: mcq.correctAnswerId, citationSource: mcq.citation.source }, id).run(err => err ? reject(err) : resolve(null));
    });
    await new Promise((resolve, reject) => {
      optionsTable.remove({ mcqId: id }).run(err => err ? reject(err) : resolve(null));
    });
    for (const opt of mcq.options) {
      await new Promise((resolve, reject) => {
        optionsTable.insert({ id: opt.id, mcqId: id, text: opt.text }).run(err => err ? reject(err) : resolve(null));
      });
    }
    const data = await getAllMcqs();
    res.json(data.find(m => m.id === id));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/mcqs/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await new Promise((resolve, reject) => {
      optionsTable.remove({ mcqId: id }).run(err => err ? reject(err) : resolve(null));
    });
    await new Promise((resolve, reject) => {
      mcqsTable.remove(id).run(err => err ? reject(err) : resolve(null));
    });
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
