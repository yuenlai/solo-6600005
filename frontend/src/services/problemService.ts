import { request } from './api';
import type { Problem, CreateProblemRequest, UpdateProblemRequest } from '../types';

export interface ProblemListParams {
  difficulty?: string;
  tag?: string;
}

export function getProblems(params?: ProblemListParams): Promise<Problem[]> {
  const queryParams = new URLSearchParams();
  if (params?.difficulty) {
    queryParams.append('difficulty', params.difficulty);
  }
  if (params?.tag) {
    queryParams.append('tag', params.tag);
  }
  const queryString = queryParams.toString();
  return request<Problem[]>(`/problems${queryString ? `?${queryString}` : ''}`);
}

export function getProblemById(id: string): Promise<Problem> {
  return request<Problem>(`/problems/${id}`);
}

export function createProblem(data: CreateProblemRequest): Promise<Problem> {
  const payload = {
    ...data,
    examples: JSON.stringify(data.examples),
    testCases: JSON.stringify(data.testCases),
    tags: JSON.stringify(data.tags),
  };
  return request<Problem>('/problems', {
    method: 'POST',
    body: payload,
  });
}

export function updateProblem(id: string, data: UpdateProblemRequest): Promise<Problem> {
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
  return request<Problem>(`/problems/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteProblem(id: string): Promise<void> {
  return request<void>(`/problems/${id}`, {
    method: 'DELETE',
  });
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
