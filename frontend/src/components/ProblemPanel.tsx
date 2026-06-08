import React from 'react';
import { Problem, getDifficultyTag } from '../types';

interface Props { problem: Problem; }

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
    <span style={{ color: '#888', fontWeight: 500 }}>{label}:</span>
    <span style={{ color: '#ddd' }}>{value}</span>
  </div>
);

export const ProblemPanel: React.FC<Props> = ({ problem }) => {
  const difficultyTag = getDifficultyTag(problem.difficulty);

  return (
    <div style={{ width: '400px', padding: '20px', overflow: 'auto', borderRight: '1px solid #333', background: '#1a1a1a' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 600, color: '#fff' }}>{problem.title}</h2>

      <div style={{
        background: '#2a2a2a',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '12px',
            padding: '4px 12px',
            borderRadius: '12px',
            color: difficultyTag.color,
            background: difficultyTag.bgColor,
            fontWeight: 600
          }}>
            {difficultyTag.label}
          </span>
        </div>

        {problem.tags && problem.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {problem.tags.map((tag, i) => (
              <span key={i} style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '4px',
                background: 'rgba(25, 118, 210, 0.2)',
                color: '#64b5f6',
                fontWeight: 500
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid #444'
        }}>
          <InfoItem label="⏱ 时间" value={`${problem.timeLimit}ms`} />
          <InfoItem label="💾 内存" value={`${problem.memoryLimit}MB`} />
        </div>
      </div>

      <div style={{ margin: '16px 0', lineHeight: 1.6, fontSize: '14px', color: '#ccc' }}>{problem.description}</div>

      <h3 style={{ fontSize: '14px', margin: '16px 0 8px', fontWeight: 600, color: '#fff' }}>Examples</h3>
      {problem.examples.map((ex, i) => (
        <div key={i} style={{ background: '#2a2a2a', padding: '12px', borderRadius: '6px', marginBottom: '8px', fontSize: '13px', color: '#ccc' }}>
          <div style={{ marginBottom: '4px' }}><strong style={{ color: '#fff' }}>Input:</strong> {ex.input}</div>
          <div style={{ marginBottom: '4px' }}><strong style={{ color: '#fff' }}>Output:</strong> {ex.output}</div>
          {ex.explanation && <div><strong style={{ color: '#fff' }}>Note:</strong> {ex.explanation}</div>}
        </div>
      ))}
    </div>
  );
};
