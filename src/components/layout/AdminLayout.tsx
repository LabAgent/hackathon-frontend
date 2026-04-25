import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  Beaker,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Back to Lab', path: '/dashboard', icon: Beaker },
];

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    logout();
    navigate('/admin/login');
    if (refreshToken) {
      import('@/api/auth.api').then(({ authApi }) =>
        authApi.logout(refreshToken).catch(() => {}),
      );
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-ocean-900/95 backdrop-blur-xl border-r border-ocean-700/50 text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-ocean-700/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-sandy-400 rounded-lg flex items-center justify-center shadow-md">
              <Shield className="h-5 w-5 text-ocean-900" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm leading-tight">Treedome Lab</span>
              <span className="text-ocean-400 text-xs">Admin Panel</span>
            </div>
          </div>
          <button className="lg:hidden text-ocean-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-sandy-400/20 text-sandy-300'
                  : 'text-ocean-200 hover:bg-ocean-700/40 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-ocean-900/80 backdrop-blur-xl border-b border-ocean-700/50 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 text-ocean-300 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ocean-700/40 transition-colors"
                >
                  {user?.image ? (
                    <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover border-2 border-sandy-400" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-sandy-400 text-ocean-900 flex items-center justify-center text-sm font-bold">
                      {user ? getInitials(user.fullName) : 'A'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user?.fullName}</p>
                    <p className="text-xs text-sandy-300">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-ocean-300 hidden sm:block" />
                </button>
                {profileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-ocean-800 rounded-lg border border-ocean-700 shadow-lg z-50 py-1">
                      <div className="px-4 py-2 border-b border-ocean-700">
                        <p className="text-sm font-medium text-white">{user?.fullName}</p>
                        <p className="text-xs text-sandy-300">Administrator</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-coral-400 hover:bg-ocean-700/40"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}