export interface Inventory {
  id: number;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  minRequired: number;
  lastUpdated: string;
}

export interface CreateInventoryItemDTO {
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minRequired?: number;
}

export interface UpdateInventoryItemDTO {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minRequired?: number;
  reason?: string;
}

export interface InventoryStats {
  total: number;
  lowStock: number;
  categoryBreakdown: { category: string; count: string }[];
}

export interface LowStockAlert {
  id: number;
  name: string;
  category: string | null;
  quantity: number;
  minRequired: number;
  deficit: number;
}