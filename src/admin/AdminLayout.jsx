import { Outlet } from 'react-router';
import { useState, useEffect } from 'react';
import { MonitorOff } from 'lucide-react';
import { ProtectedAdminRoute } from './pages/ProtectedAdminRoute';

export const AdminLayout = () => {
  const [isWideEnough, setIsWideEnough] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsWideEnough(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isWideEnough) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 max-w-md shadow-2xl">
          <MonitorOff className="size-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Desktop Access Only</h2>
          <p className="text-zinc-400 mb-6">
            The Admin Panel requires a wider screen for security and data integrity.
            Please switch to a desktop device or expand your window.
          </p>
          <div className="text-xs text-zinc-600 uppercase tracking-widest">
            Minimum Width: 1024px
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedAdminRoute>
      <Outlet />
    </ProtectedAdminRoute>
  );
};
