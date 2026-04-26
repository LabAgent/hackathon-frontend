import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, Button, Input, Spinner } from '@/components/ui';
import { inventoryApi } from '@/api';
import type { Inventory } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All', emoji: '📂' },
  { value: 'chemical', label: 'Chemical', emoji: '🧫' },
  { value: 'equipment', label: 'Equipment', emoji: '⚙️' },
  { value: 'specimen', label: 'Specimen', emoji: '🦠' },
  { value: 'tool', label: 'Tool', emoji: '🔧' },
  { value: 'other', label: 'Other', emoji: '📦' },
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-white font-[var(--font-display)] flex items-center gap-3">
          <span className="text-4xl">📦</span>
          Mr. Krabs' Vault
        </h1>
        <Button onClick={() => setShowCreate(true)} variant="sponge" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> 🦀 Add Item
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="bg-krabs-400/10 border-2 border-krabs-400/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-krabs-300 text-sm">{alerts.length} items below minimum required!</p>
            <p className="text-krabs-200/80 text-xs mt-1">{alerts.slice(0, 3).map((a: any) => a.name).join(', ')}{alerts.length > 3 ? ` and ${alerts.length - 3} more` : ''}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
          <Input placeholder="Search the vault..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-11" />
        </div>
        <select
          className="rounded-xl border-2 border-ocean-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sponge-400 bg-white/90 font-semibold"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Item name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
              <select className="rounded-xl border-2 border-ocean-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sponge-400" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input placeholder="Qty" type="number" value={form.quantity} onChange={(e: any) => setForm({ ...form, quantity: e.target.value })} />
              <Input placeholder="Unit" value={form.unit} onChange={(e: any) => setForm({ ...form, unit: e.target.value })} />
              <Input placeholder="Min required" type="number" value={form.minRequired} onChange={(e: any) => setForm({ ...form, minRequired: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ ...form, quantity: Number(form.quantity), minRequired: Number(form.minRequired) })} loading={createMutation.isPending} variant="sponge">🦀 Add Item</Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ocean-100 text-left">
                  <th className="pb-3 font-bold text-ocean-500 px-4">Name</th>
                  <th className="pb-3 font-bold text-ocean-500 px-4">Category</th>
                  <th className="pb-3 font-bold text-ocean-500 px-4">Stock</th>
                  <th className="pb-3 font-bold text-ocean-500 px-4">Min Required</th>
                  <th className="pb-3 font-bold text-ocean-500 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.minRequired;
                  return (
                    <tr key={item.id} className="border-b border-ocean-50 hover:bg-ocean-50/30 transition-colors">
                      <td className="py-3 font-bold text-ocean-800 px-4">{item.name}</td>
                      <td className="py-3 text-ocean-500 capitalize px-4">{item.category || '-'}</td>
                      <td className={`py-3 font-bold px-4 ${isLow ? 'text-krabs-400' : 'text-ocean-800'}`}>{item.quantity} {item.unit || ''}</td>
                      <td className="py-3 text-ocean-500 px-4">{item.minRequired}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isLow ? 'bg-krabs-50 text-krabs-500' : 'bg-kelp-50 text-kelp-600'}`}>
                          {isLow ? '⚠️ LOW' : '✅ OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-ocean-400 text-center py-12 font-medium">📦 No items found in the vault</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
