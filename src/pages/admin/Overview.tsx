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
    { label: 'Total Users', value: totalUsers, emoji: '👥', color: 'from-ocean-400 to-ocean-500' },
    { label: 'Active Users', value: activeUsers, emoji: '✅', color: 'from-kelp-400 to-kelp-500' },
    { label: 'Inactive Users', value: totalUsers - activeUsers, emoji: '💤', color: 'from-krabs-400 to-krabs-500' },
    { label: 'Admins', value: adminUsers, emoji: '🦀', color: 'from-sponge-400 to-sponge-500' },
  ];

  const recentUsers = users.slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6 font-[var(--font-display)] flex items-center gap-2">
        <span className="emoji-icon">🦀</span> Mr. Krabs' Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                {stat.emoji}
              </div>
              <div>
                <p className="text-sm text-ocean-500 font-semibold">{stat.label}</p>
                <p className="text-2xl font-bold text-ocean-800 font-[var(--font-display)]">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="emoji-icon">👥</span> Recent Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentUsers.length === 0 ? (
            <p className="text-ocean-400 text-center py-4 font-medium">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-ocean-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-ocean-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ocean-50">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-ocean-50/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-ocean-800">{user.fullName}</td>
                      <td className="px-4 py-3 text-sm text-ocean-500">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.role === 'admin' ? 'bg-krabs-50 text-krabs-500' : 'bg-ocean-50 text-ocean-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.isActive ? 'bg-kelp-50 text-kelp-600' : 'bg-krabs-50 text-krabs-500'
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
