import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useInterviewStore, ExecutionResult } from '../store/interview';
import { SubmissionResult } from './SubmissionResult';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
];

interface CodeEditorProps {
  disabled?: boolean;
  onRun?: () => Promise<ExecutionResult>;
  onSubmit?: () => Promise<ExecutionResult>;
  showRunButton?: boolean;
  showSubmitButton?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  disabled = false,
  onRun,
  onSubmit,
  showRunButton = true,
  showSubmitButton = true,
}) => {
  const {
    code,
    setCode,
    language,
    setLanguage,
    originalCode,
    isRunning,
    isSubmitting,
    setIsRunning,
    setIsSubmitting,
    setLastRunResult,
    setLastSubmissionResult,
    addExecutionHistory,
    resetOriginalCode,
    currentProblem,
    lastRunResult,
    lastSubmissionResult,
  } = useInterviewStore();

  const [languageConfirmOpen, setLanguageConfirmOpen] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [codeModified, setCodeModified] = useState(false);

  useEffect(() => {
    setCodeModified(code !== originalCode);
  }, [code, originalCode]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const showStatus = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
  }, []);

  const handleLanguageChange = useCallback((newLang: string) => {
    if (newLang === language) return;

    if (codeModified && code.trim() !== '') {
      setPendingLanguage(newLang);
      setLanguageConfirmOpen(true);
    } else {
      setLanguage(newLang);
      showStatus('info', `已切换到 ${LANGUAGES.find(l => l.value === newLang)?.label || newLang}`);
    }
  }, [language, codeModified, code, setLanguage, showStatus]);

  const confirmLanguageChange = useCallback(() => {
    if (pendingLanguage) {
      setLanguage(pendingLanguage);
      resetOriginalCode();
      showStatus('info', `已切换到 ${LANGUAGES.find(l => l.value === pendingLanguage)?.label || pendingLanguage}`);
    }
    setLanguageConfirmOpen(false);
    setPendingLanguage(null);
  }, [pendingLanguage, setLanguage, resetOriginalCode, showStatus]);

  const cancelLanguageChange = useCallback(() => {
    setLanguageConfirmOpen(false);
    setPendingLanguage(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (disabled || isRunning || isSubmitting) return;

    setIsRunning(true);
    setLastRunResult(null);
    showStatus('info', '正在运行代码...');

    try {
      let result;
      if (onRun) {
        result = await onRun();
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = { success: true, output: '// 模拟运行结果\nHello, World!' };
      }

      setLastRunResult(result);

      const passedCount = result.testResults?.filter(t => t.passed).length || 0;
      const totalCount = result.testResults?.length || 0;
      addExecutionHistory({
        id: `run-${Date.now()}`,
        type: 'run',
        result,
        timestamp: new Date().toISOString(),
        language,
        passedCount,
        totalCount,
        runtime: result.runtime,
        memory: result.memory,
      });

      if (result.success) {
        showStatus('success', '运行成功 ✓');
      } else {
        showStatus('error', result.error || '运行失败 ✗');
      }
    } catch (error) {
      const errorResult = { success: false, error: error instanceof Error ? error.message : '运行出错' };
      setLastRunResult(errorResult);
      addExecutionHistory({
        id: `run-${Date.now()}`,
        type: 'run',
        result: errorResult,
        timestamp: new Date().toISOString(),
        language,
        passedCount: 0,
        totalCount: 0,
      });
      showStatus('error', errorResult.error);
    } finally {
      setIsRunning(false);
    }
  }, [disabled, isRunning, isSubmitting, onRun, setIsRunning, setLastRunResult, addExecutionHistory, language, showStatus]);

  const handleSubmit = useCallback(async () => {
    if (disabled || isRunning || isSubmitting) return;

    if (!window.confirm('确定要提交代码吗？提交后将无法修改。')) {
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionResult(null);
    showStatus('info', '正在提交代码...');

    try {
      let result;
      if (onSubmit) {
        result = await onSubmit();
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const testCases = currentProblem?.testCases?.filter(t => !t.hidden) || [];
        result = {
          success: Math.random() > 0.3,
          output: `// 模拟提交结果\n通过 ${Math.floor(Math.random() * testCases.length) + 1}/${testCases.length} 个测试用例`,
          runtime: Math.floor(Math.random() * 80) + 20,
          memory: Math.floor(Math.random() * 60) + 30,
          testResults: testCases.map(t => ({
            passed: Math.random() > 0.3,
            input: t.input,
            expected: t.expectedOutput,
            actual: Math.random() > 0.3 ? t.expectedOutput : 'wrong_output',
          })),
        };
      }

      setLastSubmissionResult(result);

      const passedCount = result.testResults?.filter(t => t.passed).length || 0;
      const totalCount = result.testResults?.length || 0;
      addExecutionHistory({
        id: `submit-${Date.now()}`,
        type: 'submit',
        result,
        timestamp: new Date().toISOString(),
        language,
        passedCount,
        totalCount,
        runtime: result.runtime,
        memory: result.memory,
      });

      if (result.success) {
        showStatus('success', '提交成功 ✓ 所有测试用例通过');
      } else {
        showStatus('error', '提交失败 ✗ 存在未通过的测试用例');
      }
    } catch (error) {
      const errorResult = { success: false, error: error instanceof Error ? error.message : '提交出错' };
      setLastSubmissionResult(errorResult);
      addExecutionHistory({
        id: `submit-${Date.now()}`,
        type: 'submit',
        result: errorResult,
        timestamp: new Date().toISOString(),
        language,
        passedCount: 0,
        totalCount: 0,
      });
      showStatus('error', errorResult.error);
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, isRunning, isSubmitting, onSubmit, currentProblem, setIsSubmitting, setLastSubmissionResult, addExecutionHistory, language, showStatus]);

  const buttonBaseStyle: React.CSSProperties = {
    padding: '6px 18px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    minWidth: '90px',
    justifyContent: 'center',
  };

  const getRunButtonStyle = (): React.CSSProperties => {
    const base = { ...buttonBaseStyle };
    if (disabled || isRunning || isSubmitting) {
      return { ...base, background: '#555', color: '#888', cursor: 'not-allowed', opacity: 0.7 };
    }
    return { ...base, background: '#4caf50', color: '#fff' };
  };

  const getSubmitButtonStyle = (): React.CSSProperties => {
    const base = { ...buttonBaseStyle };
    if (disabled || isRunning || isSubmitting) {
      return { ...base, background: '#555', color: '#888', cursor: 'not-allowed', opacity: 0.7 };
    }
    return { ...base, background: '#2196f3', color: '#fff' };
  };

  const Spinner = () => (
    <div style={{
      width: '14px',
      height: '14px',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 16px',
        background: '#1e1e1e',
        borderBottom: '1px solid #333',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              disabled={disabled || isRunning || isSubmitting}
              style={{
                padding: '6px 32px 6px 12px',
                borderRadius: '6px',
                border: codeModified ? '1px solid #ff9800' : '1px solid #555',
                background: '#2d2d2d',
                color: '#fff',
                fontSize: '13px',
                cursor: disabled || isRunning || isSubmitting ? 'not-allowed' : 'pointer',
                outline: 'none',
                appearance: 'none',
                transition: 'border-color 0.2s',
              }}
            >
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#888',
              fontSize: '10px',
            }}>▼</div>
            {codeModified && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                background: '#ff9800',
                borderRadius: '50%',
              }} title="代码已修改" />
            )}
          </div>

          {codeModified && (
            <span style={{
              color: '#ff9800',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              ● 已修改
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {statusMessage && (
            <span style={{
              color: statusMessage.type === 'success' ? '#4caf50' : statusMessage.type === 'error' ? '#f44336' : '#2196f3',
              fontSize: '12px',
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: '4px',
              background: statusMessage.type === 'success' ? 'rgba(76, 175, 80, 0.1)' :
                statusMessage.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)',
            }}>
              {statusMessage.text}
            </span>
          )}

          {showRunButton && (
            <button
              onClick={handleRun}
              disabled={disabled || isRunning || isSubmitting}
              style={getRunButtonStyle()}
              onMouseEnter={(e) => {
                if (!disabled && !isRunning && !isSubmitting) {
                  e.currentTarget.style.background = '#45a049';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isRunning && !isSubmitting) {
                  e.currentTarget.style.background = '#4caf50';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                if (!disabled && !isRunning && !isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              title={disabled ? '面试未开始' : isRunning ? '正在运行...' : '运行代码 (Ctrl+Enter)'}
            >
              {isRunning ? <Spinner /> : '▶'}
              {isRunning ? '运行中' : '运行'}
            </button>
          )}

          {showSubmitButton && (
            <button
              onClick={handleSubmit}
              disabled={disabled || isRunning || isSubmitting}
              style={getSubmitButtonStyle()}
              onMouseEnter={(e) => {
                if (!disabled && !isRunning && !isSubmitting) {
                  e.currentTarget.style.background = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isRunning && !isSubmitting) {
                  e.currentTarget.style.background = '#2196f3';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                if (!disabled && !isRunning && !isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              title={disabled ? '面试未开始' : isSubmitting ? '正在提交...' : '提交代码 (Ctrl+Shift+Enter)'}
            >
              {isSubmitting ? <Spinner /> : '✓'}
              {isSubmitting ? '提交中' : '提交'}
            </button>
          )}
        </div>
      </div>

      {languageConfirmOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#2d2d2d',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid #444',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '16px' }}>
              ⚠️ 确认切换语言
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#ccc', fontSize: '13px', lineHeight: 1.6 }}>
              当前代码已修改，切换到 <strong style={{ color: '#ff9800' }}>
                {LANGUAGES.find(l => l.value === pendingLanguage)?.label || pendingLanguage}
              </strong> 将重置代码模板。
              <br /><br />
              是否继续？
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={cancelLanguageChange}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  background: 'transparent',
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                取消
              </button>
              <button
                onClick={confirmLanguageChange}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ff9800',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: lastRunResult || lastSubmissionResult ? '0 0 60%' : '1', overflow: 'hidden', minHeight: '200px' }}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(v) => setCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              readOnly: disabled,
              automaticLayout: true,
            }}
          />
        </div>

        {lastSubmissionResult && (
          <div style={{ flex: '0 0 40%', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
            <SubmissionResult
              title="提交结果"
              type="submit"
              success={lastSubmissionResult.success}
              output={lastSubmissionResult.output}
              error={lastSubmissionResult.error}
              runtime={lastSubmissionResult.runtime}
              memory={lastSubmissionResult.memory}
              testResults={lastSubmissionResult.testResults}
            />
          </div>
        )}

        {!lastSubmissionResult && lastRunResult && (
          <div style={{ flex: '0 0 40%', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
            <SubmissionResult
              title="运行结果"
              type="run"
              success={lastRunResult.success}
              output={lastRunResult.output}
              error={lastRunResult.error}
              runtime={lastRunResult.runtime}
              memory={lastRunResult.memory}
              testResults={lastRunResult.testResults}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
