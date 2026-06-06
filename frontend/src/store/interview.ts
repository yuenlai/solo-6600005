import { create } from 'zustand';
import { Problem, Submission, InterviewRoom } from '../types';

interface InterviewState {
  problems: Problem[];
  currentProblem: Problem | null;
  submissions: Submission[];
  room: InterviewRoom | null;
  code: string;
  language: string;
  setProblem: (p: Problem) => void;
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  addSubmission: (s: Submission) => void;
  setRoom: (room: InterviewRoom) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  problems: [], currentProblem: null, submissions: [], room: null,
  code: '// Start coding here', language: 'javascript',
  setProblem: (p) => set({ currentProblem: p }),
  setCode: (code) => set({ code }),
  setLanguage: (lang) => set({ language: lang }),
  addSubmission: (s) => set({ submissions: [s, ...useInterviewStore.getState().submissions] }),
  setRoom: (room) => set({ room }),
}));
