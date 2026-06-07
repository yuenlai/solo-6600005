import { create } from 'zustand';
import { Problem, Submission, InterviewRoom, User, CandidateInvitation, ParticipantStatus } from '../types';

interface InterviewState {
  problems: Problem[];
  currentProblem: Problem | null;
  submissions: Submission[];
  deprecatedRoom: InterviewRoom | null;
  room: InterviewRoom | null;
  code: string;
  language: string;
  currentUser: User | null;
  myRooms: InterviewRoom[];
  currentRoom: InterviewRoom | null;
  invitations: CandidateInvitation[];
  participants: ParticipantStatus[];
  isConnected: boolean;
  setProblem: (p: Problem) => void;
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  addSubmission: (s: Submission) => void;
  setRoom: (room: InterviewRoom) => void;
  setCurrentUser: (user: User) => void;
  setMyRooms: (rooms: InterviewRoom[]) => void;
  setCurrentRoom: (room: InterviewRoom | null) => void;
  setInvitations: (invitations: CandidateInvitation[]) => void;
  setParticipants: (participants: ParticipantStatus[]) => void;
  addInvitation: (invitation: CandidateInvitation) => void;
  updateInvitationStatus: (invitationId: string, status: string) => void;
  updateParticipant: (participant: ParticipantStatus) => void;
  setIsConnected: (connected: boolean) => void;
  resetRoom: () => void;
  setProblems: (problems: Problem[]) => void;
  addProblem: (problem: Problem) => void;
  updateProblem: (problem: Problem) => void;
  removeProblem: (problemId: string) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  problems: [], currentProblem: null, submissions: [], deprecatedRoom: null, room: null,
  code: '// Start coding here', language: 'javascript',
  currentUser: null, myRooms: [], currentRoom: null, invitations: [], participants: [], isConnected: false,
  setProblem: (p) => set({ currentProblem: p }),
  setCode: (code) => set({ code }),
  setLanguage: (lang) => set({ language: lang }),
  addSubmission: (s) => set({ submissions: [s, ...useInterviewStore.getState().submissions] }),
  setRoom: (room) => set({ deprecatedRoom: room, room, currentRoom: room }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setMyRooms: (rooms) => set({ myRooms: rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room, deprecatedRoom: room, room }),
  setInvitations: (invitations) => set({ invitations }),
  setParticipants: (participants) => set({ participants }),
  addInvitation: (invitation) => set((state) => ({ invitations: [...state.invitations, invitation] })),
  updateInvitationStatus: (invitationId, status) => set((state) => ({
    invitations: state.invitations.map((inv) =>
      inv.id === invitationId ? { ...inv, status: status as CandidateInvitation['status'] } : inv
    ),
  })),
  updateParticipant: (participant) => set((state) => {
    const exists = state.participants.some((p) => p.userId === participant.userId);
    if (exists) {
      return {
        participants: state.participants.map((p) =>
          p.userId === participant.userId ? participant : p
        ),
      };
    }
    return { participants: [...state.participants, participant] };
  }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  resetRoom: () => set({
    currentRoom: null, deprecatedRoom: null, room: null,
    invitations: [], participants: [], isConnected: false,
  }),
  setProblems: (problems) => set({ problems }),
  addProblem: (problem) => set((state) => ({ problems: [problem, ...state.problems] })),
  updateProblem: (problem) => set((state) => ({
    problems: state.problems.map((p) => p.id === problem.id ? problem : p),
  })),
  removeProblem: (problemId) => set((state) => ({
    problems: state.problems.filter((p) => p.id !== problemId),
  })),
}));
