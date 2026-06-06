import React from 'react';
import Editor from '@monaco-editor/react';
import { useInterviewStore } from '../store/interview';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
];

export const CodeEditor: React.FC = () => {
  const { code, setCode, language, setLanguage } = useInterviewStore();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: '#1e1e1e', borderBottom: '1px solid #333' }}>
        <select value={language} onChange={e => setLanguage(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: '#2d2d2d', color: '#fff' }}>
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <button style={{ padding: '4px 16px', borderRadius: '4px', border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer' }}>Run</button>
        <button style={{ padding: '4px 16px', borderRadius: '4px', border: 'none', background: '#2196f3', color: '#fff', cursor: 'pointer' }}>Submit</button>
      </div>
      <Editor height="calc(100vh - 200px)" language={language} value={code}
        onChange={(v) => setCode(v || '')} theme="vs-dark"
        options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }} />
    </div>
  );
};
