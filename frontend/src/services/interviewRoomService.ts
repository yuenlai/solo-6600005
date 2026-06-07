import { request } from './api';
import type { CreateRoomRequest, InterviewRoom, ParticipantStatus, JoinRoomResponse, CreateRoomResponse } from '../types';

export function createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
  return request<CreateRoomResponse>('/interview-rooms', {
    method: 'POST',
    body: data,
  });
}

export function getRoomById(roomId: string): Promise<InterviewRoom> {
  return request<InterviewRoom>(`/interview-rooms/${roomId}`);
}

export function getRoomByCode(roomCode: string): Promise<InterviewRoom> {
  return request<InterviewRoom>(`/interview-rooms/code/${roomCode}`);
}

export function getRoomsByInterviewer(interviewerId: string): Promise<InterviewRoom[]> {
  return request<InterviewRoom[]>(`/interview-rooms/interviewer/${interviewerId}`);
}

export function updateRoomStatus(roomId: string, status: string): Promise<InterviewRoom> {
  return request<InterviewRoom>(`/interview-rooms/${roomId}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function getRoomParticipants(roomId: string): Promise<ParticipantStatus[]> {
  return request<ParticipantStatus[]>(`/interview-rooms/${roomId}/participants`);
}

export function joinRoom(roomId: string, data: { candidateName: string; inviteToken: string }): Promise<JoinRoomResponse> {
  return request<JoinRoomResponse>(`/interview-rooms/${roomId}/join`, {
    method: 'POST',
    body: data,
  });
}

export function leaveRoom(roomId: string, userId: string): Promise<void> {
  return request<void>(`/interview-rooms/${roomId}/leave`, {
    method: 'POST',
    body: { userId },
  });
}

export function heartbeat(roomId: string, userId: string): Promise<ParticipantStatus> {
  return request<ParticipantStatus>(`/interview-rooms/${roomId}/heartbeat`, {
    method: 'POST',
    body: { userId },
  });
}
