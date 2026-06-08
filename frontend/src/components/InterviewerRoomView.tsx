import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CodeEditor } from './CodeEditor';
import { ProblemPanel } from './ProblemPanel';
import { CreateRoomModal } from './CreateRoomModal';
import { InvitePanel } from './InvitePanel';
import ParticipantList from './ParticipantList';
import { useInterviewStore } from '../store/interview';
import { ParticipantStatus } from '../types';
import { getRoomById, updateRoomStatus, getRoomParticipants, heartbeat } from '../services/interviewRoomService';
import { connect, disconnect, subscribeParticipants, subscribeRoomStatus, sendHeartbeat } from '../services/websocketService';
import { getProblemById } from '../services/problemService';

export const InterviewerRoomView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    currentRoom,
    currentUser,
    currentProblem,
    setCurrentRoom,
    setParticipants,
    updateParticipant,
    setIsConnected,
    resetRoom,
    setProblem,
  } = useInterviewStore();
  const [showInvitePanel, setShowInvitePanel] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const httpHeartbeatRef = useRef<number | null>(null);
  const wsHeartbeatRef = useRef<number | null>(null);
  const unsubscribeParticipantsRef = useRef<(() => void) | null>(null);
  const unsubscribeRoomStatusRef = useRef<(() => void) | null>(null);

  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getRoomById(roomId);
      setCurrentRoom(data);
      if (data.problemId) {
        const problem = await getProblemById(data.problemId);
        setProblem(problem);
      }
    } catch (error) {
      console.error('Failed to fetch room details:', error);
    }
  }, [roomId, setCurrentRoom, setProblem]);

  const fetchParticipants = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await getRoomParticipants(roomId);
      setParticipants(data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  }, [roomId, setParticipants]);

  const sendHttpHeartbeat = useCallback(async () => {
    if (!roomId || !currentUser) return;
    try {
      const participant = await heartbeat(roomId, currentUser.id);
      updateParticipant(participant);
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, [roomId, currentUser, updateParticipant]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        if (!currentRoom && roomId) {
          await fetchRoomDetails();
        }
        await fetchParticipants();

        if (currentUser && roomId) {
          try {
            await connect(roomId, currentUser);
            setIsConnected(true);

            unsubscribeParticipantsRef.current = subscribeParticipants(roomId, (data) => {
              if (mounted) {
                setParticipants(data as ParticipantStatus[]);
              }
            });

            unsubscribeRoomStatusRef.current = subscribeRoomStatus(roomId, (room) => {
              if (mounted) {
                setCurrentRoom(room);
              }
            });

            httpHeartbeatRef.current = window.setInterval(sendHttpHeartbeat, 30000);
            wsHeartbeatRef.current = window.setInterval(() => {
              if (currentUser) sendHeartbeat(roomId, currentUser);
            }, 30000);
          } catch (error) {
            console.error('Failed to connect WebSocket:', error);
          }
        }
      } catch (error) {
        console.error('Failed to initialize room:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (httpHeartbeatRef.current) clearInterval(httpHeartbeatRef.current);
      if (wsHeartbeatRef.current) clearInterval(wsHeartbeatRef.current);
      if (unsubscribeParticipantsRef.current) unsubscribeParticipantsRef.current();
      if (unsubscribeRoomStatusRef.current) unsubscribeRoomStatusRef.current();
      disconnect();
      setIsConnected(false);
    };
  }, [roomId, currentUser, currentRoom, fetchRoomDetails, fetchParticipants, sendHttpHeartbeat, setIsConnected, setCurrentRoom, setParticipants]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'WAITING': return '#ff9800';
      case 'ACTIVE': return '#4caf50';
      case 'COMPLETED': return '#2196f3';
      case 'CANCELLED': return '#f44336';
      default: return '#666';
    }
  };

  const handleStartInterview = async () => {
    if (!currentRoom) return;
    try {
      const updatedRoom = await updateRoomStatus(currentRoom.id, 'ACTIVE');
      setCurrentRoom(updatedRoom);
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };

  const handleEndInterview = async () => {
    if (!currentRoom) return;
    try {
      const updatedRoom = await updateRoomStatus(currentRoom.id, 'COMPLETED');
      setCurrentRoom(updatedRoom);
    } catch (error) {
      console.error('Failed to end interview:', error);
    }
  };

  const handleBack = () => {
    resetRoom();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0d0d0d',
      }}>
        <div style={{ color: '#fff', fontSize: '16px' }}>加载中...</div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0d0d0d',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ color: '#f44336', fontSize: '16px' }}>房间不存在</div>
        <button
          onClick={handleBack}
          style={{
            padding: '10px 24px',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
          返回首页
        </button>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0d0d0d',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ color: '#ff9800', fontSize: '16px' }}>题目加载失败，请稍后重试</div>
        <button
          onClick={handleBack}
          style={{
            padding: '10px 24px',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}>
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#0d0d0d' }}>
      <div style={{
        width: '56px',
        background: '#1a1a1a',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
        gap: '16px',
      }}>
        <button
          onClick={handleBack}
          title="返回房间列表"
          style={{
            width: '40px', height: '40px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '20px',
            borderRadius: '8px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          ←
        </button>
        <button
          onClick={() => setShowInvitePanel(!showInvitePanel)}
          title={showInvitePanel ? '隐藏邀请面板' : '显示邀请面板'}
          style={{
            width: '40px', height: '40px',
            background: showInvitePanel ? '#2196f3' : 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '18px',
            borderRadius: '8px',
          }}
          onMouseEnter={(e) => !showInvitePanel && (e.currentTarget.style.background = '#333')}
          onMouseLeave={(e) => !showInvitePanel && (e.currentTarget.style.background = 'transparent')}>
          👥
        </button>
      </div>

      {showInvitePanel && (
        <InvitePanel roomId={currentRoom.id} roomCode={currentRoom.roomCode} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: '#1e1e1e',
          borderBottom: '1px solid #333',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>{currentRoom.title}</h2>
            <span style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 500,
              background: getStatusBadgeColor(currentRoom.status) + '20',
              color: getStatusBadgeColor(currentRoom.status),
            }}>
              {currentRoom.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ color: '#888', fontSize: '13px' }}>
              房间码: <span style={{ color: '#4caf50', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>{currentRoom.roomCode}</span>
            </div>
            {currentRoom.status === 'WAITING' && (
              <button
                onClick={handleStartInterview}
                style={{
                  padding: '8px 20px',
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}>
                开始面试
              </button>
            )}
            {currentRoom.status === 'ACTIVE' && (
              <button
                onClick={handleEndInterview}
                style={{
                  padding: '8px 20px',
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}>
                结束面试
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ProblemPanel problem={currentProblem} />
          <CodeEditor />
        </div>
      </div>

      <div style={{
        width: '320px',
        background: '#1a1a1a',
        borderLeft: '1px solid #333',
        padding: '16px',
        overflowY: 'auto',
      }}>
        <ParticipantList roomId={currentRoom.id} />
      </div>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
