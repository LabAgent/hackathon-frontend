import { useParams, Link } from 'react-router';
import { useGetUser } from '@/hooks/useAdmin';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Spinner } from '@/components/ui';
import { ErrorBanner } from '@/components/ui';
import { formatDate, getInitials } from '@/lib/utils';
import { ArrowLeft, Edit2 } from 'lucide-react';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError, error } = useGetUser(id!);

  if (isError) {
    return <ErrorBanner error={error} />;
  }

  if (isLoading || !user) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  const details = [
    { label: 'Email', value: user.email, emoji: '📧' },
    { label: 'Role', value: user.role, emoji: '🎭' },
    { label: 'Created', value: formatDate(user.createdAt), emoji: '📅' },
    { label: 'Last Login', value: formatDate(user.lastLogin), emoji: '🕐' },
    { label: 'Email Verified', value: user.isVerified ? 'Yes' : 'No', emoji: user.isVerified ? '✅' : '❌' },
    { label: 'MFA Enabled', value: user.mfaEnabled ? 'Yes' : 'No', emoji: user.mfaEnabled ? '🛡️' : '⚠️' },
    { label: 'Active', value: user.isActive ? 'Yes' : 'No', emoji: user.isActive ? '✅' : '💤' },
    { label: 'Locked Until', value: user.lockedUntil ? formatDate(user.lockedUntil) : 'Not locked', emoji: user.lockedUntil ? '🔒' : '🔓' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/users" className="p-2 text-ocean-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white font-[var(--font-display)] flex items-center gap-2">
            <span className="emoji-icon">👤</span> Crew Member Details
          </h1>
        </div>
        <Link to={`/admin/users/${user.id}/edit`}>
          <Button variant="sponge"><Edit2 className="h-4 w-4 mr-2" />✏️ Edit</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center py-8">
            {user.image ? (
              <img src={user.image} alt="" className="h-24 w-24 rounded-full object-cover mb-4 border-4 border-sponge-400" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-sponge-400 to-sponge-500 text-ocean-900 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                {getInitials(user.fullName)}
              </div>
            )}
            <h2 className="text-lg font-bold text-ocean-800 font-[var(--font-display)]">{user.fullName}</h2>
            <p className="text-sm text-ocean-500">{user.email}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant={user.role === 'admin' ? 'info' : 'default'}>{user.role}</Badge>
              <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? '✅ Active' : '❌ Inactive'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="emoji-icon">📋</span> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              {details.map(({ label, value, emoji }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-ocean-100 last:border-0">
                  <dt className="flex items-center gap-2 text-sm text-ocean-500 font-medium">
                    <span>{emoji}</span>
                    {label}
                  </dt>
                  <dd className="text-sm font-bold text-ocean-800">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
