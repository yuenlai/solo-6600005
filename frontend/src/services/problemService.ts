import { request } from './api';
import type { Problem, CreateProblemRequest, UpdateProblemRequest } from '../types';
import {
  mockGetProblems,
  mockGetProblemById,
  mockCreateProblem,
  mockUpdateProblem,
  mockDeleteProblem,
} from './mockProblemService';

export interface ProblemListParams {
  difficulty?: string;
  tag?: string;
}

let useMockFallback = false;

const setUseMockFallback = (value: boolean) => {
  useMockFallback = value;
  if (value) {
    console.warn('⚠️ 后端服务不可用，已切换到 Mock 数据模式。数据将保存在浏览器本地存储中。');
  }
};

export const isUsingMockData = () => useMockFallback;

const handleApiError = (error: any) => {
  if (error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ECONNREFUSED') ||
      error.status === 0) {
    setUseMockFallback(true);
    return true;
  }
  return false;
};

export async function getProblems(params?: ProblemListParams): Promise<Problem[]> {
  if (useMockFallback) {
    return mockGetProblems(params);
  }
  try {
    const queryParams = new URLSearchParams();
    if (params?.difficulty) {
      queryParams.append('difficulty', params.difficulty);
    }
    if (params?.tag) {
      queryParams.append('tag', params.tag);
    }
    const queryString = queryParams.toString();
    const response = await request<any[]>(`/problems${queryString ? `?${queryString}` : ''}`);
    return parseProblemListResponse(response);
  } catch (error: any) {
    if (handleApiError(error)) {
      return mockGetProblems(params);
    }
    throw error;
  }
}

export async function getProblemById(id: string): Promise<Problem> {
  if (useMockFallback) {
    return mockGetProblemById(id);
  }
  try {
    const response = await request<any>(`/problems/${id}`);
    return parseProblemResponse(response);
  } catch (error: any) {
    if (handleApiError(error)) {
      return mockGetProblemById(id);
    }
    throw error;
  }
}

export async function createProblem(data: CreateProblemRequest): Promise<Problem> {
  if (useMockFallback) {
    return mockCreateProblem(data);
  }
  try {
    const payload = {
      ...data,
      examples: JSON.stringify(data.examples),
      testCases: JSON.stringify(data.testCases),
      tags: JSON.stringify(data.tags),
    };
    const response = await request<any>('/problems', {
      method: 'POST',
      body: payload,
    });
    return parseProblemResponse(response);
  } catch (error: any) {
    if (handleApiError(error)) {
      return mockCreateProblem(data);
    }
    throw error;
  }
}

export async function updateProblem(id: string, data: UpdateProblemRequest): Promise<Problem> {
  if (useMockFallback) {
    return mockUpdateProblem(id, data);
  }
  try {
    const payload: Record<string, any> = { ...data };
    if (data.examples) {
      payload.examples = JSON.stringify(data.examples);
    }
    if (data.testCases) {
      payload.testCases = JSON.stringify(data.testCases);
    }
    if (data.tags) {
      payload.tags = JSON.stringify(data.tags);
    }
    delete payload.id;
    const response = await request<any>(`/problems/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return parseProblemResponse(response);
  } catch (error: any) {
    if (handleApiError(error)) {
      return mockUpdateProblem(id, data);
    }
    throw error;
  }
}

export async function deleteProblem(id: string): Promise<void> {
  if (useMockFallback) {
    return mockDeleteProblem(id);
  }
  try {
    return await request<void>(`/problems/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    if (handleApiError(error)) {
      return mockDeleteProblem(id);
    }
    throw error;
  }
}

export function parseProblemResponse(problem: any): Problem {
  return {
    ...problem,
    examples: problem.examples ? JSON.parse(problem.examples) : [],
    testCases: problem.testCases ? JSON.parse(problem.testCases) : [],
    tags: problem.tags ? JSON.parse(problem.tags) : [],
  };
}

export function parseProblemListResponse(problems: any[]): Problem[] {
  return problems.map(parseProblemResponse);
}
