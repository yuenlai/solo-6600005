import React from 'react';
import { Problem, getDifficultyTag } from '../types';

interface Props { problem: Problem; }

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
    <span style={{ color: '#888', fontWeight: 500 }}>{label}:</span>
    <span style={{ color: '#333' }}>{value}</span>
  </div>
);

export const ProblemPanel: React.FC<Props> = ({ problem }) => {
  const difficultyTag = getDifficultyTag(problem.difficulty);

  return (
    <div style={{ width: '400px', padding: '20px', overflow: 'auto', borderRight: '1px solid #e0e0e0' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 600 }}>{problem.title}</h2>

      <div style={{
        background: '#fafafa',
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
                background: '#e3f2fd',
                color: '#1976d2',
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
          borderTop: '1px solid #eee'
        }}>
          <InfoItem label="⏱ 时间" value={`${problem.timeLimit}ms`} />
          <InfoItem label="💾 内存" value={`${problem.memoryLimit}MB`} />
        </div>
      </div>

      <div style={{ margin: '16px 0', lineHeight: 1.6, fontSize: '14px' }}>{problem.description}</div>

      <h3 style={{ fontSize: '14px', margin: '16px 0 8px', fontWeight: 600 }}>Examples</h3>
      {problem.examples.map((ex, i) => (
        <div key={i} style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }}>
          <div><strong>Input:</strong> {ex.input}</div>
          <div><strong>Output:</strong> {ex.output}</div>
          {ex.explanation && <div><strong>Note:</strong> {ex.explanation}</div>}
        </div>
      ))}
    </div>
  );
};
