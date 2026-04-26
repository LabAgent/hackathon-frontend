import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
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
  const roleName = role === 'admin' ? '🦀 Mr. Krabs (Admin)' : role === 'researcher' ? '🔬 Researcher' : role === 'lab_assistant' ? '🐿️ Lab Assistant' : '🧽 Explorer';

  const stats = [
    { label: 'Projects', value: (projectStats as any)?.data?.total ?? 0, emoji: '🔬', color: 'from-ocean-400 to-ocean-500', link: '/research' },
    { label: 'Ongoing', value: (projectStats as any)?.data?.ongoing ?? 0, emoji: '🧪', color: 'from-kelp-400 to-kelp-500', link: '/research' },
    { label: 'Inventory', value: (inventoryStats as any)?.data?.total ?? 0, emoji: '📦', color: 'from-sponge-400 to-sponge-500', link: '/inventory' },
    { label: 'Low Stock', value: (inventoryStats as any)?.data?.lowStock ?? 0, emoji: '⚠️', color: 'from-krabs-400 to-krabs-500', link: '/inventory' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-[var(--font-display)] flex items-center gap-3">
            <span className="text-4xl">🏠</span>
            Sandy's Treedome Lab
          </h1>
          <p className="text-ocean-300 mt-1 font-medium">Welcome back! Role: <span className="font-bold text-sponge-300">{roleName}</span></p>
        </div>
        <Link
          to="/assistant"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-bb-pineapple to-bb-pineapple-light text-white rounded-xl hover:from-sponge-300 hover:to-sponge-400 transition-all font-bold shadow-warm-lg"
        >
          <span className="emoji-icon">🤖</span>
          Ask AI Assistant
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <div className="group bg-bb-sand-light/92 backdrop-blur-xl rounded-3xl p-5 border-2 border-bb-sand-dark/30 shadow-warm-lg pineapply-panel sandy-texture hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white text-2xl shadow-lg`}>
                  {stat.emoji}
                </div>
                <div>
                  <p className="text-3xl font-bold text-ocean-800 font-[var(--font-display)]">{stat.value}</p>
                  <p className="text-sm text-ocean-500 font-semibold">{stat.label}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="emoji-icon">🧪</span>
              Recent Projects
            </CardTitle>
            <Link to="/research" className="text-sm text-ocean-500 hover:text-ocean-600 font-bold">View all →</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((projects as any)?.data || []).slice(0, 5).map((r: any) => (
                <Link key={r.id} to={`/research/${r.id}`} className="flex items-center justify-between py-2.5 hover:bg-ocean-50/50 rounded-xl px-3 -mx-2 transition-all">
                  <div>
                    <p className="font-bold text-ocean-800 text-sm">{r.name}</p>
                    <p className="text-xs text-ocean-400">{r.status} - {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    r.status === 'ongoing' ? 'bg-kelp-50 text-kelp-600' :
                    r.status === 'completed' ? 'bg-ocean-50 text-ocean-600' :
                    'bg-sponge-50 text-sponge-700'
                  }`}>
                    {r.status}
                  </span>
                </Link>
              ))}
              {(!projects || !((projects as any)?.data?.length)) && (
                <p className="text-ocean-400 text-sm py-4 text-center">🔬 No projects yet — start exploring!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="emoji-icon">🚨</span>
              Low Stock Alerts
            </CardTitle>
            <Link to="/inventory" className="text-sm text-ocean-500 hover:text-ocean-600 font-bold">View all →</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((lowStockAlerts as any)?.data || []).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-ocean-100 last:border-0">
                  <div>
                    <p className="font-bold text-ocean-800 text-sm">{item.name}</p>
                    <p className="text-xs text-ocean-400">{item.category || 'No category'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-krabs-400">{item.quantity} / {item.minRequired}</p>
                    <p className="text-xs text-krabs-300">-{item.deficit} below threshold</p>
                  </div>
                </div>
              ))}
              {(!lowStockAlerts || !((lowStockAlerts as any)?.data?.length)) && (
                <p className="text-ocean-400 text-sm py-4 text-center">✅ All items are well stocked!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="emoji-icon">⚡</span>
            Challenge Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ocean-500 mb-4 font-medium">Try these prompts with Sandy's AI Lab Assistant to see multi-agent orchestration in action:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: '🔍 Research Agent', prompt: 'Search for recent studies about jellyfish migration patterns in the Pacific Ocean', desc: 'Triggers: Planner → Research → web_search', color: 'bg-gary-50 border-gary-200 hover:bg-gary-100' },
              { label: '📦 Inventory Agent', prompt: 'Which lab supplies are running low and need reordering?', desc: 'Triggers: Planner → Inventory → alert_low_stock + suggest_reorder', color: 'bg-sponge-50 border-sponge-200 hover:bg-sponge-100' },
              { label: '💾 Database Agent', prompt: 'Show me all ongoing research projects and their status', desc: 'Triggers: Planner → Database → query_records', color: 'bg-kelp-50 border-kelp-200 hover:bg-kelp-100' },
              { label: '🔄 Multi-Step', prompt: 'Analyze experiment results for project 1 and suggest what supplies I need to continue', desc: 'Triggers: Planner → Research → Database → Inventory', color: 'bg-ocean-50 border-ocean-200 hover:bg-ocean-100' },
            ].map((scenario) => (
              <Link
                key={scenario.label}
                to="/assistant"
                state={{ prompt: scenario.prompt }}
                className={`block p-4 rounded-2xl border-2 transition-all duration-200 ${scenario.color}`}
              >
                <p className="font-bold text-sm text-ocean-800">{scenario.label}</p>
                <p className="text-xs text-ocean-600 mt-1 line-clamp-2">"{scenario.prompt}"</p>
                <p className="text-xs text-ocean-400 mt-1">{scenario.desc}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
