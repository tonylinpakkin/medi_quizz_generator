
export interface QuestionOption {
  id: string;
  text: string;
}

export interface Citation {
  source: string;
  /** Contextual snippet from the source material */
  context?: string;
}

export enum QuestionType {
  MultipleChoice = 'MultipleChoice',
  TrueFalse = 'TrueFalse',
  ShortAnswer = 'ShortAnswer',
}

export interface Question {
  id: string;
  stem: string;
  options?: QuestionOption[];
  /** For MultipleChoice/TrueFalse questions, this is the id of the correct option */
  correctAnswerId?: string;
  /** For ShortAnswer (string) or TrueFalse (boolean) responses */
  answer?: string | boolean;
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
