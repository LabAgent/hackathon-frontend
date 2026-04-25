import { Outlet } from 'react-router';
import { Link } from 'react-router';
import { Shell } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 bg-sandy-400 rounded-xl flex items-center justify-center shadow-lg shadow-sandy-400/30">
              <Shell className="h-6 w-6 text-ocean-900" />
            </div>
            <span className="text-2xl font-bold text-white">Treedome Lab</span>
          </Link>
          <p className="text-ocean-300 text-sm mt-2">Sandy's Underwater Research Platform</p>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-ocean-700/20 p-8">
          <Outlet />
        </div>
        <p className="text-center text-ocean-400 text-xs mt-6">
          &copy; 2025 Treedome Lab &mdash; Powered by Sandy's Science
        </p>
      </div>
    </div>
  );
}