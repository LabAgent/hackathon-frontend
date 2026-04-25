import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, FlaskConical, Bot, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner } from '@/components/ui';
import { researchApi, inventoryApi } from '@/api';
import { useState } from 'react';
import type { Project, ExperimentsLog, Inventory } from '@/types';

export default function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showAddExp, setShowAddExp] = useState(false);
  const [expResult, setExpResult] = useState('');
  const [expSuccess, setExpSuccess] = useState(true);
  const [expNotes, setExpNotes] = useState('');
  const [showAddReq, setShowAddReq] = useState(false);
  const [reqItemId, setReqItemId] = useState<number | ''>('');
  const [reqQty, setReqQty] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => researchApi.get(Number(id!)),
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.list(),
  });

  const inventoryItems: Inventory[] = (inventoryData as any)?.data || [];

  const project: Project = (data as any)?.data;
  const addExpMutation = useMutation({
    mutationFn: (d: { result?: string; success?: boolean; notes?: string }) => researchApi.addExperimentLog(Number(id!), d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setShowAddExp(false); setExpResult(''); setExpNotes(''); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => researchApi.update(Number(id!), { status: status as any }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }),
  });

  const addReqMutation = useMutation({
    mutationFn: (d: { projectId: number; inventoryId: number; requiredQuantity: number }) => researchApi.addRequirement(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setShowAddReq(false); setReqItemId(''); setReqQty(1); },
  });

  if (isLoading || !project) return <div className="flex justify-center py-12"><Spinner /></div>;

  const statusColor = (s: string) => {
    switch (s) {
      case 'ongoing': return 'bg-kelp-50 text-kelp-600';
      case 'completed': return 'bg-ocean-50 text-ocean-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/research" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(project.status)}`}>{project.status}</span>
            <span className="text-xs text-gray-400">Priority: {project.priority}</span>
            <span className="text-xs text-gray-400">Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {project.status === 'planned' && (
            <Button size="sm" variant="secondary" onClick={() => updateStatusMutation.mutate('ongoing')}>Start Project</Button>
          )}
          {project.status === 'ongoing' && (
            <Button size="sm" variant="secondary" onClick={() => updateStatusMutation.mutate('completed')}>Complete</Button>
          )}
          <Link to="/assistant">
            <Button size="sm" variant="ghost" className="flex items-center gap-1">
              <Bot className="h-4 w-4" /> Ask AI
            </Button>
          </Link>
        </div>
      </div>

      {project.description && (
        <Card>
          <CardContent><p className="text-gray-600 text-sm">{project.description}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-ocean-500" />
            Experiment Logs ({project.experiments?.length || 0})
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddExp(true)} className="flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Log
          </Button>
        </CardHeader>
        <CardContent>
          {showAddExp && (
            <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <textarea className="w-full rounded-lg border border-gray-300 p-2 text-sm" rows={2} placeholder="Result (optional)" value={expResult} onChange={(e) => setExpResult(e.target.value)} />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Success:</label>
                <input type="checkbox" checked={expSuccess} onChange={(e) => setExpSuccess(e.target.checked)} className="rounded" />
              </div>
              <input className="w-full rounded-lg border border-gray-300 p-2 text-sm" placeholder="Notes (optional)" value={expNotes} onChange={(e) => setExpNotes(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => addExpMutation.mutate({ result: expResult || undefined, success: expSuccess, notes: expNotes || undefined })} loading={addExpMutation.isPending}>Add Log</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddExp(false)}>Cancel</Button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {(project.experiments || []).map((exp: ExperimentsLog) => (
              <div key={exp.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{exp.result || 'No result recorded'}</p>
                  {exp.notes && <p className="text-xs text-gray-500 mt-0.5">{exp.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${exp.success ? 'bg-kelp-50 text-kelp-600' : exp.success === false ? 'bg-coral-50 text-coral-600' : 'bg-gray-50 text-gray-600'}`}>
                    {exp.success === true ? 'Success' : exp.success === false ? 'Failed' : 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(exp.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {(!project.experiments || project.experiments.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-6">No experiment logs yet. Add one to get started.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-sandy-500" />
            Required Materials ({project.requirements?.length || 0})
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddReq(true)} className="flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Requirement
          </Button>
        </CardHeader>
        <CardContent>
          {showAddReq && (
            <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Inventory Item</label>
                <select
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={reqItemId}
                  onChange={(e) => setReqItemId(Number(e.target.value))}
                >
                  <option value="">Select an item...</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity} {item.unit || 'units'})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Required Quantity</label>
                <input
                  type="number"
                  min={1}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={reqQty}
                  onChange={(e) => setReqQty(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => addReqMutation.mutate({ projectId: Number(id!), inventoryId: Number(reqItemId), requiredQuantity: reqQty })} loading={addReqMutation.isPending} disabled={!reqItemId}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddReq(false)}>Cancel</Button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {(project.requirements || []).map((req) => (
              <div key={req.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{req.inventory?.name || `Item #${req.inventoryId}`}</p>
                  <p className="text-xs text-gray-500">Required: {req.requiredQuantity} units</p>
                </div>
                {req.inventory && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.inventory.quantity >= req.requiredQuantity ? 'bg-kelp-50 text-kelp-600' : 'bg-coral-50 text-coral-600'}`}>
                    {req.inventory.quantity >= req.requiredQuantity ? 'In Stock' : `Short by ${req.requiredQuantity - req.inventory.quantity}`}
                  </span>
                )}
              </div>
            ))}
            {(!project.requirements || project.requirements.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-6">No material requirements yet. Add items needed for this project.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}