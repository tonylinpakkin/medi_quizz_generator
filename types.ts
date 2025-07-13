
export interface MCQOption {
  id: string;
  text: string;
}

export interface Citation {
  source: string;
}

export interface MCQ {
  id: string;
  stem: string;
  options: MCQOption[];
  correctAnswerId: string;
  citation: Citation;
}

export enum APIState {
    Idle,
    Loading,
    Success,
    Error,
}
