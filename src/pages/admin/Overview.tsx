import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ErrorBanner } from '@/components/ui';

export default function AdminOverview() {
  const { data: usersData, isError, error } = useQuery({
    queryKey: ['admin', 'users', { page: 1, limit: 25 }],
    queryFn: () => adminApi.listUsers({ page: 1, limit: 25 }),
  });

  if (isError) {
    return <ErrorBanner error={error} />;
  }

  const users = usersData?.users ?? [];
  const totalUsers = usersData?.total ?? 0;
  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  const stats = [
    { label: 'Total Users', value: totalUsers, emoji: '👥', color: 'from-bb-ocean to-bb-ocean-dark' },
    { label: 'Active Users', value: activeUsers, emoji: '✅', color: 'from-bb-tropical to-bb-tropical-dark' },
    { label: 'Inactive Users', value: totalUsers - activeUsers, emoji: '💤', color: 'from-bb-coral to-bb-coral-light' },
    { label: 'Admins', value: adminUsers, emoji: '🦀', color: 'from-bb-pineapple to-bb-pineapple-dark' },
  ];

  const recentUsers = users.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-[var(--font-display)] flex items-center gap-2">
          <span className="emoji-icon text-4xl">🦀</span> Mr. Krabs' Dashboard
        </h1>
        <p className="text-bb-porthole-light text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:scale-105 transition-transform">
            <CardContent className="flex items-center gap-4 py-6">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${stat.color} shadow-warm flex-shrink-0`}>
                {stat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-bb-stone font-semibold truncate">{stat.label}</p>
                <p className="text-3xl font-bold text-bb-brown font-[var(--font-display)]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-bb-ocean/10 to-bb-pineapple/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="emoji-icon text-2xl">👥</span> Recent Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentUsers.length === 0 ? (
            <p className="text-bb-stone text-center py-4 font-medium">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-bb-sand/30 bg-bb-sand/10">
                    <th className="text-left px-6 py-4 text-xs font-bold text-bb-stone uppercase">Name</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-bb-stone uppercase">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-bb-stone uppercase">Role</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-bb-stone uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bb-sand/25">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-bb-sand/8 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-bb-brown">{user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-bb-stone">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'admin' ? 'bg-bb-danger-light text-bb-coral' : 'bg-bb-info-light text-bb-ocean'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.isActive ? 'bg-bb-success-light text-bb-success' : 'bg-bb-danger-light text-bb-coral'
                        }`}>
                          {user.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
