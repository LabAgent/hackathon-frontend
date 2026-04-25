import apiClient from './client';
import type { Project, CreateProjectDTO, UpdateProjectDTO, ExperimentsLog, CreateExperimentLogDTO, ProjectRequirement, CreateProjectRequirementDTO, ProjectStats } from '@/types';

export const researchApi = {
  create: (data: CreateProjectDTO) => apiClient.post<Project>('/projects', data),

  list: () => apiClient.get<Project[]>('/projects'),

  get: (id: number) => apiClient.get<Project>(`/projects/${id}`),

  update: (id: number, data: UpdateProjectDTO) => apiClient.put<Project>(`/projects/${id}`, data),

  delete: (id: number) => apiClient.delete(`/projects/${id}`),

  getStats: () => apiClient.get<ProjectStats>('/projects/stats'),

  addExperimentLog: (projectId: number, data: CreateExperimentLogDTO) =>
    apiClient.post<ExperimentsLog>(`/projects/${projectId}/experiments`, data),

  addRequirement: (data: CreateProjectRequirementDTO) =>
    apiClient.post<ProjectRequirement>('/projects/requirements', data),
};