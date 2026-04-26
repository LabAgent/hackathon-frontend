import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Spinner, Modal, Input } from '@/components/ui';
import { researchApi, inventoryApi } from '@/api';
import { useState } from 'react';
import type { Project, ExperimentsLog, Inventory, ProjectStatus, ExperimentStatus, ProjectRequirement } from '@/types';

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

const EXPERIMENT_STATUS_OPTIONS: { value: ExperimentStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const inputCls = 'wooden-input w-full px-3 py-2.5 text-sm transition-colors';
const labelCls = 'block text-sm font-semibold text-bb-brown-light mb-1';

export default function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [showAddExp, setShowAddExp] = useState(false);
  const [expResult, setExpResult] = useState('');
  const [expSuccess, setExpSuccess] = useState(true);
  const [expNotes, setExpNotes] = useState('');
  const [expHypothesis, setExpHypothesis] = useState('');
  const [expMethodology, setExpMethodology] = useState('');
  const [expStatus, setExpStatus] = useState<ExperimentStatus>('planned');

  const [editExp, setEditExp] = useState<ExperimentsLog | null>(null);
  const [editExpResult, setEditExpResult] = useState('');
  const [editExpSuccess, setEditExpSuccess] = useState(false);
  const [editExpNotes, setEditExpNotes] = useState('');
  const [editExpHypothesis, setEditExpHypothesis] = useState('');
  const [editExpMethodology, setEditExpMethodology] = useState('');
  const [editExpStatus, setEditExpStatus] = useState<ExperimentStatus>('planned');
  const [deleteExp, setDeleteExp] = useState<ExperimentsLog | null>(null);

  const [showAddReq, setShowAddReq] = useState(false);
  const [reqItemId, setReqItemId] = useState<number | ''>('');
  const [reqQty, setReqQty] = useState(1);

  const [editReq, setEditReq] = useState<ProjectRequirement | null>(null);
  const [editReqItemId, setEditReqItemId] = useState<number>(0);
  const [editReqQty, setEditReqQty] = useState(1);
  const [deleteReq, setDeleteReq] = useState<ProjectRequirement | null>(null);

  const [editProject, setEditProject] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('planned');
  const [editPriority, setEditPriority] = useState('1');

  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
    mutationFn: (d: any) => researchApi.addExperimentLog(Number(id!), d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setShowAddExp(false); setExpResult(''); setExpNotes(''); setExpHypothesis(''); setExpMethodology(''); setExpStatus('planned'); },
  });

  const updateExpMutation = useMutation({
    mutationFn: ({ expId, data }: { expId: number; data: any }) => researchApi.updateExperimentLog(expId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setEditExp(null); },
  });

  const deleteExpMutation = useMutation({
    mutationFn: (expId: number) => researchApi.deleteExperimentLog(expId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setDeleteExp(null); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => researchApi.update(Number(id!), { status: status as any }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (d: any) => researchApi.update(Number(id!), d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setEditProject(false); },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => researchApi.delete(Number(id!)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); },
  });

  const addReqMutation = useMutation({
    mutationFn: (d: { projectId: number; inventoryId: number; requiredQuantity: number }) => researchApi.addRequirement(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setShowAddReq(false); setReqItemId(''); setReqQty(1); },
  });

  const updateReqMutation = useMutation({
    mutationFn: ({ reqId, data }: { reqId: number; data: any }) => researchApi.updateRequirement(reqId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setEditReq(null); },
  });

  const deleteReqMutation = useMutation({
    mutationFn: (reqId: number) => researchApi.deleteRequirement(reqId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', id] }); setDeleteReq(null); },
  });

  if (isLoading || !project) return <div className="flex justify-center py-12"><Spinner /></div>;

  if (deleteProjectMutation.isSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-ocean-300 text-lg">Project deleted successfully.</p>
        <Link to="/research"><Button variant="sponge">Back to Projects</Button></Link>
      </div>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'ongoing': return 'bg-kelp-50 text-kelp-600';
      case 'completed': return 'bg-ocean-50 text-ocean-600';
      default: return 'bg-sponge-50 text-sponge-700';
    }
  };

  const expStatusColor = (s: string | null) => {
    switch (s) {
      case 'completed': return 'bg-kelp-50 text-kelp-600';
      case 'in_progress': return 'bg-ocean-50 text-ocean-600';
      case 'failed': return 'bg-krabs-50 text-krabs-500';
      default: return 'bg-sponge-50 text-sponge-700';
    }
  };

  const openEditProject = () => {
    setEditName(project.name);
    setEditDesc(project.description || '');
    setEditStatus(project.status);
    setEditPriority(String(project.priority));
    setEditProject(true);
  };

  const openEditExp = (exp: ExperimentsLog) => {
    setEditExp(exp);
    setEditExpResult(exp.result || '');
    setEditExpSuccess(exp.success ?? false);
    setEditExpNotes(exp.notes || '');
    setEditExpHypothesis(exp.hypothesis || '');
    setEditExpMethodology(exp.methodology || '');
    setEditExpStatus((exp.status as ExperimentStatus) || 'planned');
  };

  const openEditReq = (req: ProjectRequirement) => {
    setEditReq(req);
    setEditReqItemId(req.inventoryId);
    setEditReqQty(req.requiredQuantity);
  };

  const resetExpForm = () => {
    setShowAddExp(false);
    setExpResult(''); setExpNotes(''); setExpHypothesis(''); setExpMethodology(''); setExpStatus('planned'); setExpSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* ====== HEADER ====== */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/research" className="p-2 text-ocean-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white font-[var(--font-display)]">{project.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${statusColor(project.status)}`}>{project.status}</span>
            <span className="text-xs text-ocean-400">🎯 Priority: {project.priority}</span>
            <span className="text-xs text-ocean-400">📅 {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {project.status === 'planned' && (
            <Button size="sm" variant="ocean" onClick={() => updateStatusMutation.mutate('ongoing')}>▶ Start</Button>
          )}
          {project.status === 'ongoing' && (
            <Button size="sm" variant="ocean" onClick={() => updateStatusMutation.mutate('completed')}>✅ Complete</Button>
          )}
          <Button size="sm" variant="ghost" className="text-ocean-300 hover:bg-ocean-400/10" onClick={openEditProject}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="ghost" className="text-krabs-400 hover:bg-krabs-400/10" onClick={() => setDeleteConfirm(true)}>
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
          <Link to="/assistant">
            <Button size="sm" variant="ghost" className="flex items-center gap-1 text-sponge-300 hover:bg-sponge-400/10">
              🤖 Ask AI
            </Button>
          </Link>
        </div>
      </div>

      {project.description && (
        <Card>
          <CardContent><p className="text-ocean-600 text-sm">{project.description}</p></CardContent>
        </Card>
      )}

      {/* ====== EXPERIMENT LOGS CARD ====== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="emoji-icon">🧪</span>
            Experiment Logs ({project.experiments?.length || 0})
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddExp(true)} variant="sponge" className="flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Log
          </Button>
        </CardHeader>
        <CardContent>
          {showAddExp && (
            <div className="space-y-3 mb-4 p-4 bg-bb-sand-light/40 rounded-xl border-2 border-bb-sand/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={expStatus} onChange={(e) => setExpStatus(e.target.value as ExperimentStatus)}>
                    {EXPERIMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2 pb-0.5">
                  <label className="text-sm font-semibold text-ocean-700">Success:</label>
                  <input type="checkbox" checked={expSuccess} onChange={(e) => setExpSuccess(e.target.checked)} className="h-4 w-4 rounded border-ocean-300 text-ocean-600 focus:ring-ocean-500" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Hypothesis</label>
                <textarea className={inputCls} rows={2} placeholder="Hypothesis (optional)" value={expHypothesis} onChange={(e) => setExpHypothesis(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Methodology</label>
                <textarea className={inputCls} rows={2} placeholder="Methodology (optional)" value={expMethodology} onChange={(e) => setExpMethodology(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Result</label>
                <textarea className={inputCls} rows={2} placeholder="Result (optional)" value={expResult} onChange={(e) => setExpResult(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input className={inputCls} placeholder="Notes (optional)" value={expNotes} onChange={(e) => setExpNotes(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => addExpMutation.mutate({ result: expResult || undefined, success: expSuccess, notes: expNotes || undefined, hypothesis: expHypothesis || undefined, methodology: expMethodology || undefined, status: expStatus || undefined })} loading={addExpMutation.isPending} variant="sponge">Add Log</Button>
                <Button size="sm" variant="ghost" onClick={resetExpForm}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(project.experiments || []).map((exp: ExperimentsLog) => (
              <div key={exp.id} className="flex items-start justify-between py-3 border-b border-bb-sand/30 last:border-0 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${expStatusColor(exp.status || 'planned')}`}>
                      {exp.status || 'planned'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${exp.success ? 'bg-kelp-50 text-kelp-600' : exp.success === false ? 'bg-krabs-50 text-krabs-500' : 'bg-ocean-50 text-ocean-600'}`}>
                      {exp.success === true ? '✅ Success' : exp.success === false ? '❌ Failed' : '❓ Unknown'}
                    </span>
                    <span className="text-xs text-ocean-400">{new Date(exp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-bold text-sm text-ocean-800">{exp.result || 'No result recorded'}</p>
                  {exp.hypothesis && <p className="text-xs text-ocean-500 mt-1 italic">💡 Hypothesis: {exp.hypothesis}</p>}
                  {exp.methodology && <p className="text-xs text-ocean-500 mt-0.5">🔬 Method: {exp.methodology}</p>}
                  {exp.notes && <p className="text-xs text-ocean-400 mt-0.5">📝 {exp.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="text-ocean-400 hover:text-ocean-600 hover:bg-ocean-50 text-xs px-2 py-1" onClick={() => openEditExp(exp)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-krabs-400 hover:text-krabs-600 hover:bg-krabs-50 text-xs px-2 py-1" onClick={() => setDeleteExp(exp)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
            {(!project.experiments || project.experiments.length === 0) && (
              <p className="text-ocean-400 text-sm text-center py-6">🧪 No experiment logs yet. Add one to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====== REQUIRED MATERIALS CARD ====== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="emoji-icon">📦</span>
            Required Materials ({project.requirements?.length || 0})
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddReq(true)} variant="sponge" className="flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add Requirement
          </Button>
        </CardHeader>
        <CardContent>
          {showAddReq && (
            <div className="space-y-3 mb-4 p-4 bg-bb-sand-light/40 rounded-xl border-2 border-bb-sand/30">
              <div>
                <label className={labelCls}>Inventory Item</label>
                <select className={inputCls} value={reqItemId} onChange={(e) => setReqItemId(Number(e.target.value))}>
                  <option value="">Select an item...</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity} {item.unit || 'units'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Required Quantity</label>
                <input type="number" min={1} className={inputCls} value={reqQty} onChange={(e) => setReqQty(Number(e.target.value))} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => addReqMutation.mutate({ projectId: Number(id!), inventoryId: Number(reqItemId), requiredQuantity: reqQty })} loading={addReqMutation.isPending} disabled={!reqItemId} variant="sponge">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddReq(false); setReqItemId(''); setReqQty(1); }}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(project.requirements || []).map((req) => (
              <div key={req.id} className="flex items-center justify-between py-3 border-b border-bb-sand/30 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-ocean-800">{req.inventory?.name || `Item #${req.inventoryId}`}</p>
                  <p className="text-xs text-ocean-400">Required: {req.requiredQuantity} units</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {req.inventory && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${req.inventory.quantity >= req.requiredQuantity ? 'bg-kelp-50 text-kelp-600' : 'bg-krabs-50 text-krabs-500'}`}>
                      {req.inventory.quantity >= req.requiredQuantity ? '✅ In Stock' : `⚠️ Short by ${req.requiredQuantity - req.inventory.quantity}`}
                    </span>
                  )}
                  <Button size="sm" variant="ghost" className="text-ocean-400 hover:text-ocean-600 hover:bg-ocean-50 text-xs px-2 py-1" onClick={() => openEditReq(req)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-krabs-400 hover:text-krabs-600 hover:bg-krabs-50 text-xs px-2 py-1" onClick={() => setDeleteReq(req)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
            {(!project.requirements || project.requirements.length === 0) && (
              <p className="text-ocean-400 text-sm text-center py-6">📦 No material requirements yet. Add items needed for this project.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====== ALL MODALS (at root level) ====== */}

      {/* Edit Project Modal */}
      <Modal open={editProject} onClose={() => setEditProject(false)} title="Edit Project" className="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Project Name</label>
            <Input value={editName} onChange={(e: any) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls} rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={editStatus} onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}>
                {PROJECT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <Input type="number" min={1} value={editPriority} onChange={(e: any) => setEditPriority(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => updateProjectMutation.mutate({ name: editName, description: editDesc || undefined, status: editStatus, priority: Number(editPriority) })} loading={updateProjectMutation.isPending} variant="sponge">Save Changes</Button>
            <Button variant="secondary" onClick={() => setEditProject(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Project Modal */}
      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete <strong className="text-gray-900">{project.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => deleteProjectMutation.mutate()} loading={deleteProjectMutation.isPending}>Delete</Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Experiment Log Modal */}
      <Modal open={!!editExp} onClose={() => setEditExp(null)} title="Edit Experiment Log" className="max-w-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={editExpStatus} onChange={(e) => setEditExpStatus(e.target.value as ExperimentStatus)}>
                {EXPERIMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <label className="text-sm font-semibold text-ocean-700">Success:</label>
              <input type="checkbox" checked={editExpSuccess} onChange={(e) => setEditExpSuccess(e.target.checked)} className="h-4 w-4 rounded border-ocean-300 text-ocean-600 focus:ring-ocean-500" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Hypothesis</label>
            <textarea className={inputCls} rows={2} placeholder="Hypothesis (optional)" value={editExpHypothesis} onChange={(e) => setEditExpHypothesis(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Methodology</label>
            <textarea className={inputCls} rows={2} placeholder="Methodology (optional)" value={editExpMethodology} onChange={(e) => setEditExpMethodology(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Result</label>
            <textarea className={inputCls} rows={2} placeholder="Result (optional)" value={editExpResult} onChange={(e) => setEditExpResult(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <input className={inputCls} placeholder="Notes (optional)" value={editExpNotes} onChange={(e) => setEditExpNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => editExp && updateExpMutation.mutate({
              expId: editExp.id,
              data: {
                result: editExpResult || undefined,
                success: editExpSuccess,
                notes: editExpNotes || undefined,
                hypothesis: editExpHypothesis || undefined,
                methodology: editExpMethodology || undefined,
                status: editExpStatus || undefined,
              },
            })} loading={updateExpMutation.isPending} variant="sponge">Save Changes</Button>
            <Button variant="secondary" onClick={() => setEditExp(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Experiment Log Modal */}
      <Modal open={!!deleteExp} onClose={() => setDeleteExp(null)} title="Delete Experiment Log">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete this experiment log?</p>
          {deleteExp && deleteExp.result && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-700">{deleteExp.result}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => deleteExp && deleteExpMutation.mutate(deleteExp.id)} loading={deleteExpMutation.isPending}>Delete</Button>
            <Button variant="secondary" onClick={() => setDeleteExp(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Requirement Modal */}
      <Modal open={!!editReq} onClose={() => setEditReq(null)} title="Edit Requirement">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Inventory Item</label>
            <select className={inputCls} value={editReqItemId} onChange={(e) => setEditReqItemId(Number(e.target.value))}>
              <option value={0}>Select an item...</option>
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>{item.name} (Stock: {item.quantity} {item.unit || 'units'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Required Quantity</label>
            <input type="number" min={1} className={inputCls} value={editReqQty} onChange={(e) => setEditReqQty(Number(e.target.value))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => editReq && updateReqMutation.mutate({
              reqId: editReq.id,
              data: {
                inventoryId: editReqItemId || undefined,
                requiredQuantity: editReqQty,
              },
            })} loading={updateReqMutation.isPending} disabled={!editReqItemId} variant="sponge">Save Changes</Button>
            <Button variant="secondary" onClick={() => setEditReq(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Requirement Modal */}
      <Modal open={!!deleteReq} onClose={() => setDeleteReq(null)} title="Delete Requirement">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Remove <strong className="text-gray-900">{deleteReq?.inventory?.name || `Item #${deleteReq?.inventoryId}`}</strong> from required materials?
          </p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => deleteReq && deleteReqMutation.mutate(deleteReq.id)} loading={deleteReqMutation.isPending}>Delete</Button>
            <Button variant="secondary" onClick={() => setDeleteReq(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
