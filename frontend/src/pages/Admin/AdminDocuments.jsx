import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { Search, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

import AdminGuard from '../../components/AdminGuard';

export default function AdminDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadDocs(); }, [search, typeFilter]);

  async function loadDocs() {
    try {
      const res = await adminAPI.getAllDocuments({ search, type: typeFilter });
      setDocs(res.data?.data?.documents || res.data?.data || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  const filteredDocs = docs.filter(d => {
    const origName = (d.original_name || d.stored_name || '').toLowerCase();
    const userName = (d.user_name || d.user_email || '').toLowerCase();
    const query = search.toLowerCase();
    return origName.includes(query) || userName.includes(query);
  });

  return (
    <AdminGuard>
      <div className="space-y-6 animate-fade-in pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">All System Documents</h1>
            <p className="text-sm text-slate-500">Monitor all user uploads, extraction statuses, and verification decisions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="pan">PAN Card</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
              <option value="bank_statement">Bank Statement</option>
              <option value="invoice">Invoice</option>
            </select>
          </div>
        </div>

        <div className="card table-container bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="data-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 text-sm">
                    No documents found in repository.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => navigate(`/documents/${doc.id}`)}>
                    <td className="py-3 px-4 font-medium text-slate-800 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span>{doc.original_name || doc.stored_name || `Document #${doc.id}`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{doc.user_name || doc.user_email || 'User'}</td>
                    <td className="py-3 px-4 text-sm capitalize">{(doc.document_type || 'unknown').replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4"><StatusBadge status={doc.verification_status || doc.status} /></td>
                    <td className="py-3 px-4 text-xs text-slate-500">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
