import React, { useEffect, useState, useCallback } from 'react';
import { getRoomParticipants, updateRoomStatus, getRoomById, heartbeat } from '../services/interviewRoomService';
import { subscribeParticipants, sendHeartbeat, connect, disconnect } from '../services/websocketService';
import { useInterviewStore } from '../store/interview';

interface ParticipantListProps {
  roomId: string;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ roomId }) => {
  const { currentUser, participants, setParticipants, currentRoom, setCurrentRoom } = useInterviewStore();
  const [copied, setCopied] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      const data = await getRoomParticipants(roomId);
      setParticipants(data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  }, [roomId, setParticipants]);

  const fetchRoomDetails = useCallback(async () => {
    try {
      const data = await getRoomById(roomId);
      setCurrentRoom(data);
    } catch (error) {
      console.error('Failed to fetch room details:', error);
    }
  }, [roomId, setCurrentRoom]);

  const sendHttpHeartbeat = useCallback(async () => {
    if (!currentUser) return;
    try {
      await heartbeat(roomId, currentUser.id);
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, [roomId, currentUser]);

  const handleStartInterview = async () => {
    try {
      const updatedRoom = await updateRoomStatus(roomId, 'ACTIVE');
      setCurrentRoom(updatedRoom);
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };

  const handleEndInterview = async () => {
    try {
      const updatedRoom = await updateRoomStatus(roomId, 'COMPLETED');
      setCurrentRoom(updatedRoom);
    } catch (error) {
      console.error('Failed to end interview:', error);
    }
  };

  const handleCopyRoomCode = async () => {
    if (!currentRoom?.roomCode) return;
    try {
      await navigator.clipboard.writeText(currentRoom.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room code:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isInterviewer = currentUser?.role === 'INTERVIEWER';

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await Promise.all([fetchParticipants(), fetchRoomDetails()]);
      
      if (currentUser) {
        try {
          await connect(roomId, currentUser);
        } catch (error) {
          console.error('WebSocket connection failed:', error);
        }
      }
    };

    init();

    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchParticipants();
        fetchRoomDetails();
      }
    }, 2000);

    const heartbeatInterval = setInterval(() => {
      if (mounted) {
        sendHttpHeartbeat();
        if (currentUser) {
          sendHeartbeat(roomId, currentUser);
        }
      }
    }, 30000);

    let unsubscribe: (() => void) | null = null;
    const setupSubscription = () => {
      unsubscribe = subscribeParticipants(roomId, (data) => {
        if (mounted) {
          setParticipants(data);
        }
      });
    };
    setTimeout(setupSubscription, 1000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      clearInterval(heartbeatInterval);
      if (unsubscribe) {
        unsubscribe();
      }
      disconnect();
    };
  }, [roomId, currentUser, fetchParticipants, fetchRoomDetails, sendHttpHeartbeat, setParticipants]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING': return '#ff9800';
      case 'ACTIVE': return '#4caf50';
      case 'COMPLETED': return '#2196f3';
      case 'CANCELLED': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      borderRadius: '8px',
      padding: '16px',
      color: '#e0e0e0',
      minWidth: '280px',
    }}>
      {currentRoom && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              {currentRoom.title}
            </h3>
            <span style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: getStatusColor(currentRoom.status) + '20',
              color: getStatusColor(currentRoom.status),
            }}>
              {currentRoom.status}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: '#2a2a2a',
            borderRadius: '6px',
          }}>
            <span style={{ fontSize: '13px', color: '#999' }}>房间码:</span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '2px',
              flex: 1,
            }}>
              {currentRoom.roomCode}
            </span>
            <button
              onClick={handleCopyRoomCode}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: copied ? '#4caf50' : '#3a3a3a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>

          {isInterviewer && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {currentRoom.status === 'WAITING' && (
                <button
                  onClick={handleStartInterview}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  开始面试
                </button>
              )}
              {currentRoom.status === 'ACTIVE' && (
                <button
                  onClick={handleEndInterview}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  结束面试
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: 500,
          color: '#999',
        }}>
          参与者 ({participants.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {participants.map((participant) => {
            const isCandidate = participant.userRole === 'CANDIDATE';
            const isHighlighted = isInterviewer && isCandidate;

            return (
              <div
                key={participant.id}
                style={{
                  padding: '12px',
                  backgroundColor: isHighlighted ? '#2a3f4f' : '#2a2a2a',
                  borderRadius: '6px',
                  border: isHighlighted ? '1px solid #2196f3' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: participant.isOnline ? '#4caf50' : '#666',
                    boxShadow: participant.isOnline ? '0 0 8px #4caf50' : 'none',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    backgroundColor: participant.userRole === 'INTERVIEWER' ? '#9c27b0' : '#2196f3',
                    color: '#fff',
                  }}>
                    {participant.userRole === 'INTERVIEWER' ? '面试官' : '候选人'}
                  </span>
                  <span style={{
                    fontWeight: 500,
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {participant.userName}
                  </span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}>
                  <span>加入时间: {formatTime(participant.joinedAt)}</span>
                  <span>最后活跃: {formatTime(participant.lastHeartbeat)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ParticipantList;
