import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, getRoomParticipants, heartbeat } from '../services/interviewRoomService';
import { connect, disconnect, subscribeParticipants, subscribeRoomStatus, sendHeartbeat } from '../services/websocketService';
import { useInterviewStore } from '../store/interview';
import { ProblemPanel } from './ProblemPanel';
import { CodeEditor } from './CodeEditor';
import { ParticipantStatus } from '../types';
import { getProblemById } from '../services/problemService';

const CandidateRoomView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    currentRoom,
    currentUser,
    currentProblem,
    participants,
    setCurrentRoom,
    setParticipants,
    updateParticipant,
    resetRoom,
    setProblem,
  } = useInterviewStore();
  const [loading, setLoading] = useState(true);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING': return '#ff9800';
      case 'ACTIVE': return '#4caf50';
      case 'COMPLETED': return '#2196f3';
      case 'CANCELLED': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING': return '等待面试官开始面试...';
      case 'ACTIVE': return '面试进行中...';
      case 'COMPLETED': return '面试已结束';
      case 'CANCELLED': return '面试已取消';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleBack = () => {
    resetRoom();
    navigate('/');
  };

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
          } catch (error) {
            console.error('WebSocket connection failed:', error);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
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
        if (currentUser && roomId) {
          sendHeartbeat(roomId, currentUser);
        }
      }
    }, 30000);

    let unsubscribeParticipants: (() => void) | null = null;
    let unsubscribeRoomStatus: (() => void) | null = null;

    const setupSubscriptions = () => {
      if (roomId) {
        unsubscribeParticipants = subscribeParticipants(roomId, (data) => {
          if (mounted) {
            setParticipants(data);
          }
        });

        unsubscribeRoomStatus = subscribeRoomStatus(roomId, (data) => {
          if (mounted) {
            setCurrentRoom(data);
          }
        });
      }
    };

    setTimeout(setupSubscriptions, 1000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      clearInterval(heartbeatInterval);
      if (unsubscribeParticipants) {
        unsubscribeParticipants();
      }
      if (unsubscribeRoomStatus) {
        unsubscribeRoomStatus();
      }
      disconnect();
    };
  }, [roomId, currentUser, currentRoom, fetchRoomDetails, fetchParticipants, sendHttpHeartbeat, setCurrentRoom, setParticipants]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ color: '#fff', fontSize: '16px' }}>加载中...</div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          background: '#1e1e1e',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          border: '1px solid #333',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#fff', margin: '0 0 8px 0' }}>房间不存在</h2>
          <p style={{ color: '#888', margin: '0 0 24px 0' }}>请检查链接是否正确</p>
          <button
            onClick={handleBack}
            style={{
              padding: '10px 24px',
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          background: '#1e1e1e',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          border: '1px solid #333',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ color: '#fff', margin: '0 0 8px 0' }}>题目加载中...</h2>
          <p style={{ color: '#888', margin: '0 0 24px 0' }}>请稍候</p>
          <button
            onClick={handleBack}
            style={{
              padding: '10px 24px',
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(currentRoom.status);

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
          title="返回"
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
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: statusColor + '15',
          borderBottom: `1px solid ${statusColor}40`,
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: statusColor,
              animation: 'pulse 2s infinite',
            }} />
            <span style={{
              color: statusColor,
              fontSize: '14px',
              fontWeight: 500,
            }}>
              {getStatusText(currentRoom.status)}
            </span>
          </div>
        </div>

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
              background: statusColor + '20',
              color: statusColor,
            }}>
              {currentRoom.status}
            </span>
          </div>
          <div style={{ color: '#888', fontSize: '13px' }}>
            房间码: <span style={{ color: '#4caf50', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>{currentRoom.roomCode}</span>
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
            {participants.map((participant: ParticipantStatus) => {
              const isSelf = currentUser && participant.userId === currentUser.id;
              const isInterviewer = participant.userRole === 'INTERVIEWER';

              return (
                <div
                  key={participant.id}
                  style={{
                    padding: '12px',
                    backgroundColor: isSelf ? '#2a3f4f' : '#2a2a2a',
                    borderRadius: '6px',
                    border: isSelf ? '1px solid #2196f3' : '1px solid transparent',
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
                      backgroundColor: isInterviewer ? '#9c27b0' : '#2196f3',
                      color: '#fff',
                    }}>
                      {isInterviewer ? '面试官' : '候选人'}
                    </span>
                    <span style={{
                      fontWeight: 500,
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {participant.userName}
                      {isSelf && <span style={{ color: '#2196f3', marginLeft: '4px' }}>(我)</span>}
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CandidateRoomView;
