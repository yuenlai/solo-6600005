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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'INTERVIEWER' | 'CANDIDATE';
  createdAt: string;
}

export interface CandidateInvitation {
  id: string;
  roomId: string;
  candidateName: string;
  candidateEmail: string;
  inviteToken: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'JOINED' | 'LEFT';
  joinedAt?: string;
  createdAt: string;
}

export interface ParticipantStatus {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userRole: 'INTERVIEWER' | 'CANDIDATE';
  isOnline: boolean;
  lastHeartbeat: string;
  joinedAt: string;
}

export interface InterviewRoom {
  id: string;
  roomCode: string;
  title: string;
  problemId: string;
  interviewerId: string;
  candidateId: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  endedAt?: string;
  startedAt?: string;
  code: string;
  language: string;
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string; senderId: string; senderName: string;
  content: string; timestamp: string;
}

export interface ScoreCard {
  problemSolving: number; codeQuality: number;
  communication: number; overall: number; notes: string;
}

export interface CreateRoomRequest {
  title: string;
  problemId: string;
  interviewerId: string;
  interviewerName: string;
}

export interface InviteCandidateRequest {
  roomId: string;
  candidateName: string;
  candidateEmail: string;
}

export interface CreateRoomResponse {
  room: InterviewRoom;
  participant: ParticipantStatus;
}

export interface JoinRoomResponse {
  participant: ParticipantStatus;
  room: InterviewRoom;
  message?: string;
}
