import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI } from '../api/documents';
import StatusBadge from '../components/StatusBadge';
import { FileText, Search, Download, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DocumentsList() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDocs(); }, [page, typeFilter, statusFilter]);

  async function loadDocs() {
    setLoading(true);
    try {
      const res = await documentsAPI.getMy({ page, limit: 10, type: typeFilter, status: statusFilter, search });
      setDocs(res.data.data.documents || []);
      setTotal(res.data.data.total || 0);
    } catch {}
    setLoading(false);
  }

  function handleSearch(e) { e.preventDefault(); setPage(1); loadDocs(); }

  async function downloadReport(id, e) {
    e.stopPropagation();
    try {
      const res = await documentsAPI.getReport(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `verification_report_${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch { toast.error('Failed to download report'); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">My Documents</h1><p className="text-slate-500 text-sm">View and manage your uploaded documents</p></div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="input-field pl-10" />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Types</option>
            {['aadhaar','pan','passport','driving_license','college_certificate','marksheet','birth_certificate','employee_id','resume','invoice','bank_statement'].map(t =>
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            )}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Status</option>
            {['pending','verified','rejected','needs_review','processing','error'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No documents found</p></div>
        ) : (
          <>
            <div className="table-container border-0">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Document</th><th>Type</th><th>Score</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.id} className="cursor-pointer" onClick={() => navigate(`/documents/${doc.id}`)}>
                      <td className="text-slate-500">#{doc.id}</td>
                      <td className="font-medium text-slate-800 max-w-[200px] truncate">{doc.original_name}</td>
                      <td className="capitalize">{(doc.document_type || 'unknown').replace(/_/g, ' ')}</td>
                      <td><span className={`font-bold ${doc.verification_score >= 85 ? 'text-emerald-600' : doc.verification_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{Math.round(doc.verification_score || 0)}</span></td>
                      <td><StatusBadge status={doc.verification_status} /></td>
                      <td className="text-sm text-slate-500">{new Date(doc.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => navigate(`/documents/${doc.id}`)} className="p-1.5 hover:bg-slate-100 rounded" title="View"><Eye className="w-4 h-4 text-slate-500" /></button>
                          <button onClick={(e) => downloadReport(doc.id, e)} className="p-1.5 hover:bg-slate-100 rounded" title="Download Report"><Download className="w-4 h-4 text-slate-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">Showing {docs.length} of {total} documents</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs">Previous</button>
                <button disabled={docs.length < 10} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
