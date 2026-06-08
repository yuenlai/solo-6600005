export interface Problem {
  id: string; title: string; difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  testCases: { input: string; expectedOutput: string; hidden: boolean }[];
  tags: string[]; timeLimit: number; memoryLimit: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CreateProblemRequest {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  testCases: { input: string; expectedOutput: string; hidden: boolean }[];
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
}

export interface UpdateProblemRequest extends Partial<CreateProblemRequest> {
  id: string;
}

export interface DifficultyTag {
  value: 'easy' | 'medium' | 'hard';
  label: string;
  color: string;
  bgColor: string;
}

export const DIFFICULTY_TAGS: DifficultyTag[] = [
  { value: 'easy', label: '简单', color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.15)' },
  { value: 'medium', label: '中等', color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.15)' },
  { value: 'hard', label: '困难', color: '#f44336', bgColor: 'rgba(244, 67, 54, 0.15)' },
];

export const getDifficultyTag = (difficulty: string): DifficultyTag => {
  return DIFFICULTY_TAGS.find(t => t.value === difficulty) || DIFFICULTY_TAGS[0];
};

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

export interface LanguageConfig {
  value: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  { value: 'javascript', label: 'JavaScript', icon: 'JS', color: '#f7df1e', bgColor: 'rgba(247, 223, 30, 0.15)', borderColor: '#f7df1e' },
  { value: 'typescript', label: 'TypeScript', icon: 'TS', color: '#3178c6', bgColor: 'rgba(49, 120, 198, 0.15)', borderColor: '#3178c6' },
  { value: 'python', label: 'Python', icon: 'PY', color: '#3776ab', bgColor: 'rgba(55, 118, 171, 0.15)', borderColor: '#3776ab' },
  { value: 'java', label: 'Java', icon: 'JV', color: '#007396', bgColor: 'rgba(0, 115, 150, 0.15)', borderColor: '#007396' },
  { value: 'go', label: 'Go', icon: 'GO', color: '#00add8', bgColor: 'rgba(0, 173, 216, 0.15)', borderColor: '#00add8' },
];

export const getLanguageConfig = (value: string): LanguageConfig => {
  return LANGUAGE_CONFIGS.find(l => l.value === value) || LANGUAGE_CONFIGS[0];
};

export interface JoinRoomResponse {
  participant: ParticipantStatus;
  room: InterviewRoom;
  message?: string;
}
