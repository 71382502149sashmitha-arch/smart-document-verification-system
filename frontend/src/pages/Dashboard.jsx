import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentsAPI } from '../api/documents';
import { adminAPI } from '../api/admin';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, AlertTriangle, Clock, Upload, BarChart3, TrendingUp } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const docRes = await documentsAPI.getMy({ limit: 5 });
      setDocs(docRes.data.data.documents || []);
      if (user?.role === 'admin') {
        const analyticsRes = await adminAPI.getAnalytics();
        setStats(analyticsRes.data.data);
      }
    } catch {}
    setLoading(false);
  }

  const userDocStats = {
    total: docs.length,
    verified: docs.filter(d => d.verification_status === 'verified').length,
    review: docs.filter(d => d.verification_status === 'needs_review').length,
    rejected: docs.filter(d => d.verification_status === 'rejected').length,
    pending: docs.filter(d => ['pending', 'processing'].includes(d.verification_status)).length,
  };

  const cards = user?.role === 'admin' && stats ? [
    { label: 'Total Users', value: stats.userStats?.total || 0, icon: BarChart3, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Documents', value: stats.docStats?.total || 0, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Verified', value: stats.docStats?.verified || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Rejected', value: stats.docStats?.rejected || 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Needs Review', value: stats.docStats?.needs_review || 0, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Pending', value: stats.docStats?.pending || 0, icon: Clock, color: 'text-slate-600 bg-slate-100' },
    { label: 'Avg Score', value: Math.round(stats.docStats?.avg_score || 0), icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
    { label: 'Issues Found', value: stats.docStats?.duplicates + stats.docStats?.expired || 0, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
  ] : [
    { label: 'My Documents', value: userDocStats.total, icon: FileText, color: 'text-primary-600 bg-primary-50' },
    { label: 'Verified', value: userDocStats.verified, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Needs Review', value: userDocStats.review, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Rejected', value: userDocStats.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your document verification activity</p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Recent Documents</h2>
          <button onClick={() => navigate('/documents')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all →</button>
        </div>
        {docs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents yet. Upload your first document to get started.</p>
            <button onClick={() => navigate('/upload')} className="btn-primary mt-4">Upload Document</button>
          </div>
        ) : (
          <div className="table-container border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id} className="cursor-pointer" onClick={() => navigate(`/documents/${doc.id}`)}>
                    <td className="font-medium text-slate-800">{doc.original_name}</td>
                    <td className="capitalize">{(doc.document_type || 'unknown').replace(/_/g, ' ')}</td>
                    <td>
                      <span className={`font-semibold ${doc.verification_score >= 85 ? 'text-emerald-600' : doc.verification_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {Math.round(doc.verification_score || 0)}%
                      </span>
                    </td>
                    <td><StatusBadge status={doc.verification_status} /></td>
                    <td className="text-slate-500 text-sm">{new Date(doc.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
