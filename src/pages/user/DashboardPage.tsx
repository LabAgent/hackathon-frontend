import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Beaker, Package, Bot, AlertTriangle, FlaskConical, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { researchApi, inventoryApi } from '@/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) setUser(JSON.parse(stored)?.state?.user);
    } catch {}
  }, []);

  const { data: projectStats } = useQuery({ queryKey: ['project-stats'], queryFn: () => researchApi.getStats() });
  const { data: inventoryStats } = useQuery({ queryKey: ['inventory-stats'], queryFn: () => inventoryApi.getStats() });
  const { data: lowStockAlerts } = useQuery({ queryKey: ['low-stock-alerts'], queryFn: () => inventoryApi.getLowStockAlerts() });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => researchApi.list() });

  const role = user?.role || 'user';
  const roleName = role === 'admin' ? 'Sandy (Admin)' : role === 'researcher' ? 'Researcher' : role === 'lab_assistant' ? 'Lab Assistant' : 'User';

  const stats = [
    { label: 'Projects', value: (projectStats as any)?.data?.total ?? 0, icon: Beaker, color: 'text-ocean-500', link: '/research' },
    { label: 'Ongoing', value: (projectStats as any)?.data?.ongoing ?? 0, icon: TrendingUp, color: 'text-kelp-500', link: '/research' },
    { label: 'Inventory Items', value: (inventoryStats as any)?.data?.total ?? 0, icon: Package, color: 'text-sandy-500', link: '/inventory' },
    { label: 'Low Stock Alerts', value: (inventoryStats as any)?.data?.lowStock ?? 0, icon: AlertTriangle, color: 'text-coral-500', link: '/inventory' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Sandy's Treedome Lab</h1>
          <p className="text-gray-500 mt-1">Role: <span className="font-medium text-ocean-600">{roleName}</span></p>
        </div>
        <Link
          to="/assistant"
          className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
        >
          <Bot className="h-5 w-5" />
          Ask AI Assistant
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-ocean-500" />
              Recent Projects
            </CardTitle>
            <Link to="/research" className="text-sm text-ocean-600 hover:text-ocean-700">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((projects as any)?.data || []).slice(0, 5).map((r: any) => (
                <Link key={r.id} to={`/research/${r.id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.status} - {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.status === 'ongoing' ? 'bg-kelp-50 text-kelp-600' :
                    r.status === 'completed' ? 'bg-ocean-50 text-ocean-600' :
                    'bg-sandy-50 text-sandy-600'
                  }`}>
                    {r.status}
                  </span>
                </Link>
              ))}
              {(!projects || !((projects as any)?.data?.length)) && (
                <p className="text-gray-400 text-sm py-4 text-center">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-coral-500" />
              Low Stock Alerts
            </CardTitle>
            <Link to="/inventory" className="text-sm text-ocean-600 hover:text-ocean-700">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((lowStockAlerts as any)?.data || []).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category || 'No category'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-coral-500">{item.quantity} / {item.minRequired}</p>
                    <p className="text-xs text-coral-400">-{item.deficit} below threshold</p>
                  </div>
                </div>
              ))}
              {(!lowStockAlerts || !((lowStockAlerts as any)?.data?.length)) && (
                <p className="text-gray-400 text-sm py-4 text-center">All items are well stocked!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}