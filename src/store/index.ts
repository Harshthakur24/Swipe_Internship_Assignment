"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Safe storage for SSR/Edge environments to avoid "redux-persist failed to create sync storage" warning
const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_: string, value: string) => value,
  removeItem: async () => undefined,
});

const storage = typeof window !== 'undefined'
  ? createWebStorage('local')
  : (createNoopStorage() as unknown as Storage);

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  seconds: number;
}

export interface Answer {
  questionId: string;
  content: string;
  submittedAt: number;
  autoSubmitted: boolean;
  score?: number;
  feedback?: string;
}

export interface InterviewSummary {
  totalScore: number;
  perQuestion: Array<Pick<Answer, "questionId" | "score" | "feedback">>;
  notes: string;
}

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  status: "not_started" | "in_progress" | "completed";
  interviewSummary?: InterviewSummary;
  answers?: Answer[];
};

export type InterviewStatus = "not_started" | "collecting_info" | "in_progress" | "completed";

export interface InterviewState {
  candidate?: Candidate;
  questions: Question[];
  answers: Answer[];
  currentIndex: number;
  status: InterviewStatus;
  lastTickAt?: number;
  startedAt?: number;
  completedAt?: number;
  summary?: InterviewSummary;
  timeRemaining?: number;
  paused?: boolean;
}

type CandidatesState = {
  items: Candidate[];
};

type InterviewStateType = {
  current: InterviewState;
};

const initialCandidatesState: CandidatesState = { items: [] };
const initialInterviewState: InterviewStateType = {
  current: {
    questions: [],
    answers: [],
    currentIndex: 0,
    status: "not_started",
    paused: false,
  }
};

type CandidatesAction =
  | { type: "candidates/add"; payload: Candidate }
  | { type: "candidates/update"; payload: { id: string; updates: Partial<Candidate> } }
  | { type: "candidates/set"; payload: Candidate[] };

type InterviewAction =
  | { type: "interview/start"; payload: { candidate: Candidate; questions: Question[] } }
  | { type: "interview/start_candidate"; payload: { candidate: Candidate } }
  | { type: "interview/submit_answer"; payload: { questionId: string; content: string; autoSubmitted: boolean } }
  | { type: "interview/complete"; payload: { summary: InterviewSummary } }
  | { type: "interview/reset" }
  | { type: "interview/update_status"; payload: InterviewStatus }
  | { type: "interview/timer_tick"; payload: number }
  | { type: "interview/collect_info"; payload: Partial<Candidate> }
  | { type: "interview/pause" }
  | { type: "interview/resume" };

function candidatesReducer(
  state: CandidatesState = initialCandidatesState,
  action: CandidatesAction
) {
  switch (action.type) {
    case "candidates/add":
      return { items: [action.payload, ...state.items] };
    case "candidates/update":
      return {
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };
    case "candidates/set":
      return { items: action.payload };
    default:
      return state;
  }
}

function interviewReducer(
  state: InterviewStateType = initialInterviewState,
  action: InterviewAction
) {
  switch (action.type) {
    case "interview/start":
      return {
        current: {
          ...state.current,
          candidate: action.payload.candidate,
          questions: action.payload.questions,
          answers: [],
          currentIndex: 0,
          status: "in_progress",
          startedAt: Date.now(),
        }
      };
    case "interview/start_candidate":
      return {
        current: {
          ...state.current,
          candidate: action.payload.candidate,
          status: "collecting_info",
        }
      };
    case "interview/submit_answer":
      const newAnswers = [...state.current.answers];
      const existingIndex = newAnswers.findIndex(a => a.questionId === action.payload.questionId);
      const answer: Answer = {
        questionId: action.payload.questionId,
        content: action.payload.content,
        submittedAt: Date.now(),
        autoSubmitted: action.payload.autoSubmitted,
      };
      
      if (existingIndex >= 0) {
        newAnswers[existingIndex] = answer;
      } else {
        newAnswers.push(answer);
      }

      return {
        current: {
          ...state.current,
          answers: newAnswers,
          currentIndex: state.current.currentIndex + 1,
          timeRemaining: undefined,
        }
      };
    case "interview/complete":
      return {
        current: {
          ...state.current,
          status: "completed",
          completedAt: Date.now(),
          summary: action.payload.summary,
        }
      };
    case "interview/reset":
      return initialInterviewState;
    case "interview/pause":
      return {
        current: {
          ...state.current,
          paused: true,
          lastTickAt: Date.now(),
        }
      };
    case "interview/resume":
      return {
        current: {
          ...state.current,
          paused: false,
        }
      };
    case "interview/update_status":
      return {
        current: {
          ...state.current,
          status: action.payload,
        }
      };
    case "interview/timer_tick":
      return {
        current: {
          ...state.current,
          timeRemaining: action.payload,
        }
      };
    case "interview/collect_info":
      return {
        current: {
          ...state.current,
          candidate: state.current.candidate ? { ...state.current.candidate, ...action.payload } : undefined,
          status: "collecting_info",
        }
      };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  candidates: candidatesReducer,
  interview: interviewReducer,
});

const persistConfig = {
  key: "root",
  storage: storage,
  version: 1,
  throttle: 500,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedReducer = persistReducer(persistConfig, rootReducer as any) as any;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Selectors
export const selectCandidates = (state: RootState) => state.candidates?.items || [];
export const selectCurrentInterview = (state: RootState) => state.interview?.current || {
  questions: [],
  answers: [],
  currentIndex: 0,
  status: "not_started" as InterviewStatus,
};


