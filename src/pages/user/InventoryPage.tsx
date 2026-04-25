import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, Search, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Button, Input, Spinner } from '@/components/ui';
import { inventoryApi } from '@/api';
import type { Inventory } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'specimen', label: 'Specimen' },
  { value: 'tool', label: 'Tool' },
  { value: 'other', label: 'Other' },
];

export default function InventoryPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [form, setForm] = useState({ name: '', category: 'other', quantity: '0', unit: 'units', minRequired: '5' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', category],
    queryFn: () => inventoryApi.list(category || undefined),
  });
  const { data: alertsData } = useQuery({ queryKey: ['low-stock'], queryFn: () => inventoryApi.getLowStockAlerts() });

  const createMutation = useMutation({
    mutationFn: (d: any) => inventoryApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setShowCreate(false); setForm({ name: '', category: 'other', quantity: '0', unit: 'units', minRequired: '5' }); },
  });

  const items: Inventory[] = (data as any)?.data || [];
  const alerts: any[] = (alertsData as any)?.data || [];
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-7 w-7 text-sandy-500" />
          Lab Inventory
        </h1>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-coral-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-coral-700 text-sm">{alerts.length} items below minimum required</p>
            <p className="text-coral-600 text-xs mt-1">{alerts.slice(0, 3).map((a: any) => a.name).join(', ')}{alerts.length > 3 ? ` and ${alerts.length - 3} more` : ''}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search items..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Item name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
              <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input placeholder="Qty" type="number" value={form.quantity} onChange={(e: any) => setForm({ ...form, quantity: e.target.value })} />
              <Input placeholder="Unit" value={form.unit} onChange={(e: any) => setForm({ ...form, unit: e.target.value })} />
              <Input placeholder="Min required" type="number" value={form.minRequired} onChange={(e: any) => setForm({ ...form, minRequired: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ ...form, quantity: Number(form.quantity), minRequired: Number(form.minRequired) })} loading={createMutation.isPending}>Add Item</Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-medium text-gray-500">Name</th>
                <th className="pb-3 font-medium text-gray-500">Category</th>
                <th className="pb-3 font-medium text-gray-500">Stock</th>
                <th className="pb-3 font-medium text-gray-500">Min Required</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isLow = item.quantity <= item.minRequired;
                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 text-gray-500 capitalize">{item.category || '-'}</td>
                    <td className={`py-3 font-medium ${isLow ? 'text-coral-500' : 'text-gray-900'}`}>{item.quantity} {item.unit || ''}</td>
                    <td className="py-3 text-gray-500">{item.minRequired}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLow ? 'bg-coral-50 text-coral-600' : 'bg-kelp-50 text-kelp-600'}`}>
                        {isLow ? 'LOW' : 'OK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-gray-400 text-center py-12">No items found</p>}
        </div>
      )}
    </div>
  );
}