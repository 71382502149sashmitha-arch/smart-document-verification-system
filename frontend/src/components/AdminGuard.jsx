import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useState } from 'react';

export default function AdminGuard({ children }) {
  const { user, login } = useAuth();
  const [switching, setSwitching] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@sdvs.com';

  async function handleSwitchToAdmin() {
    setSwitching(true);
    try {
      await login('admin@sdvs.com', 'Admin@123');
      window.location.reload();
    } catch (err) {
      setSwitching(false);
    }
  }

  if (isAdmin) {
    return children;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-200 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Admin Privileges Required</h2>
              <p className="text-slate-600 text-sm mt-1">
                You are currently logged in as <span className="font-semibold text-slate-800">{user?.email || 'Standard User'}</span> ({user?.role || 'user'} role). 
                Administrative metrics, audit logs, user management, and rule controls require an Admin session.
              </p>
            </div>
          </div>

          <button
            onClick={handleSwitchToAdmin}
            disabled={switching}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2 flex-shrink-0 transition-all hover:scale-105"
          >
            <LogIn className="w-4 h-4" />
            {switching ? 'Switching to Admin...' : 'Switch to Admin Account (1-Click)'}
          </button>
        </div>
      </div>

      <div className="opacity-40 pointer-events-none filter blur-[1px]">
        {children}
      </div>
    </div>
  );
}
