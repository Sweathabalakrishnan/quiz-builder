import { Outlet, Link, useLocation } from 'react-router';
import { FileText, Home, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { clearDashboardAccess, isDashboardProtectionEnabled } from '../utils/dashboard-access';

export function Layout() {
  const location = useLocation();

  const handleLockDashboard = () => {
    clearDashboardAccess();
    window.location.reload();
  };

  return (
    <div className="min-h-screen text-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/88 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#281C59] to-[#4d378d] text-white shadow-lg shadow-[#281C59]/25">
                  <FileText className="size-5" />
                </div>
                <div>
                  <span className="block text-xl font-semibold tracking-tight text-slate-950">Quiz Builder</span>
                  <span className="block text-xs text-slate-500">Premium assessment workspace</span>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link to="/">
                  <Button
                    variant={location.pathname === '/' ? 'default' : 'ghost'}
                    size="sm"
                    className={location.pathname === '/' ? 'shadow-md shadow-[#281C59]/20' : 'text-slate-600 hover:bg-[#f4effd] hover:text-[#281C59]'}
                  >
                    <Home className="size-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {isDashboardProtectionEnabled() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLockDashboard}
                    className="text-slate-600 hover:bg-[#f4effd] hover:text-[#281C59]"
                  >
                    <Lock className="size-4 mr-2" />
                    Lock
                  </Button>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
