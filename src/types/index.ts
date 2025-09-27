export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  seconds: number; // time limit per question
}

export interface Answer {
  questionId: string;
  content: string;
  submittedAt: number; // epoch ms
  autoSubmitted: boolean;
  score?: number; // 0-10
  feedback?: string;
}

export interface InterviewSummary {
  totalScore: number; // 0-60
  perQuestion: Array<Pick<Answer, "questionId" | "score" | "feedback">>;
  notes: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeText?: string;
}

export type InterviewStatus = "not_started" | "in_progress" | "completed";

export interface InterviewState {
  candidate?: Candidate;
  questions: Question[];
  answers: Answer[];
  currentIndex: number; // 0..5
  status: InterviewStatus;
  lastTickAt?: number; // for timer resume
  startedAt?: number;
  completedAt?: number;
  summary?: InterviewSummary;
}


