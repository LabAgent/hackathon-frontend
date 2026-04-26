import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials } from '@/lib/utils';
import { LogOut, ChevronDown, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', emoji: '🏠' },
  { to: '/research', label: 'Projects', emoji: '🔬' },
  { to: '/inventory', label: 'Inventory', emoji: '📦' },
  { to: '/assistant', label: 'AI Assistant', emoji: '🤖' },
];

function Bubbles() {
  return (
    <div className="bubble-bg">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bubble" />
      ))}
    </div>
  );
}

function SpongeBobScene() {
  return (
    <div className="sb-scene">
      <div className="flower-clouds">
        {['🌸', '🌺', '🌸', '🌺', '🌸'].map((flower, i) => (
          <div key={i} className="flower-cloud" style={{ fontSize: `${28 + (i % 3) * 8}px` }}>
            {flower}
          </div>
        ))}
      </div>

      <div className="kelp-decor kelp-left" />
      <div className="kelp-decor kelp-right" />

      <div className="sand-floor" />

      <div className="sea-decorations">
        <span className="sea-deco-item">🐚</span>
        <span className="sea-deco-item">⭐</span>
        <span className="sea-deco-item">🐚</span>
        <span className="sea-deco-item">🌟</span>
        <span className="sea-deco-item">🐚</span>
        <span className="sea-deco-item">⭐</span>
        <span className="sea-deco-item">🪸</span>
        <span className="sea-deco-item">🐚</span>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #001e3d 0%, #003660 25%, #004a77 50%, #005f99 75%, #0077be 100%)' }}
    >
      <Bubbles />
      <SpongeBobScene />

      <nav className="bg-ocean-900/70 backdrop-blur-2xl border-b-2 border-sponge-400/20 sticky top-0 z-30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <span className="text-2xl">🧽</span>
                <span className="font-bold text-sponge-400 text-xl font-[var(--font-display)]">Bikini Bottom Lab</span>
              </Link>

              <div className="hidden md:flex items-center gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-sponge-400/20 text-sponge-300 shadow-inner'
                          : 'text-ocean-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="emoji-icon">{item.emoji}</span>
                      {item.label}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-ocean-200 hover:bg-white/10 hover:text-white transition-all"
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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                {user?.image ? (
                  <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover border-2 border-sponge-400" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sponge-400 to-sponge-500 text-ocean-900 flex items-center justify-center text-sm font-bold shadow-lg shadow-sponge-400/20">
                    {user ? getInitials(user.fullName) : '?'}
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-ocean-300" />
              </button>
              {profileDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-ocean-800/95 backdrop-blur-xl rounded-2xl border-2 border-sponge-400/20 shadow-2xl z-50 py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-ocean-700/50">
                      <p className="text-sm font-bold text-white">{user?.fullName}</p>
                      <p className="text-xs text-sponge-300">Bikini Bottom Researcher</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ocean-200 hover:bg-white/10 font-medium"
                      onClick={() => setProfileDropdown(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      to="/security"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ocean-200 hover:bg-white/10 font-medium"
                      onClick={() => setProfileDropdown(false)}
                    >
                      🔒 Security
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-krabs-400 hover:bg-krabs-400/10 font-bold"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive ? 'bg-sponge-400/20 text-sponge-300' : 'text-ocean-300 hover:bg-white/10'
                  }`}
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap text-ocean-300 hover:bg-white/10"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
