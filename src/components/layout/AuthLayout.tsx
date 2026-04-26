import { Outlet } from 'react-router';
import { Link } from 'react-router';

function Bubbles() {
  return (
    <div className="bubble-bg">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bubble" />
      ))}
    </div>
  );
}

function AuthScene() {
  return (
    <div className="sb-scene">
      <div className="flower-clouds">
        {['🌸', '🌺', '🌸', '🌺', '🌸'].map((flower, i) => (
          <div key={i} className="flower-cloud" style={{ fontSize: `${32 + (i % 3) * 10}px` }}>
            {flower}
          </div>
        ))}
      </div>

      <div className="kelp-decor kelp-left" style={{ opacity: 0.2 }} />
      <div className="kelp-decor kelp-right" style={{ opacity: 0.2 }} />

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

      <div className="ocean-waves">
        <div className="ocean-wave" />
        <div className="ocean-wave" />
      </div>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: 'linear-gradient(180deg, #001e3d 0%, #003660 30%, #004a77 60%, #005f99 100%)' }}
    >
      <Bubbles />
      <AuthScene />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8" style={{ animation: 'float-gentle 4s ease-in-out infinite' }}>
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="text-5xl mb-1">🧽</div>
            <span className="text-3xl font-bold text-sponge-400 font-[var(--font-display)] drop-shadow-lg">
              Bikini Bottom Lab
            </span>
          </Link>
          <p className="text-ocean-300 text-sm mt-2 font-medium">
            🐿️ Sandy's Underwater Research Platform
          </p>
        </div>

        <div className="sb-card p-8">
          <Outlet />
        </div>

        <p className="text-center text-ocean-400/60 text-xs mt-6 font-medium">
          &copy; 2025 Bikini Bottom Lab &mdash; Powered by Sandy's Science 🌊
        </p>
      </div>
    </div>
  );
}
