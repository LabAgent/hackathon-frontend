import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useListUsers } from '@/hooks/useAdmin';
import { Card, CardContent, Button, Badge, Pagination, Spinner, Modal, ErrorBanner } from '@/components/ui';
import { Search, Eye, Edit2, Lock, Unlock, Trash2 } from 'lucide-react';
import { useLockUser, useDeactivateUser } from '@/hooks/useAdmin';
import { formatDate, getInitials } from '@/lib/utils';

export default function UsersList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [lockModal, setLockModal] = useState<{ id: string; locked: boolean } | null>(null);
  const [deactivateModal, setDeactivateModal] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error } = useListUsers({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: role || undefined,
  });

  const lockUser = useLockUser();
  const deactivateUser = useDeactivateUser();

  const handleLock = () => {
    if (!lockModal) return;
    lockUser.mutate(
      { id: lockModal.id, data: { locked: lockModal.locked } },
      { onSuccess: () => setLockModal(null) },
    );
  };

  const handleDeactivate = () => {
    if (!deactivateModal) return;
    deactivateUser.mutate(deactivateModal, {
      onSuccess: () => setDeactivateModal(null),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-[var(--font-display)] flex items-center gap-2">
            <span className="emoji-icon">👥</span> Crew Members
          </h1>
          <p className="text-sm text-ocean-400 mt-1 font-medium">
            {data ? `${data.total} total crew members` : 'Loading...'}
          </p>
        </div>
      </div>

      {isError && <ErrorBanner error={error} className="mb-6" />}
      <Card className="mb-6">
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
              <input
                type="text"
                placeholder="Search crew members..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-3 py-2.5 border-2 border-ocean-200 rounded-xl text-sm focus:outline-none focus:border-sponge-400 bg-white/90 transition-all"
              />
            </div>
          </div>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border-2 border-ocean-200 rounded-xl text-sm focus:outline-none focus:border-sponge-400 bg-white/90 font-semibold"
          >
            <option value="">All Roles</option>
            <option value="user">🧽 User</option>
            <option value="admin">🦀 Admin</option>
            <option value="researcher">🔬 Researcher</option>
            <option value="lab_assistant">🐿️ Lab Assistant</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : !data?.users.length ? (
          <CardContent className="text-center py-12 text-ocean-400 font-medium">
            No crew members found
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-ocean-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">User</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Verified</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">2FA</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Joined</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ocean-50">
                  {data.users.map((user) => (
                    <tr key={user.id} className="hover:bg-ocean-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sponge-400 to-sponge-500 text-ocean-900 flex items-center justify-center text-xs font-bold">
                              {getInitials(user.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-ocean-800">{user.fullName}</p>
                            <p className="text-xs text-ocean-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? '✅' : '❌'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isVerified ? 'success' : 'warning'}>
                          {user.isVerified ? '✅' : '⏳'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.mfaEnabled ? 'info' : 'default'}>
                          {user.mfaEnabled ? '🛡️' : '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-ocean-500 font-medium">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/admin/users/${user.id}`}>
                            <button className="p-1.5 text-ocean-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link to={`/admin/users/${user.id}/edit`}>
                            <button className="p-1.5 text-ocean-400 hover:text-sponge-600 hover:bg-sponge-50 rounded-lg" title="Edit">
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setLockModal({ id: user.id, locked: !user.lockedUntil })}
                            className="p-1.5 text-ocean-400 hover:text-sandy-600 hover:bg-sandy-50 rounded-lg"
                            title={user.lockedUntil ? 'Unlock' : 'Lock'}
                          >
                            {user.lockedUntil ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>
                          {user.isActive && (
                            <button
                              onClick={() => setDeactivateModal(user.id)}
                              className="p-1.5 text-ocean-400 hover:text-krabs-500 hover:bg-krabs-50 rounded-lg"
                              title="Deactivate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 && (
              <div className="px-4 py-3 border-t-2 border-ocean-100">
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={!!lockModal}
        onClose={() => setLockModal(null)}
        title={lockModal?.locked ? '🔒 Lock User' : '🔓 Unlock User'}
      >
        <p className="text-sm text-ocean-500 mb-4 font-medium">
          Are you sure you want to {lockModal?.locked ? 'lock' : 'unlock'} this crew member?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setLockModal(null)}>Cancel</Button>
          <Button
            variant={lockModal?.locked ? 'danger' : 'sponge'}
            loading={lockUser.isPending}
            onClick={handleLock}
          >
            {lockModal?.locked ? '🔒 Lock' : '🔓 Unlock'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!deactivateModal}
        onClose={() => setDeactivateModal(null)}
        title="🚫 Deactivate User"
      >
        <p className="text-sm text-ocean-500 mb-4 font-medium">
          Are you sure you want to deactivate this crew member? This action marks the user as inactive.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeactivateModal(null)}>Cancel</Button>
          <Button variant="danger" loading={deactivateUser.isPending} onClick={handleDeactivate}>
            🚫 Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  );
}
