export type ProjectStatus = 'planned' | 'ongoing' | 'completed';

export type ExperimentStatus = 'planned' | 'in_progress' | 'completed' | 'failed';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: number;
  createdAt: string;
  experiments?: ExperimentsLog[];
  requirements?: ProjectRequirement[];
}

export interface ExperimentsLog {
  id: number;
  projectId: number | null;
  result: string | null;
  success: boolean | null;
  notes: string | null;
  hypothesis: string | null;
  methodology: string | null;
  status: string | null;
  createdAt: string;
}

export interface ProjectRequirement {
  id: number;
  projectId: number;
  inventoryId: number;
  requiredQuantity: number;
  inventory?: import('./inventory.types').Inventory;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: number;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: number;
}

export interface CreateExperimentLogDTO {
  result?: string;
  success?: boolean;
  notes?: string;
  hypothesis?: string;
  methodology?: string;
  status?: ExperimentStatus;
}

export interface UpdateExperimentLogDTO {
  result?: string;
  success?: boolean;
  notes?: string;
  hypothesis?: string;
  methodology?: string;
  status?: ExperimentStatus;
}

export interface CreateProjectRequirementDTO {
  projectId: number;
  inventoryId: number;
  requiredQuantity: number;
}

export interface UpdateProjectRequirementDTO {
  inventoryId?: number;
  requiredQuantity?: number;
}

export interface ProjectStats {
  total: number;
  ongoing: number;
  completed: number;
  planned: number;
}
