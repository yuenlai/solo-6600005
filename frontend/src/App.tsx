import React, { useState, useEffect } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { ProblemPanel } from './components/ProblemPanel';
import { CreateRoomModal } from './components/CreateRoomModal';
import { InvitePanel } from './components/InvitePanel';
import ParticipantList from './components/ParticipantList';
import { Problem, InterviewRoom, User } from './types';
import { useInterviewStore } from './store/interview';
import { getRoomsByInterviewer } from './services/interviewRoomService';

const mockProblem: Problem = {
  id: 'p1', title: 'Two Sum', difficulty: 'easy',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }],
  testCases: [
    { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', hidden: false },
    { input: '[3,2,4], 6', expectedOutput: '[1,2]', hidden: false },
  ],
  tags: ['Array', 'HashMap'], timeLimit: 2000, memoryLimit: 256
};

const mockInterviewer: User = {
  id: 'interviewer-001',
  name: '张面试官',
  email: 'interviewer@example.com',
  role: 'INTERVIEWER',
  createdAt: new Date().toISOString(),
};

const App: React.FC = () => {
  const { currentUser, setCurrentUser, myRooms, setMyRooms, currentRoom, setCurrentRoom } = useInterviewStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [problem] = useState<Problem>(mockProblem);
  const [showInvitePanel, setShowInvitePanel] = useState(true);

  useEffect(() => {
    setCurrentUser(mockInterviewer);
  }, [setCurrentUser]);

  useEffect(() => {
    if (currentUser) {
      loadMyRooms();
    }
  }, [currentUser]);

  const loadMyRooms = async () => {
    if (!currentUser) return;
    try {
      const rooms = await getRoomsByInterviewer(currentUser.id);
      setMyRooms(rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const handleCreateRoomSuccess = (room: InterviewRoom) => {
    setCurrentRoom(room);
  };

  const handleEnterRoom = (room: InterviewRoom) => {
    setCurrentRoom(room);
  };

  const handleBackToList = () => {
    setCurrentRoom(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'WAITING': return '#ff9800';
      case 'ACTIVE': return '#4caf50';
      case 'COMPLETED': return '#2196f3';
      case 'CANCELLED': return '#f44336';
      default: return '#666';
    }
  };

  if (!currentRoom) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0d', fontFamily: 'sans-serif' }}>
        <div style={{
          background: '#1e1e1e',
          borderBottom: '1px solid #333',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '16px',
            }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 500 }}>{currentUser?.name}</div>
              <div style={{ color: '#888', fontSize: '12px' }}>{currentUser?.role}</div>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              padding: '10px 24px',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}>
            + 创建面试房间
          </button>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0' }}>我的面试</h1>
          <p style={{ color: '#888', margin: '0 0 32px 0' }}>管理您创建的所有面试房间</p>

          {myRooms.length === 0 ? (
            <div style={{
              background: '#1e1e1e',
              borderRadius: '12px',
              padding: '64px 24px',
              textAlign: 'center',
              border: '1px dashed #333',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>暂无面试房间</h3>
              <p style={{ color: '#888', margin: '0 0 24px 0' }}>点击右上角按钮创建您的第一个面试房间</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  padding: '12px 32px',
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}>
                创建面试房间
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {myRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleEnterRoom(room)}
                  style={{
                    background: '#1e1e1e',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    border: '1px solid #333',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4caf50';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '18px' }}>{room.title}</h3>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: '#888', fontSize: '13px' }}>房间码: <span style={{ color: '#4caf50', fontFamily: 'monospace', fontWeight: 'bold' }}>{room.roomCode}</span></span>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: getStatusBadgeColor(room.status) + '20',
                          color: getStatusBadgeColor(room.status),
                        }}>
                          {room.status}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: '#4caf50', fontSize: '20px' }}>→</span>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    创建于 {new Date(room.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateRoomSuccess}
        />
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
          onClick={handleBackToList}
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
          <div style={{ color: '#888', fontSize: '13px' }}>
            房间码: <span style={{ color: '#4caf50', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}>{currentRoom.roomCode}</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ProblemPanel problem={problem} />
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
        onSuccess={handleCreateRoomSuccess}
      />
    </div>
  );
};
export default App;
