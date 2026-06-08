import React from 'react';
import { Problem, getDifficultyTag } from '../types';

interface Props { problem: Problem; }

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
    <span style={{ color: '#888', fontWeight: 500 }}>{label}</span>
    <span style={{ color: '#ddd', fontWeight: 500 }}>{value}</span>
  </div>
);

export const ProblemPanel: React.FC<Props> = ({ problem }) => {
  const difficultyTag = getDifficultyTag(problem.difficulty);

  return (
    <div style={{
      height: '100%',
      padding: '12px 16px',
      overflowY: 'auto',
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <h1 style={{
        margin: '0 0 8px',
        fontSize: '16px',
        fontWeight: 600,
        color: '#fff',
        lineHeight: 1.4,
      }}>{problem.title}</h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px 10px',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #333',
      }}>
        <span style={{
          fontSize: '11px',
          padding: '3px 10px',
          borderRadius: '10px',
          color: difficultyTag.color,
          background: difficultyTag.bgColor,
          fontWeight: 600,
          lineHeight: 1.4,
        }}>
          {difficultyTag.label}
        </span>

        {problem.tags && problem.tags.length > 0 && problem.tags.slice(0, 3).map((tag, i) => (
          <span key={i} style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(25, 118, 210, 0.2)',
            color: '#64b5f6',
            fontWeight: 500,
            lineHeight: 1.4,
          }}>
            {tag}
          </span>
        ))}

        {problem.tags && problem.tags.length > 3 && (
          <span style={{
            fontSize: '10px',
            color: '#888',
          }}>
            +{problem.tags.length - 3}
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <InfoItem label="⏱" value={`${problem.timeLimit}ms`} />
          <InfoItem label="💾" value={`${problem.memoryLimit}MB`} />
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
      }}>
        <div style={{
          marginBottom: '12px',
          lineHeight: 1.7,
          fontSize: '13px',
          color: '#d4d4d4',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>{problem.description}</div>

        <h3 style={{
          fontSize: '12px',
          margin: '0 0 8px',
          fontWeight: 600,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>示例</h3>

        {problem.examples.map((ex, i) => (
          <div key={i} style={{
            background: '#1e1e1e',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#ccc',
            border: '1px solid #3a3a3a',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px',
              background: '#2a2a2a',
              borderBottom: '1px solid #3a3a3a',
              fontSize: '11px',
              fontWeight: 600,
              color: '#888',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              示例 {i + 1}
            </div>

            <div style={{
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#569cd6',
                  letterSpacing: '0.3px',
                }}>输入</span>
                <pre style={{
                  margin: 0,
                  padding: '10px 12px',
                  background: '#252526',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#ce9178',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  overflowX: 'auto',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  border: '1px solid #333',
                }}>{ex.input}</pre>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#569cd6',
                  letterSpacing: '0.3px',
                }}>输出</span>
                <pre style={{
                  margin: 0,
                  padding: '10px 12px',
                  background: '#1e3a2e',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#4ec9b0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  overflowX: 'auto',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  border: '1px solid #2a4a3a',
                }}>{ex.output}</pre>
              </div>

              {ex.explanation && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginTop: '2px',
                  paddingTop: '10px',
                  borderTop: '1px solid #3a3a3a',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#c586c0',
                    letterSpacing: '0.3px',
                  }}>💡 说明</span>
                  <div style={{
                    padding: '10px 12px',
                    background: '#2a1e2e',
                    borderRadius: '4px',
                    fontSize: '12px',
                    lineHeight: 1.7,
                    color: '#d4a5ff',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: '1px solid #3a2a4a',
                  }}>{ex.explanation}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
