import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import type { User, InterviewRoom, ParticipantStatus } from '../types';

let stompClient: Client | null = null;

export function connect(_roomId: string, _user: User): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new SockJS('http://localhost:8080/ws/interview');
    stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      resolve();
    };

    stompClient.onStompError = (frame) => {
      reject(new Error(frame.headers['message'] || 'WebSocket connection error'));
    };

    stompClient.activate();
  });
}

export function disconnect(): void {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function subscribeParticipants(
  roomId: string,
  callback: (participants: ParticipantStatus[]) => void
): () => void {
  if (!stompClient) {
    return () => {};
  }

  const subscription = stompClient.subscribe(
    `/topic/room/${roomId}/participants`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const participants = data.payload || data;
        callback(participants as ParticipantStatus[]);
      } catch (e) {
        console.error('Failed to parse participants message:', e);
      }
    }
  );

  return () => subscription.unsubscribe();
}

export function subscribeRoomStatus(
  roomId: string,
  callback: (room: InterviewRoom) => void
): () => void {
  if (!stompClient) {
    return () => {};
  }

  const subscription = stompClient.subscribe(
    `/topic/room/${roomId}/status`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const room = data.payload || data;
        callback(room as InterviewRoom);
      } catch (e) {
        console.error('Failed to parse room status message:', e);
      }
    }
  );

  return () => subscription.unsubscribe();
}

export function sendHeartbeat(roomId: string, user: User): void {
  if (!stompClient || !stompClient.connected) {
    return;
  }

  stompClient.publish({
    destination: `/app/heartbeat`,
    body: JSON.stringify({
      type: 'HEARTBEAT',
      payload: {
        roomId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
      },
    }),
  });
}
