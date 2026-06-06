export interface Problem {
  id: string; title: string; difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  testCases: { input: string; expectedOutput: string; hidden: boolean }[];
  tags: string[]; timeLimit: number; memoryLimit: number;
}

export interface Submission {
  id: string; problemId: string; language: string; code: string;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error';
  runtime?: number; memory?: number;
  testResults: { passed: boolean; input: string; expected: string; actual?: string }[];
  submittedAt: string;
}

export interface InterviewRoom {
  id: string; problemId: string; interviewerId: string; candidateId: string;
  status: 'waiting' | 'active' | 'completed'; startedAt?: string;
  code: string; language: string; chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string; senderId: string; senderName: string;
  content: string; timestamp: string;
}

export interface ScoreCard {
  problemSolving: number; codeQuality: number;
  communication: number; overall: number; notes: string;
}
