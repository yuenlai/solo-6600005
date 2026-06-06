import React, { useState } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { ProblemPanel } from './components/ProblemPanel';
import { Problem } from './types';

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

const App: React.FC = () => {
  const [problem] = useState<Problem>(mockProblem);
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <ProblemPanel problem={problem} />
      <CodeEditor />
    </div>
  );
};
export default App;
