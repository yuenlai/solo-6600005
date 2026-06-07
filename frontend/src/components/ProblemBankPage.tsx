import React, { useState, useEffect } from 'react';
import { useInterviewStore } from '../store/interview';
import { getProblems, parseProblemListResponse, deleteProblem } from '../services/problemService';
import { getDifficultyTag, DIFFICULTY_TAGS, type Problem } from '../types';
import { ProblemFormModal } from './ProblemFormModal';

export const ProblemBankPage: React.FC = () => {
  const { problems, setProblems, currentUser, removeProblem } = useInterviewStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadProblems();
  }, [selectedDifficulty, selectedTag]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const params: { difficulty?: string; tag?: string } = {};
      if (selectedDifficulty !== 'all') {
        params.difficulty = selectedDifficulty;
      }
      if (selectedTag) {
        params.tag = selectedTag;
      }
      const data = await getProblems(params);
      const parsedProblems = parseProblemListResponse(data);
      setProblems(parsedProblems);
    } catch (error) {
      console.error('Failed to load problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = () => {
    setEditingProblem(null);
    setIsModalOpen(true);
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (problemId: string) => {
    setDeleteConfirmId(problemId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteProblem(deleteConfirmId);
      removeProblem(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete problem:', error);
    }
  };

  const handleSuccess = (problem: Problem) => {
    console.log('Problem saved:', problem);
    loadProblems();
  };

  const filteredProblems = problems.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const allTags = Array.from(new Set(problems.flatMap(p => p.tags))).filter(t => t);

  const inputStyle = {
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1px solid #444',
    background: '#2d2d2d',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '28px', margin: '0 0 8px 0' }}>题库管理</h1>
            <p style={{ color: '#888', margin: 0 }}>管理所有面试编程题目，支持按难度和标签筛选</p>
          </div>
          <button
            onClick={handleCreateProblem}
            style={{
              padding: '10px 24px',
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}>
            + 新增题目
          </button>
        </div>

        <div style={{
          background: '#1e1e1e',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #333',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
        }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索题目标题、描述或标签..."
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>

          <div>
            <label style={{ color: '#888', fontSize: '12px', marginBottom: '4px', display: 'block' }}>难度筛选</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedDifficulty('all')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '16px',
                  border: `1px solid ${selectedDifficulty === 'all' ? '#667eea' : '#444'}`,
                  background: selectedDifficulty === 'all' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                  color: selectedDifficulty === 'all' ? '#667eea' : '#888',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                全部
              </button>
              {DIFFICULTY_TAGS.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => setSelectedDifficulty(tag.value)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '16px',
                    border: `1px solid ${selectedDifficulty === tag.value ? tag.color : '#444'}`,
                    background: selectedDifficulty === tag.value ? tag.bgColor : 'transparent',
                    color: selectedDifficulty === tag.value ? tag.color : '#888',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {allTags.length > 0 && (
            <div style={{ minWidth: '200px' }}>
              <label style={{ color: '#888', fontSize: '12px', marginBottom: '4px', display: 'block' }}>标签筛选</label>
              <select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                style={{ ...inputStyle, width: '100%' }}
              >
                <option value="">所有标签</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <span style={{ color: '#888', fontSize: '14px' }}>
            共 {filteredProblems.length} 道题目
          </span>
          <button
            onClick={loadProblems}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            🔄 刷新列表
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#888' }}>
            加载中...
          </div>
        ) : filteredProblems.length === 0 ? (
          <div style={{
            background: '#1e1e1e',
            borderRadius: '12px',
            padding: '64px 24px',
            textAlign: 'center',
            border: '1px dashed #333',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>暂无题目</h3>
            <p style={{ color: '#888', margin: '0 0 24px 0' }}>
              {searchQuery || selectedDifficulty !== 'all' || selectedTag
                ? '没有找到匹配的题目，请调整筛选条件'
                : '点击右上角按钮创建您的第一道题目'}
            </p>
            {!searchQuery && selectedDifficulty === 'all' && !selectedTag && (
              <button
                onClick={handleCreateProblem}
                style={{
                  padding: '12px 32px',
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}>
                创建题目
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredProblems.map((problem) => {
              const diffTag = getDifficultyTag(problem.difficulty);
              return (
                <div
                  key={problem.id}
                  style={{
                    background: '#1e1e1e',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    border: '1px solid #333',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>{problem.title}</h3>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          background: diffTag.bgColor,
                          color: diffTag.color,
                        }}>
                          {diffTag.label}
                        </span>
                      </div>
                      <p style={{ color: '#888', margin: '0 0 12px 0', fontSize: '14px', lineHeight: 1.5 }}>
                        {problem.description.length > 150
                          ? problem.description.substring(0, 150) + '...'
                          : problem.description}
                      </p>
                      {problem.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {problem.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '4px 10px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                borderRadius: '4px',
                                fontSize: '12px',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditProblem(problem)}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteClick(problem.id)}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(244, 67, 54, 0.1)',
                          color: '#f44336',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', color: '#666', fontSize: '12px' }}>
                    <span>⏱ {problem.timeLimit}ms</span>
                    <span>💾 {problem.memoryLimit}MB</span>
                    <span>📊 {problem.testCases.length} 个测试用例</span>
                    {problem.createdAt && (
                      <span>创建于 {new Date(problem.createdAt).toLocaleDateString('zh-CN')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '24px', width: '400px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', margin: '0 0 12px 0' }}>确认删除</h3>
            <p style={{ color: '#888', margin: '0 0 24px 0' }}>
              确定要删除这道题目吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '10px 24px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '14px' }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ padding: '10px 24px', borderRadius: '4px', border: 'none', background: '#f44336', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      <ProblemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        editingProblem={editingProblem}
      />
    </div>
  );
};
