import apiClient from './client';
import type { Project, CreateProjectDTO, UpdateProjectDTO, ExperimentsLog, CreateExperimentLogDTO, UpdateExperimentLogDTO, ProjectRequirement, CreateProjectRequirementDTO, UpdateProjectRequirementDTO, ProjectStats } from '@/types';

export const researchApi = {
  create: (data: CreateProjectDTO) => apiClient.post<Project>('/projects', data),

  list: () => apiClient.get<Project[]>('/projects'),

  get: (id: number) => apiClient.get<Project>(`/projects/${id}`),

  update: (id: number, data: UpdateProjectDTO) => apiClient.put<Project>(`/projects/${id}`, data),

  delete: (id: number) => apiClient.delete(`/projects/${id}`),

  getStats: () => apiClient.get<ProjectStats>('/projects/stats'),

  addExperimentLog: (projectId: number, data: CreateExperimentLogDTO) =>
    apiClient.post<ExperimentsLog>(`/projects/${projectId}/experiments`, data),

  updateExperimentLog: (expId: number, data: UpdateExperimentLogDTO) =>
    apiClient.put<ExperimentsLog>(`/projects/experiments/${expId}`, data),

  deleteExperimentLog: (expId: number) =>
    apiClient.delete(`/projects/experiments/${expId}`),

  addRequirement: (data: CreateProjectRequirementDTO) =>
    apiClient.post<ProjectRequirement>('/projects/requirements', data),

  updateRequirement: (reqId: number, data: UpdateProjectRequirementDTO) =>
    apiClient.put<ProjectRequirement>(`/projects/requirements/${reqId}`, data),

  deleteRequirement: (reqId: number) =>
    apiClient.delete(`/projects/requirements/${reqId}`),
};
