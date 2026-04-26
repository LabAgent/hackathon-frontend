import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials } from '@/lib/utils';
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Overview', path: '/admin', icon: '📊' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Back to Lab', path: '/dashboard', icon: '🔬' },
];

function KrustyKrabScene() {
  return (
    <div className="sb-scene">
      <div className="sand-floor" style={{
        background: 'linear-gradient(0deg, rgba(232,96,96,0.12) 0%, rgba(232,96,96,0.06) 30%, rgba(232,96,96,0.02) 70%, transparent 100%)',
        borderTopColor: 'rgba(232,96,96,0.08)',
      }} />

      <div className="kelp-decor kelp-left" style={{ opacity: 0.15 }} />
      <div className="kelp-decor kelp-right" style={{ opacity: 0.15 }} />

      <div className="sea-decorations">
        <span className="sea-deco-item">🦀</span>
        <span className="sea-deco-item">💰</span>
        <span className="sea-deco-item">🦀</span>
        <span className="sea-deco-item">🍔</span>
        <span className="sea-deco-item">🦀</span>
        <span className="sea-deco-item">💰</span>
        <span className="sea-deco-item">🦀</span>
        <span className="sea-deco-item">🍔</span>
      </div>

      <div className="ocean-waves">
        <div className="ocean-wave" style={{ background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23E86060' fill-opacity='0.08' d='M0,30 C360,60 720,0 1080,30 C1260,45 1350,15 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\") repeat-x" }} />
        <div className="ocean-wave" style={{ background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%23E86060' fill-opacity='0.05' d='M0,30 C360,60 720,0 1080,30 C1260,45 1350,15 1440,30 L1440,60 L0,60 Z'/%3E%3C/svg%3E\") repeat-x" }} />
      </div>
    </div>
  );
}

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
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(180deg, #354550 0%, #3D4D5A 25%, #4A5A68 50%, #5A6B7A 75%, #6E7E8C 100%)' }}
    >
      <KrustyKrabScene />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 moai-sidebar backdrop-blur-2xl border-r-2 border-bb-porthole/15 text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="moai-icon-container">
              <span className="text-lg">🦀</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-bb-pineapple text-sm leading-tight font-[var(--font-display)]">Mr. Krabs</span>
              <span className="text-bb-porthole/70 text-xs">Admin Panel</span>
            </div>
          </div>
          <button className="lg:hidden text-bb-porthole/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1 relative z-10">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                isActive(item.path)
                  ? 'bg-bb-pineapple/20 text-bb-pineapple-light border border-bb-pineapple/30'
                  : 'text-bb-porthole-light/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="moai-icon-container !w-8 !h-8">
                <span className="text-sm">{item.icon}</span>
              </div>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <header className="ocean-road-nav backdrop-blur-2xl sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 text-bb-porthole hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-white/15 transition-all hover:scale-[1.03]"
                >
                  {user?.image ? (
                    <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover border-2 border-bb-pineapple" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-bb-coral to-bb-pineapple text-white flex items-center justify-center text-sm font-bold shadow-warm border-2 border-bb-pineapple-dark">
                      {user ? getInitials(user.fullName) : 'A'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-white">{user?.fullName}</p>
                    <p className="text-xs text-bb-pineapple-light">🦀 Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-bb-porthole/70 hidden sm:block" />
                </button>
                {profileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-bb-stone-dark/95 backdrop-blur-xl rounded-2xl border-2 border-bb-porthole/15 shadow-warm-xl z-50 py-2 moai-sidebar">
                      <div className="px-4 py-2 border-b border-white/10 relative z-10">
                        <p className="text-sm font-bold text-white">{user?.fullName}</p>
                        <p className="text-xs text-bb-pineapple-light">🦀 Administrator</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-bb-coral hover:bg-bb-coral/10 font-bold flex items-center gap-2 relative z-10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
