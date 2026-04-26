import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, Button, Input, Spinner } from '@/components/ui';
import { researchApi } from '@/api';
import type { Project } from '@/types';

export default function ResearchPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => researchApi.list() });
  const createMutation = useMutation({
    mutationFn: (d: { name: string; description?: string }) => researchApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setShowCreate(false); setNewName(''); setNewDesc(''); },
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
              className="w-full rounded-xl border-2 border-ocean-200 p-3 text-sm focus:outline-none focus:border-sponge-400 bg-white/90 transition-all"
              rows={3}
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ name: newName, description: newName || undefined })} loading={createMutation.isPending} variant="sponge">Create</Button>
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Link key={r.id} to={`/research/${r.id}`}>
              <div className="group bg-white/90 backdrop-blur-xl rounded-2xl p-5 border-2 border-white/40 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full">
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
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-ocean-400 col-span-full text-center py-12 font-medium">🔬 No projects found — start a new experiment!</p>
          )}
        </div>
      )}
    </div>
  );
}
