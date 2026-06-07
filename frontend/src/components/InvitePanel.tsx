import React, { useState, useEffect } from 'react';
import { createInvitation, getInvitationsByRoom, deleteInvitation } from '../services/invitationService';
import { InviteCandidateRequest } from '../types';
import { useInterviewStore } from '../store/interview';

interface InvitePanelProps {
  roomId: string;
  roomCode: string;
}

const statusColors: Record<string, string> = {
  PENDING: '#ff9800',
  ACCEPTED: '#4caf50',
  DECLINED: '#f44336',
  JOINED: '#2196f3',
  LEFT: '#9e9e9e',
};

export const InvitePanel: React.FC<InvitePanelProps> = ({ roomId, roomCode }) => {
  const { invitations, setInvitations } = useInterviewStore();
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      const data = await getInvitationsByRoom(roomId);
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [roomId]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) return;

    const request: InviteCandidateRequest = {
      roomId,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
    };

    try {
      await createInvitation(request);
      setCandidateName('');
      setCandidateEmail('');
      fetchInvitations();
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      await deleteInvitation(invitationId);
      fetchInvitations();
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
    }
  };

  const inviteLink = `${window.location.origin}/join/${roomCode}`;

  return (
    <div style={{
      width: '420px',
      padding: '24px',
      background: '#1e1e1e',
      color: '#e0e0e0',
      overflowY: 'auto',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>邀请候选人</h2>

      <div style={{ background: '#2a2a2a', padding: '16px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>房间邀请码</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>{roomCode}</span>
            <button
              onClick={() => handleCopy(roomCode, 'code')}
              style={{
                padding: '4px 12px',
                background: copiedField === 'code' ? '#4caf50' : '#3a3a3a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {copiedField === 'code' ? '已复制' : '复制'}
            </button>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>邀请链接</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#bbb', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inviteLink}</span>
            <button
              onClick={() => handleCopy(inviteLink, 'link')}
              style={{
                padding: '4px 12px',
                background: copiedField === 'link' ? '#4caf50' : '#3a3a3a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {copiedField === 'link' ? '已复制' : '复制'}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>候选人姓名</label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="请输入候选人姓名"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>候选人邮箱</label>
          <input
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            placeholder="请输入候选人邮箱"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          发送邀请
        </button>
      </form>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#fff' }}>邀请记录</h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {invitations.length === 0 ? (
            <div style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              暂无邀请记录
            </div>
          ) : (
            invitations.map((invitation) => (
              <div key={invitation.id} style={{
                background: '#2a2a2a',
                padding: '12px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500', color: '#fff' }}>{invitation.candidateName}</span>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff',
                    background: statusColors[invitation.status],
                  }}>
                    {invitation.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>{invitation.candidateEmail}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#666' }}>
                    {new Date(invitation.createdAt).toLocaleString()}
                  </span>
                  {invitation.status === 'PENDING' && (
                    <button
                      onClick={() => handleRevoke(invitation.id)}
                      style={{
                        padding: '4px 10px',
                        background: 'transparent',
                        color: '#f44336',
                        border: '1px solid #f44336',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      撤销
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
