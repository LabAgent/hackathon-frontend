import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Spinner, Modal } from '@/components/ui';
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

const emptyForm = { name: '', category: 'other', quantity: '0', unit: 'units', minRequired: '5', location: '', description: '' };

export default function InventoryPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editItem, setEditItem] = useState<Inventory | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editReason, setEditReason] = useState('');
  const [deleteItem, setDeleteItem] = useState<Inventory | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', category],
    queryFn: () => inventoryApi.list(category || undefined),
  });
  const { data: alertsData } = useQuery({ queryKey: ['low-stock'], queryFn: () => inventoryApi.getLowStockAlerts() });

  const createMutation = useMutation({
    mutationFn: (d: any) => inventoryApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setShowCreate(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => inventoryApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setDeleteItem(null); },
  });

  const items: Inventory[] = (data as any)?.data || [];
  const alerts: any[] = (alertsData as any)?.data || [];
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (item: Inventory) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      category: item.category || 'other',
      quantity: String(item.quantity),
      unit: item.unit || '',
      minRequired: String(item.minRequired),
      location: item.location || '',
      description: item.description || '',
    });
    setEditReason('');
  };

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
              <Input placeholder="Location" value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value })} />
            </div>
            <textarea
              className="w-full rounded-xl border-2 border-ocean-200 p-3 text-sm focus:outline-none focus:border-sponge-400 bg-white/90"
              rows={2}
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ ...form, quantity: Number(form.quantity), minRequired: Number(form.minRequired), location: form.location || undefined, description: form.description || undefined })} loading={createMutation.isPending} variant="sponge">🦀 Add Item</Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Item">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Name</label>
              <Input value={editForm.name} onChange={(e: any) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Category</label>
              <select className="block w-full rounded-xl border-2 border-ocean-200 px-3 py-2.5 text-sm focus:outline-none focus:border-sponge-400" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Qty</label>
              <Input type="number" value={editForm.quantity} onChange={(e: any) => setEditForm({ ...editForm, quantity: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Unit</label>
              <Input value={editForm.unit} onChange={(e: any) => setEditForm({ ...editForm, unit: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Min Req</label>
              <Input type="number" value={editForm.minRequired} onChange={(e: any) => setEditForm({ ...editForm, minRequired: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Location</label>
              <Input value={editForm.location} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-ocean-700">Description</label>
            <textarea
              className="w-full rounded-xl border-2 border-ocean-200 p-3 text-sm focus:outline-none focus:border-sponge-400"
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-ocean-700">Reason for change</label>
            <Input placeholder="Optional reason" value={editReason} onChange={(e: any) => setEditReason(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => editItem && updateMutation.mutate({ id: editItem.id, data: { ...editForm, quantity: Number(editForm.quantity), minRequired: Number(editForm.minRequired), reason: editReason || undefined, location: editForm.location || undefined, description: editForm.description || undefined } })} loading={updateMutation.isPending} variant="sponge">Save</Button>
            <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Item">
        <div className="space-y-4">
          <p className="text-sm text-ocean-600">Are you sure you want to delete <strong>{deleteItem?.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending}>Delete</Button>
            <Button variant="secondary" onClick={() => setDeleteItem(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

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
                  <th className="pb-3 font-bold text-ocean-500 px-4">Location</th>
                  <th className="pb-3 font-bold text-ocean-500 px-4">Status</th>
                  <th className="pb-3 font-bold text-ocean-500 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.minRequired;
                  return (
                    <tr key={item.id} className="border-b border-ocean-50 hover:bg-ocean-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-ocean-800">{item.name}</p>
                          {item.description && <p className="text-xs text-ocean-400 mt-0.5">{item.description}</p>}
                        </div>
                      </td>
                      <td className="py-3 text-ocean-500 capitalize px-4">{item.category || '-'}</td>
                      <td className={`py-3 font-bold px-4 ${isLow ? 'text-krabs-400' : 'text-ocean-800'}`}>{item.quantity} {item.unit || ''}</td>
                      <td className="py-3 text-ocean-500 px-4">{item.minRequired}</td>
                      <td className="py-3 text-ocean-500 px-4">{item.location || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isLow ? 'bg-krabs-50 text-krabs-500' : 'bg-kelp-50 text-kelp-600'}`}>
                          {isLow ? '⚠️ LOW' : '✅ OK'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-ocean-400 hover:text-ocean-600 text-xs px-2 py-1" onClick={() => openEdit(item)}>
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-krabs-400 hover:text-krabs-600 text-xs px-2 py-1" onClick={() => setDeleteItem(item)}>
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
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
