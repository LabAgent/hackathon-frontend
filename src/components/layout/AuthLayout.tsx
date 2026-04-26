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
      style={{ background: 'linear-gradient(180deg, #3A95A3 0%, #4AB5C4 30%, #6EC8D4 60%, #8AAFC8 100%)' }}
    >
      <Bubbles />
      <AuthScene />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8" style={{ animation: 'float-gentle 4s ease-in-out infinite' }}>
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="text-5xl mb-1">🧽</div>
            <span className="text-3xl font-bold text-white font-[var(--font-display)] drop-shadow-lg"
              style={{ textShadow: '0 2px 8px rgba(42,26,10,0.3)' }}>
              Bikini Bottom Lab
            </span>
          </Link>
          <p className="text-white/80 text-sm mt-2 font-medium"
            style={{ textShadow: '0 1px 4px rgba(42,26,10,0.2)' }}>
            🐿️ Sandy's Underwater Research Platform
          </p>
        </div>

        <div className="bg-bb-sand-light/92 backdrop-blur-xl rounded-3xl border-2 border-bb-sand-dark/30 shadow-warm-xl p-8 pineapply-panel sandy-texture">
          <Outlet />
        </div>

        <p className="text-center text-white/50 text-xs mt-6 font-medium"
          style={{ textShadow: '0 1px 4px rgba(42,26,10,0.2)' }}>
          &copy; 2025 Bikini Bottom Lab &mdash; Powered by Sandy's Science 🌊
        </p>
      </div>
    </div>
  );
}
