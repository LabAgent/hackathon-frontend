export interface Inventory {
  id: number;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  minRequired: number;
  location: string | null;
  description: string | null;
  lastUpdated: string;
}

export interface CreateInventoryItemDTO {
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minRequired?: number;
  location?: string;
  description?: string;
}

export interface UpdateInventoryItemDTO {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minRequired?: number;
  location?: string;
  description?: string;
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
