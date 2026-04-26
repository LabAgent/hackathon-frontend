import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Spinner, Modal } from '@/components/ui';
import { researchApi } from '@/api';
import type { Project, ProjectStatus } from '@/types';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

export default function ResearchPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState<ProjectStatus>('planned');
  const [newPriority, setNewPriority] = useState('1');
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('planned');
  const [editPriority, setEditPriority] = useState('1');
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => researchApi.list() });
  const createMutation = useMutation({
    mutationFn: (d: { name: string; description?: string; status?: ProjectStatus; priority?: number }) => researchApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setShowCreate(false); setNewName(''); setNewDesc(''); setNewStatus('planned'); setNewPriority('1'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => researchApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setEditProject(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => researchApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setDeleteProject(null); },
  });

  const projects: Project[] = (data as any)?.data || [];
  const filtered = projects.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => {
    switch (s) {
      case 'ongoing': return 'bg-kelp-50 text-kelp-600 border-kelp-200';
      case 'completed': return 'bg-ocean-50 text-ocean-600 border-ocean-200';
      case 'planned': return 'bg-sponge-50 text-sponge-700 border-sponge-200';
      default: return 'bg-ocean-50 text-ocean-600 border-ocean-200';
    }
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setEditName(p.name);
    setEditDesc(p.description || '');
    setEditStatus(p.status);
    setEditPriority(String(p.priority));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-white font-[var(--font-display)] flex items-center gap-3">
          <span className="text-4xl">🔬</span>
          Research Projects
        </h1>
        <Button onClick={() => setShowCreate(true)} variant="sponge" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> 🧪 New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
        <Input
          placeholder="Search experiments..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          className="pl-11"
        />
      </div>

      {showCreate && (
        <Card>
          <CardContent className="space-y-4">
            <Input placeholder="Project name" value={newName} onChange={(e: any) => setNewName(e.target.value)} />
            <textarea
              className="w-full rounded-xl border-2 border-bb-sand-dark/40 p-3 text-sm focus:outline-none focus:border-bb-pineapple bg-white/90 transition-all"
              rows={3}
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ocean-700">Status</label>
                <select
                  className="block w-full rounded-xl border-2 border-bb-sand-dark/40 px-3 py-2.5 text-sm focus:outline-none focus:border-bb-pineapple"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-ocean-700">Priority</label>
                <Input type="number" min={1} value={newPriority} onChange={(e: any) => setNewPriority(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ name: newName, description: newDesc || undefined, status: newStatus, priority: Number(newPriority) || undefined })} loading={createMutation.isPending} variant="sponge">Create</Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-ocean-700">Project Name</label>
            <Input value={editName} onChange={(e: any) => setEditName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-ocean-700">Description</label>
            <textarea
              className="w-full rounded-xl border-2 border-bb-sand-dark/40 p-3 text-sm focus:outline-none focus:border-bb-pineapple"
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Status</label>
              <select
className="block w-full rounded-xl border-2 border-bb-sand-dark/40 px-3 py-2.5 text-sm focus:outline-none focus:border-bb-pineapple"
                  value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-ocean-700">Priority</label>
              <Input type="number" min={1} value={editPriority} onChange={(e: any) => setEditPriority(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => editProject && updateMutation.mutate({ id: editProject.id, data: { name: editName, description: editDesc || undefined, status: editStatus, priority: Number(editPriority) } })} loading={updateMutation.isPending} variant="sponge">Save</Button>
            <Button variant="secondary" onClick={() => setEditProject(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteProject} onClose={() => setDeleteProject(null)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-ocean-600">Are you sure you want to delete <strong>{deleteProject?.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => deleteProject && deleteMutation.mutate(deleteProject.id)} loading={deleteMutation.isPending}>Delete</Button>
            <Button variant="secondary" onClick={() => setDeleteProject(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="group bg-bb-sand-light/92 backdrop-blur-xl rounded-3xl p-5 border-2 border-bb-sand-dark/30 shadow-warm-lg hover:shadow-warm-xl hover:-translate-y-1 transition-all duration-200 h-full">
              <Link to={`/research/${r.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-ocean-800 text-sm line-clamp-2 font-[var(--font-display)]">{r.name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ml-2 border ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </div>
                {r.description && <p className="text-ocean-400 text-xs line-clamp-2 mb-3">{r.description}</p>}
                <div className="flex items-center gap-3 text-xs text-ocean-400 font-medium">
                  <span>🎯 {r.priority}</span>
                  <span>🧪 {r.experiments?.length || 0}</span>
                  <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
              <div className="flex gap-1 mt-3 pt-3 border-t border-ocean-100">
                <Button size="sm" variant="ghost" className="text-ocean-400 hover:text-ocean-600 text-xs px-2 py-1" onClick={(e) => { e.preventDefault(); openEdit(r); }}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-krabs-400 hover:text-krabs-600 text-xs px-2 py-1" onClick={(e) => { e.preventDefault(); setDeleteProject(r); }}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-ocean-400 col-span-full text-center py-12 font-medium">🔬 No projects found — start a new experiment!</p>
          )}
        </div>
      )}
    </div>
  );
}
