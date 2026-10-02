import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  CheckCircle,
  Users,
  BarChart3,
  Settings,
  Shield,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ClipboardCheck
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  // Shared Dashboard
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },

  // User Navigation
  { to: '/upload', label: 'Upload Document', icon: Upload, role: 'user' },
  { to: '/documents', label: 'My Documents', icon: FileText, role: 'user' },
  { to: '/verification-queue', label: 'Verification Queue', icon: CheckCircle, role: 'user' },
  { to: '/verification-details', label: 'Document Verification Details', icon: ClipboardCheck, role: 'user' },

  // Verifier Navigation
  { to: '/verification-queue', label: 'Verification Queue', icon: CheckCircle, role: 'verifier' },
  { to: '/documents', label: 'Documents to Review', icon: FileText, role: 'verifier' },
  { to: '/verification-details', label: 'Verification Details', icon: ClipboardCheck, role: 'verifier' },
  { to: '/history', label: 'Verification History', icon: ClipboardList, role: 'verifier' },

  // Admin Navigation
  { divider: true, label: 'Administration', role: 'admin' },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, role: 'admin' },
  { to: '/admin/users', label: 'Users', icon: Users, role: 'admin' },
  { to: '/admin/documents', label: 'All Documents', icon: ClipboardList, role: 'admin' },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield, role: 'admin' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, role: 'admin' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const userRole = (user?.role || '').toLowerCase();
  const userEmail = (user?.email || '').toLowerCase();

  const isAdmin = userRole === 'admin' || userEmail.includes('admin');
  const isVerifier = userRole === 'verifier' || userEmail.includes('verifier');
  const isUser = !isAdmin && !isVerifier;

  const activeRole = isAdmin ? 'admin' : isVerifier ? 'verifier' : 'user';

  const filteredNavItems = NAV_ITEMS.filter(item => {
    // If item has no role property, it's shared across all roles
    if (!item.role) return true;
    return item.role === activeRole;
  });

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-white shadow-lg border border-slate-200 p-2 rounded-lg"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative
          z-50
          top-0 left-0
          h-screen
          ${collapsed ? 'md:w-16' : 'md:w-64'}
          w-64
          bg-white
          border-r border-slate-200
          flex flex-col
          transition-all duration-300

          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* LOGO */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200 gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                SDVS
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight">
                Document Verification
              </p>
            </div>
          )}

          {/* MOBILE CLOSE BUTTON */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item, i) => {
            if (item.divider) {
              if (collapsed) return null;
              return (
                <p
                  key={i}
                  className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-1"
                >
                  {item.label}
                </p>
              );
            }

            const Icon = item.icon;

            return (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `
                  sidebar-link
                  ${isActive ? 'active' : ''}
                  ${collapsed ? 'md:justify-center md:px-2' : ''}
                  `
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />

                {!collapsed && (
                  <span className="whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* COLLAPSE BUTTON - DESKTOP ONLY */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-12 items-center justify-center border-t border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}