import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { Shield, User, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'react-toastify';

import AdminGuard from '../../components/AdminGuard';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  async function loadUsers() {
    try {
      const res = await adminAPI.getUsers({ search, role: roleFilter });
      setUsers(res.data?.data?.users || res.data?.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id, currentStatus) {
    try {
      await adminAPI.updateUserStatus(id, { isActive: !currentStatus });
      toast.success('User status updated');
      loadUsers();
    } catch { toast.error('Failed to update status'); }
  }

  async function updateRole(id, newRole) {
    try {
      await adminAPI.updateUserRole(id, { role: newRole });
      toast.success('User role updated');
      loadUsers();
    } catch { toast.error('Failed to update role'); }
  }

  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  const filteredUsers = users.filter(u => {
    const name = (u.full_name || u.fullName || u.email || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <AdminGuard>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
            <p className="text-sm text-slate-500">Manage registered platform accounts, verifier roles, and active statuses.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="verifier">Verifier</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="card table-container bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="data-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 text-sm">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const displayName = u.full_name || u.fullName || u.email || 'User';
                  const initial = displayName[0]?.toUpperCase() || 'U';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                            {initial}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{displayName}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select 
                          className="text-xs border border-slate-200 rounded-md py-1 px-2 bg-white focus:outline-none"
                          value={u.role || 'user'}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="verifier">Verifier</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => toggleStatus(u.id, u.is_active)} className="text-xs font-medium text-primary-600 hover:text-primary-800">
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
