import React, { useState } from 'react';
import { createRoom } from '../services/interviewRoomService';
import type { InterviewRoom, CreateRoomRequest } from '../types';
import { useInterviewStore } from '../store/interview';

const MOCK_PROBLEMS = [
  { id: '1', title: 'Two Sum', difficulty: 'easy' },
  { id: '2', title: 'Valid Parentheses', difficulty: 'easy' },
  { id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium' },
  { id: '4', title: 'Add Two Numbers', difficulty: 'medium' },
];

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (room: InterviewRoom) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, setMyRooms, myRooms } = useInterviewStore();
  const [title, setTitle] = useState('');
  const [problemId, setProblemId] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !problemId || !interviewerName) {
      setError('请填写所有必填字段');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const requestData: CreateRoomRequest = {
        title,
        problemId,
        interviewerId: currentUser?.id || 'interviewer-' + Date.now(),
        interviewerName,
      };
      const room = await createRoom(requestData);
      setMyRooms([room, ...myRooms]);
      onSuccess(room);
      onClose();
      setTitle('');
      setProblemId('');
      setInterviewerName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建房间失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '24px', width: '480px', border: '1px solid #333' }}>
        <h2 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '20px' }}>创建面试房间</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '14px' }}>房间标题 *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入房间标题"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #555', background: '#2d2d2d', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '14px' }}>选择题目 *</label>
            <select
              value={problemId}
              onChange={e => setProblemId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #555', background: '#2d2d2d', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
            >
              <option value="">请选择题目</option>
              {MOCK_PROBLEMS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '14px' }}>面试官姓名 *</label>
            <input
              type="text"
              value={interviewerName}
              onChange={e => setInterviewerName(e.target.value)}
              placeholder="请输入面试官姓名"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #555', background: '#2d2d2d', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          {error && (
            <div style={{ color: '#f44336', marginBottom: '16px', fontSize: '14px', padding: '8px 12px', background: 'rgba(244,67,54,0.1)', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '10px 24px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '14px' }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '10px 24px', borderRadius: '4px', border: 'none', background: '#4caf50', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '创建中...' : '创建房间'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
