import React from 'react';
import { Problem } from '../types';

interface Props { problem: Problem; }

export const ProblemPanel: React.FC<Props> = ({ problem }) => (
  <div style={{ width: '400px', padding: '20px', overflow: 'auto', borderRight: '1px solid #e0e0e0' }}>
    <h2 style={{ margin: '0 0 8px', fontSize: '18px' }}>{problem.title}</h2>
    <span style={{
      fontSize: '12px', padding: '2px 10px', borderRadius: '12px', color: '#fff',
      background: problem.difficulty === 'easy' ? '#4caf50' : problem.difficulty === 'medium' ? '#ff9800' : '#e53935'
    }}>{problem.difficulty === 'easy' ? 'Easy' : problem.difficulty === 'medium' ? 'Medium' : 'Hard'}</span>
    <div style={{ margin: '16px 0', lineHeight: 1.6, fontSize: '14px' }}>{problem.description}</div>
    <h3 style={{ fontSize: '14px', margin: '16px 0 8px' }}>Examples</h3>
    {problem.examples.map((ex, i) => (
      <div key={i} style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }}>
        <div><strong>Input:</strong> {ex.input}</div>
        <div><strong>Output:</strong> {ex.output}</div>
        {ex.explanation && <div><strong>Note:</strong> {ex.explanation}</div>}
      </div>
    ))}
    <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
      Time: {problem.timeLimit}ms | Memory: {problem.memoryLimit}MB
    </div>
  </div>
);
