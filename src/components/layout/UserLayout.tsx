import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials } from '@/lib/utils';
import { User, LogOut, ChevronDown, LayoutDashboard, Beaker, Package, Bot, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/research', label: 'Projects', icon: Beaker },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
];

export function UserLayout() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    logout();
    navigate('/login');
    if (refreshToken) {
      import('@/api/auth.api').then(({ authApi }) =>
        authApi.logout(refreshToken).catch(() => {}),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-900">
      <nav className="bg-ocean-900/80 backdrop-blur-xl border-b border-ocean-700/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="h-9 w-9 bg-sandy-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-ocean-900 text-lg font-bold">S</span>
                </div>
                <span className="font-bold text-white text-lg">Treedome Lab</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-ocean-700/60 text-sandy-300'
                          : 'text-ocean-200 hover:bg-ocean-700/40 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-ocean-200 hover:bg-ocean-700/40 hover:text-white transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ocean-700/40 transition-colors"
              >
                {user?.image ? (
                  <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover border-2 border-sandy-400" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-sandy-400 text-ocean-900 flex items-center justify-center text-sm font-bold">
                    {user ? getInitials(user.fullName) : '?'}
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-ocean-300" />
              </button>
              {profileDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-ocean-800 rounded-lg border border-ocean-700 shadow-lg z-50 py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ocean-200 hover:bg-ocean-700/40"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-coral-400 hover:bg-ocean-700/40"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-ocean-700/60 text-sandy-300' : 'text-ocean-300 hover:bg-ocean-700/40'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-ocean-300 hover:bg-ocean-700/40"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
