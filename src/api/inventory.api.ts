import apiClient from './client';
import type { Inventory, CreateInventoryItemDTO, UpdateInventoryItemDTO, InventoryStats, LowStockAlert } from '@/types';

export const inventoryApi = {
  create: (data: CreateInventoryItemDTO) => apiClient.post<Inventory>('/inventory', data),

  list: (category?: string) => apiClient.get<Inventory[]>('/inventory', { params: { category } }),

  get: (id: number) => apiClient.get<Inventory>(`/inventory/${id}`),

  update: (id: number, data: UpdateInventoryItemDTO) => apiClient.put<Inventory>(`/inventory/${id}`, data),

  delete: (id: number) => apiClient.delete(`/inventory/${id}`),

  getStats: () => apiClient.get<InventoryStats>('/inventory/stats'),

  getLowStockAlerts: () => apiClient.get<LowStockAlert[]>('/inventory/alerts'),
};