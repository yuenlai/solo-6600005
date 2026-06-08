import React, { useState, useMemo } from 'react';
import { useInterviewStore, ExecutionHistoryItem } from '../store/interview';
import { ExecutionResult } from '../store/interview';

type TestResult = NonNullable<ExecutionResult['testResults']>[number];

interface SubmissionResultProps {
  title: string;
  type: 'run' | 'submit';
  success: boolean;
  output?: string;
  error?: string;
  runtime?: number;
  memory?: number;
  testResults?: TestResult[];
}

const getStatusColor = (passed: boolean) => passed ? '#4caf50' : '#f44336';
const getStatusBg = (passed: boolean) => passed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isWarning = percentage > 80;
  const isDanger = percentage > 90;
  const barColor = isDanger ? '#f44336' : isWarning ? '#ff9800' : color;

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '12px', color: barColor, fontWeight: 600, fontFamily: 'monospace' }}>
          {value}{label.includes('时间') ? 'ms' : 'MB'} / {max}{label.includes('时间') ? 'ms' : 'MB'}
        </span>
      </div>
      <div style={{
        height: '8px',
        background: '#333',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: barColor,
          borderRadius: '4px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
};

const SparkLineChart: React.FC<{
  data: (number | undefined)[];
  color: string;
  maxValue: number;
  label: string;
  unit: string;
}> = ({ data, color, maxValue, label, unit }) => {
  const validData = data.filter((d): d is number => d !== undefined);
  if (validData.length === 0) return null;

  const width = 200;
  const height = 60;
  const padding = 4;
  const values = validData.map(d => Math.min(d, maxValue));
  const max = Math.max(...values, maxValue * 0.1);

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (v / max) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '6px',
      padding: '12px',
      border: '1px solid #333',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '12px', color: color, fontWeight: 600, fontFamily: 'monospace' }}>
          {values[values.length - 1]}{unit}
        </span>
      </div>
      <svg width={width} height={height} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#gradient-${label})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <circle
            key={i}
            cx={padding + (i / (values.length - 1 || 1)) * (width - 2 * padding)}
            cy={height - padding - (v / max) * (height - 2 * padding)}
            r="3"
            fill={i === values.length - 1 ? color : '#1a1a1a'}
            stroke={color}
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
};

const BarChart: React.FC<{
  items: { label: string; value: number; max: number; color: string }[];
}> = ({ items }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-end',
      height: '80px',
      padding: '0 4px',
    }}>
      {items.map((item, idx) => {
        const percentage = Math.min((item.value / item.max) * 100, 100);
        return (
          <div key={idx} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            height: '100%',
            justifyContent: 'flex-end',
          }}>
            <span style={{
              fontSize: '10px',
              color: item.color,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}>
              {item.value}/{item.max}
            </span>
            <div style={{
              width: '100%',
              height: `${percentage}%`,
              background: item.color,
              borderRadius: '4px 4px 0 0',
              minHeight: '4px',
              opacity: 0.8,
              transition: 'height 0.3s ease',
            }} />
            <span style={{ fontSize: '10px', color: '#888' }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const TestCaseItem: React.FC<{ result: TestResult; index: number; isExpanded: boolean; onToggle: () => void }> = ({
  result, index, isExpanded, onToggle
}) => {
  return (
    <div style={{
      border: `1px solid ${result.passed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
      borderRadius: '6px',
      marginBottom: '8px',
      overflow: 'hidden',
      background: result.passed ? 'rgba(76, 175, 80, 0.03)' : 'rgba(244, 67, 54, 0.03)',
    }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: getStatusBg(result.passed),
          border: `2px solid ${getStatusColor(result.passed)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '12px',
          color: getStatusColor(result.passed),
          fontWeight: 'bold',
        }}>
          {result.passed ? '✓' : '✗'}
        </div>
        <span style={{
          flex: 1,
          color: '#ddd',
          fontSize: '13px',
          fontWeight: 500,
        }}>
          测试用例 {index + 1}
        </span>
        <span style={{
          fontSize: '11px',
          color: getStatusColor(result.passed),
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '4px',
          background: getStatusBg(result.passed),
        }}>
          {result.passed ? '通过' : '失败'}
        </span>
        <span style={{
          color: '#666',
          fontSize: '12px',
          transition: 'transform 0.2s',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div style={{
          padding: '12px',
          borderTop: `1px solid ${result.passed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
          background: '#1a1a1a',
        }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 500 }}>输入</div>
            <pre style={{
              margin: 0,
              padding: '8px 10px',
              background: '#2d2d2d',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#bbb',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>{result.input}</pre>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 500 }}>期望输出</div>
              <pre style={{
                margin: 0,
                padding: '8px 10px',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#81c784',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>{result.expected}</pre>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 500 }}>实际输出</div>
              <pre style={{
                margin: 0,
                padding: '8px 10px',
                background: result.passed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                border: `1px solid ${result.passed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                borderRadius: '4px',
                fontSize: '12px',
                color: result.passed ? '#81c784' : '#e57373',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>{result.actual || '—'}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryTimelineItem: React.FC<{
  item: ExecutionHistoryItem;
  isSelected: boolean;
  isLatest: boolean;
  onClick: () => void;
}> = ({ item, isSelected, isLatest, onClick }) => {
  const passRate = item.totalCount > 0 ? (item.passedCount / item.totalCount) * 100 : 0;
  const isSuccess = item.passedCount === item.totalCount && item.totalCount > 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        background: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
        border: `1px solid ${isSelected ? '#2196f3' : 'transparent'}`,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = '#2a2a2a';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: isSuccess ? '#4caf50' : '#f44336',
        flexShrink: 0,
        boxShadow: isLatest ? `0 0 8px ${isSuccess ? '#4caf50' : '#f44336'}` : 'none',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '3px',
            background: item.type === 'submit' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(156, 39, 176, 0.2)',
            color: item.type === 'submit' ? '#64b5f6' : '#ba68c8',
            fontWeight: 600,
          }}>
            {item.type === 'submit' ? '提交' : '运行'}
          </span>
          <span style={{ fontSize: '11px', color: '#888' }}>{formatTime(item.timestamp)}</span>
          {isLatest && (
            <span style={{ fontSize: '10px', color: '#ff9800', fontWeight: 600 }}>最新</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#bbb' }}>
          <span style={{ color: isSuccess ? '#4caf50' : '#f44336', fontFamily: 'monospace' }}>
            {item.passedCount}/{item.totalCount || '-'}
          </span>
          {item.runtime !== undefined && (
            <span style={{ color: '#2196f3', fontFamily: 'monospace' }}>
              {item.runtime}ms
            </span>
          )}
          {item.memory !== undefined && (
            <span style={{ color: '#9c27b0', fontFamily: 'monospace' }}>
              {item.memory}MB
            </span>
          )}
        </div>
      </div>

      <div style={{
        width: '40px',
        height: '4px',
        background: '#333',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${passRate}%`,
          height: '100%',
          background: isSuccess ? '#4caf50' : '#ff9800',
        }} />
      </div>
    </div>
  );
};

const ComparisonCard: React.FC<{
  item: ExecutionHistoryItem;
  timeLimit: number;
  memoryLimit: number;
  isLatest: boolean;
  bestRuntime?: number;
  bestMemory?: number;
  bestPassRate?: number;
}> = ({ item, timeLimit, memoryLimit, isLatest, bestRuntime, bestMemory, bestPassRate }) => {
  const passRate = item.totalCount > 0 ? (item.passedCount / item.totalCount) * 100 : 0;
  const isSuccess = item.passedCount === item.totalCount && item.totalCount > 0;
  const isBestRuntime = bestRuntime !== undefined && item.runtime === bestRuntime;
  const isBestMemory = bestMemory !== undefined && item.memory === bestMemory;
  const isBestPassRate = bestPassRate !== undefined && passRate === bestPassRate && passRate > 0;

  return (
    <div style={{
      background: '#1a1a1a',
      border: `1px solid ${isLatest ? '#2196f3' : '#333'}`,
      borderRadius: '8px',
      padding: '12px',
      minWidth: '180px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '4px',
          background: item.type === 'submit' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(156, 39, 176, 0.2)',
          color: item.type === 'submit' ? '#64b5f6' : '#ba68c8',
          fontWeight: 600,
        }}>
          {item.type === 'submit' ? '提交' : '运行'}
        </span>
        {isLatest && (
          <span style={{ fontSize: '10px', color: '#ff9800', fontWeight: 600 }}>最新</span>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>通过率</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isBestPassRate && <span style={{ fontSize: '10px', color: '#ff9800' }}>🏆</span>}
            <span style={{
              fontSize: '16px',
              fontWeight: 700,
              color: isSuccess ? '#4caf50' : '#ff9800',
              fontFamily: 'monospace',
            }}>
              {Math.round(passRate)}%
            </span>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: '#bbb',
          fontFamily: 'monospace',
        }}>
          {item.passedCount}/{item.totalCount || '-'} 测试用例
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: '#888' }}>耗时</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {isBestRuntime && <span style={{ fontSize: '9px', color: '#ff9800' }}>🏆</span>}
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#2196f3',
                fontFamily: 'monospace',
              }}>
                {item.runtime !== undefined ? `${item.runtime}ms` : '-'}
              </span>
            </div>
          </div>
          <div style={{ height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${item.runtime !== undefined ? Math.min((item.runtime / timeLimit) * 100, 100) : 0}%`,
              background: '#2196f3',
            }} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: '#888' }}>内存</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {isBestMemory && <span style={{ fontSize: '9px', color: '#ff9800' }}>🏆</span>}
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#9c27b0',
                fontFamily: 'monospace',
              }}>
                {item.memory !== undefined ? `${item.memory}MB` : '-'}
              </span>
            </div>
          </div>
          <div style={{ height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${item.memory !== undefined ? Math.min((item.memory / memoryLimit) * 100, 100) : 0}%`,
              background: '#9c27b0',
            }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
        {formatTime(item.timestamp)} · {item.language}
      </div>
    </div>
  );
};

export const SubmissionResult: React.FC<SubmissionResultProps> = ({
  title,
  type,
  success,
  output,
  error,
  runtime,
  memory,
  testResults,
}) => {
  const { currentProblem, executionHistory } = useInterviewStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [compareCount, setCompareCount] = useState<number>(5);

  const passedCount = testResults?.filter(t => t.passed).length || 0;
  const failedCount = testResults?.filter(t => !t.passed).length || 0;
  const totalCount = testResults?.length || 0;

  const filteredResults = testResults?.filter(t => {
    if (filter === 'passed') return t.passed;
    if (filter === 'failed') return !t.passed;
    return true;
  }) || [];

  const timeLimit = currentProblem?.timeLimit || 1000;
  const memoryLimit = currentProblem?.memoryLimit || 128;
  const displayRuntime = runtime;
  const displayMemory = memory;

  const submitHistory = useMemo(() => {
    return executionHistory.filter(h => h.type === 'submit').slice(0, 10);
  }, [executionHistory]);

  const comparisonData = useMemo(() => {
    const items = executionHistory.slice(0, compareCount);
    const runtimes = items.map(i => i.runtime).filter((r): r is number => r !== undefined);
    const memories = items.map(i => i.memory).filter((m): m is number => m !== undefined);
    const passRates = items.map(i => i.totalCount > 0 ? (i.passedCount / i.totalCount) * 100 : 0).filter(r => r > 0);

    return {
      items,
      bestRuntime: runtimes.length > 0 ? Math.min(...runtimes) : undefined,
      bestMemory: memories.length > 0 ? Math.min(...memories) : undefined,
      bestPassRate: passRates.length > 0 ? Math.max(...passRates) : undefined,
    };
  }, [executionHistory, compareCount]);

  const chartData = useMemo(() => {
    const items = executionHistory.slice(0, 10).reverse();
    return {
      runtimes: items.map(i => i.runtime),
      memories: items.map(i => i.memory),
      passRates: items.map(i => i.totalCount > 0 ? (i.passedCount / i.totalCount) * 100 : undefined),
      labels: items.map((_, idx) => `#${idx + 1}`),
    };
  }, [executionHistory]);

  const selectedHistory = executionHistory.find(h => h.id === selectedHistoryId);

  return (
    <div style={{
      background: '#1e1e1e',
      borderTop: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
        borderBottom: `1px solid ${success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: getStatusBg(success),
            border: `2px solid ${getStatusColor(success)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: getStatusColor(success),
            fontWeight: 'bold',
          }}>
            {success ? '✓' : '✗'}
          </div>
          <div>
            <span style={{
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {title}
            </span>
            {testResults && (
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: success ? '#4caf50' : '#f44336',
                fontWeight: 600,
              }}>
                {success ? '全部通过' : `${passedCount}/${totalCount} 通过`}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { key: 'current', label: '当前结果' },
            { key: 'history', label: '历史对比' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'current' | 'history')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: activeTab === key ? '1px solid #2196f3' : '1px solid transparent',
                background: activeTab === key ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
                color: activeTab === key ? '#64b5f6' : '#888',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {label}
              {key === 'history' && submitHistory.length > 0 && (
                <span style={{
                  marginLeft: '4px',
                  fontSize: '10px',
                  background: '#2196f3',
                  color: '#fff',
                  padding: '1px 5px',
                  borderRadius: '8px',
                }}>
                  {submitHistory.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {type === 'submit' && testResults && activeTab === 'current' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
              <ProgressBar
                value={displayRuntime || 0}
                max={timeLimit}
                color="#2196f3"
                label="⏱ 耗时"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
              <ProgressBar
                value={displayMemory || 0}
                max={memoryLimit}
                color="#9c27b0"
                label="💾 内存"
              />
            </div>
          </div>
        )}
      </div>

      {activeTab === 'current' && testResults && testResults.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 16px',
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
        }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[
              { key: 'all', label: '全部', count: totalCount },
              { key: 'passed', label: '通过', count: passedCount, color: '#4caf50' },
              { key: 'failed', label: '失败', count: failedCount, color: '#f44336' },
            ].map(({ key, label, count, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: filter === key ? `1px solid ${color || '#666'}` : '1px solid transparent',
                  background: filter === key ? (color ? `${color}15` : '#333') : 'transparent',
                  color: filter === key ? (color || '#fff') : '#888',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label} <span style={{ fontWeight: 600 }}>{count}</span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '12px',
            color: '#888',
          }}>
            {displayRuntime !== undefined && (
              <div>
                耗时: <span style={{ color: '#2196f3', fontWeight: 600, fontFamily: 'monospace' }}>{displayRuntime}ms</span>
                <span style={{ color: '#666', marginLeft: '4px' }}>({Math.round((displayRuntime / timeLimit) * 100)}%)</span>
              </div>
            )}
            {displayMemory !== undefined && (
              <div>
                内存: <span style={{ color: '#9c27b0', fontWeight: 600, fontFamily: 'monospace' }}>{displayMemory}MB</span>
                <span style={{ color: '#666', marginLeft: '4px' }}>({Math.round((displayMemory / memoryLimit) * 100)}%)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 16px',
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>对比最近</span>
            <select
              value={compareCount}
              onChange={(e) => setCompareCount(Number(e.target.value))}
              style={{
                padding: '2px 8px',
                background: '#2d2d2d',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {[3, 5, 10].map(n => (
                <option key={n} value={n}>{n} 次</option>
              ))}
            </select>
            <span style={{ fontSize: '12px', color: '#888' }}>执行记录</span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: '#666',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#4caf50', borderRadius: '50%' }} />
              通过
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#f44336', borderRadius: '50%' }} />
              失败
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🏆</span> 最佳
            </span>
          </div>
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
      }}>
        {activeTab === 'current' && (
          <>
            {error && (
              <div style={{
                padding: '12px',
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '6px',
                marginBottom: '12px',
              }}>
                <div style={{ color: '#f44336', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>错误信息</div>
                <pre style={{
                  margin: 0,
                  color: '#e57373',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>{error}</pre>
              </div>
            )}

            {output && !testResults && (
              <div style={{
                padding: '12px',
                background: '#2d2d2d',
                borderRadius: '6px',
              }}>
                <pre style={{
                  margin: 0,
                  color: '#ddd',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>{output}</pre>
              </div>
            )}

            {filteredResults.length > 0 ? (
              <div>
                {filteredResults.map((result, idx) => {
                  const originalIndex = testResults?.findIndex(t => t === result) ?? idx;
                  return (
                    <TestCaseItem
                      key={originalIndex}
                      result={result}
                      index={originalIndex}
                      isExpanded={expandedIndex === originalIndex}
                      onToggle={() => setExpandedIndex(expandedIndex === originalIndex ? null : originalIndex)}
                    />
                  );
                })}
              </div>
            ) : testResults && testResults.length > 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#666',
                fontSize: '13px',
              }}>
                没有符合筛选条件的测试用例
              </div>
            ) : null}
          </>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
            <div style={{
              width: '280px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                fontSize: '12px',
                color: '#888',
                fontWeight: 500,
                marginBottom: '4px',
                padding: '0 4px',
              }}>
                执行历史 ({executionHistory.length})
              </div>
              <div style={{
                background: '#1a1a1a',
                borderRadius: '6px',
                border: '1px solid #333',
                overflow: 'auto',
                flex: 1,
              }}>
                {executionHistory.length > 0 ? (
                  executionHistory.map((item, idx) => (
                    <HistoryTimelineItem
                      key={item.id}
                      item={item}
                      isSelected={selectedHistoryId === item.id}
                      isLatest={idx === 0}
                      onClick={() => setSelectedHistoryId(selectedHistoryId === item.id ? null : item.id)}
                    />
                  ))
                ) : (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '13px',
                  }}>
                    暂无执行历史
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto' }}>
              {comparisonData.items.length >= 2 && (
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    fontWeight: 500,
                    marginBottom: '12px',
                  }}>
                    📊 性能趋势
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <SparkLineChart
                      data={chartData.passRates}
                      color="#4caf50"
                      maxValue={100}
                      label="通过率 %"
                      unit="%"
                    />
                    <SparkLineChart
                      data={chartData.runtimes}
                      color="#2196f3"
                      maxValue={timeLimit}
                      label="⏱ 耗时"
                      unit="ms"
                    />
                    <SparkLineChart
                      data={chartData.memories}
                      color="#9c27b0"
                      maxValue={memoryLimit}
                      label="💾 内存"
                      unit="MB"
                    />
                  </div>
                </div>
              )}

              {comparisonData.items.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    fontWeight: 500,
                    marginBottom: '12px',
                  }}>
                    📈 用例通过数对比
                  </div>
                  <div style={{
                    background: '#1a1a1a',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    padding: '16px 16px 8px 16px',
                  }}>
                    <BarChart
                      items={comparisonData.items.map((item, idx) => ({
                        label: `#${comparisonData.items.length - idx}`,
                        value: item.passedCount,
                        max: item.totalCount || 1,
                        color: item.passedCount === item.totalCount && item.totalCount > 0 ? '#4caf50' : '#ff9800',
                      })).reverse()}
                    />
                  </div>
                </div>
              )}

              {comparisonData.items.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    fontWeight: 500,
                    marginBottom: '12px',
                  }}>
                    🎯 详细对比卡片
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                  }}>
                    {comparisonData.items.map((item, idx) => (
                      <ComparisonCard
                        key={item.id}
                        item={item}
                        timeLimit={timeLimit}
                        memoryLimit={memoryLimit}
                        isLatest={idx === 0}
                        bestRuntime={comparisonData.bestRuntime}
                        bestMemory={comparisonData.bestMemory}
                        bestPassRate={comparisonData.bestPassRate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedHistory && (
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    fontWeight: 500,
                    marginBottom: '12px',
                  }}>
                    🔍 选中记录详情 - {formatTime(selectedHistory.timestamp)}
                  </div>
                  {selectedHistory.result.testResults ? (
                    <div>
                      {selectedHistory.result.testResults.map((result, idx) => (
                        <TestCaseItem
                          key={idx}
                          result={result}
                          index={idx}
                          isExpanded={expandedIndex === idx + 1000}
                          onToggle={() => setExpandedIndex(expandedIndex === idx + 1000 ? null : idx + 1000)}
                        />
                      ))}
                    </div>
                  ) : selectedHistory.result.output ? (
                    <div style={{
                      padding: '12px',
                      background: '#2d2d2d',
                      borderRadius: '6px',
                    }}>
                      <pre style={{
                        margin: 0,
                        color: '#ddd',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}>{selectedHistory.result.output}</pre>
                    </div>
                  ) : selectedHistory.result.error ? (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(244, 67, 54, 0.1)',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      borderRadius: '6px',
                    }}>
                      <pre style={{
                        margin: 0,
                        color: '#e57373',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}>{selectedHistory.result.error}</pre>
                    </div>
                  ) : null}
                </div>
              )}

              {comparisonData.items.length === 0 && !selectedHistory && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '13px',
                }}>
                  运行或提交代码后，这里将显示历史对比数据
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionResult;
