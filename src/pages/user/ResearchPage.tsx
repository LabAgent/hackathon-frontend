import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Plus, Beaker, Search } from 'lucide-react';
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
      case 'ongoing': return 'bg-kelp-50 text-kelp-600';
      case 'completed': return 'bg-ocean-50 text-ocean-600';
      case 'planned': return 'bg-sandy-50 text-sandy-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Beaker className="h-7 w-7 text-ocean-500" />
          Research Projects
        </h1>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {showCreate && (
        <Card>
          <CardContent className="space-y-4">
            <Input placeholder="Project name" value={newName} onChange={(e: any) => setNewName(e.target.value)} />
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
              rows={3}
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ name: newName, description: newName || undefined })} loading={createMutation.isPending}>Create</Button>
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
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{r.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2 ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  {r.description && <p className="text-gray-500 text-xs line-clamp-2 mb-3">{r.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Priority: {r.priority}</span>
                    <span>{r.experiments?.length || 0} experiments</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-400 col-span-full text-center py-12">No projects found</p>
          )}
        </div>
      )}
    </div>
  );
}