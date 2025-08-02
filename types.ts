
export interface MCQOption {
  id: string;
  text: string;
}

export interface Citation {
  source: string;
}

export enum QuestionType {
  MCQ = 'MCQ',
  TrueFalse = 'TrueFalse',
  ShortAnswer = 'ShortAnswer',
}

export interface MCQ {
  id: string;
  stem: string;
  options: MCQOption[];
  correctAnswerId: string;
  /** Explanation for why the correct answer is best */
  rationale: string;
  citation: Citation;
  type?: QuestionType;
}

export enum APIState {
    Idle,
    Loading,
    Success,
    Error,
}
