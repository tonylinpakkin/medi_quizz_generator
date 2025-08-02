
export interface MCQOption {
  id: string;
  text: string;
}

export interface Citation {
  source: string;
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

interface QuestionBase {
  id: string;
  type: QuestionType;
  stem: string;
  /** Explanation for why the correct answer is best */
  rationale: string;
  citation: Citation;
  type?: QuestionType;
}

export interface MCQQuestion extends QuestionBase {
  type: QuestionType.MCQ;
  options: MCQOption[];
  correctAnswerId: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: QuestionType.TRUE_FALSE;
  answer: boolean;
}

export interface ShortAnswerQuestion extends QuestionBase {
  type: QuestionType.SHORT_ANSWER;
  answer: string;
}

export type Question = MCQQuestion | TrueFalseQuestion | ShortAnswerQuestion;

export enum APIState {
    Idle,
    Loading,
    Success,
    Error,
}

// Backwards compatibility for existing MCQ usages
export type MCQ = MCQQuestion;
