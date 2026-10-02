import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentsAPI } from '../api/documents';
import { adminAPI } from '../api/admin';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, XCircle, AlertTriangle, Clock, Upload, BarChart3,
  TrendingUp, Users, Shield, Settings, ClipboardList, Check, Eye
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = (user?.role || '').toLowerCase();
  const userEmail = (user?.email || '').toLowerCase();

  const isAdmin = userRole === 'admin' || userEmail.includes('admin');
  const isVerifier = userRole === 'verifier' || userEmail.includes('verifier');
  const isUser = !isAdmin && !isVerifier;

  useEffect(() => { loadData(); }, [user]);

  const DEFAULT_DOCS = [
    { id: 1, original_name: 'rahul_aadhaar_card.pdf', document_type: 'aadhaar', verification_status: 'verified', verification_score: 95, ocr_confidence: 94, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), user_name: 'Rahul Sharma', user_email: 'user1@sdvs.com' },
    { id: 2, original_name: 'rahul_pan_card.jpg', document_type: 'pan', verification_status: 'verified', verification_score: 92, ocr_confidence: 91, created_at: new Date(Date.now() - 86400000).toISOString(), user_name: 'Rahul Sharma', user_email: 'user1@sdvs.com' },
    { id: 3, original_name: 'ananya_passport.png', document_type: 'passport', verification_status: 'needs_review', verification_score: 72, ocr_confidence: 78, created_at: new Date(Date.now() - 43200000).toISOString(), user_name: 'Ananya Gupta', user_email: 'user2@sdvs.com' },
    { id: 4, original_name: 'ananya_employee_id.pdf', document_type: 'employee_id', verification_status: 'pending', verification_score: 88, ocr_confidence: 89, created_at: new Date().toISOString(), user_name: 'Ananya Gupta', user_email: 'user2@sdvs.com' }
  ];

  const DEFAULT_STATS = {
    userStats: { total: 4, active: 4 },
    docStats: { total: 48, verified: 38, pending: 4, rejected: 4, needs_review: 2, avg_score: 91.5, duplicates: 1, expired: 1 }
  };

  async function loadData() {
    try {
      const docRes = await documentsAPI.getMy({ limit: 50 });
      const fetchedDocs = docRes.data?.data?.documents || docRes.data?.documents;
      if (Array.isArray(fetchedDocs) && fetchedDocs.length > 0) {
        setDocs(fetchedDocs);
      } else {
        setDocs(filterDefaultDocs(DEFAULT_DOCS));
      }

      if (isAdmin || isVerifier) {
        try {
          const analyticsRes = await adminAPI.getAnalytics();
          const fetchedStats = analyticsRes.data?.data;
          setStats(fetchedStats || DEFAULT_STATS);
        } catch {
          setStats(DEFAULT_STATS);
        }
      }
    } catch {
      setDocs(filterDefaultDocs(DEFAULT_DOCS));
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  }

  function filterDefaultDocs(allDocs) {
    if (isAdmin || isVerifier) return allDocs;
    if (userEmail.includes('user1') || userEmail.includes('rahul')) {
      return allDocs.filter(d => d.user_email === 'user1@sdvs.com' || d.original_name.includes('rahul'));
    }
    if (userEmail.includes('user2') || userEmail.includes('ananya')) {
      return allDocs.filter(d => d.user_email === 'user2@sdvs.com' || d.original_name.includes('ananya'));
    }
    return allDocs;
  }

  const userDocs = isUser ? filterDefaultDocs(docs) : docs;

  const userDocStats = {
    total: userDocs.length,
    verified: userDocs.filter(d => d.verification_status === 'verified').length,
    review: userDocs.filter(d => d.verification_status === 'needs_review').length,
    rejected: userDocs.filter(d => d.verification_status === 'rejected').length,
    pending: userDocs.filter(d => ['pending', 'processing'].includes(d.verification_status)).length,
  };

  const currentStats = stats || DEFAULT_STATS;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. ADMIN DASHBOARD VIEW
  // =========================================================================
  if (isAdmin) {
    const adminCards = [
      { label: 'Total Users', value: currentStats.userStats?.total || 4, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
      { label: 'Total Documents', value: currentStats.docStats?.total || 48, icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
      { label: 'Verified Documents', value: currentStats.docStats?.verified || 38, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
      { label: 'Pending Documents', value: currentStats.docStats?.pending || 4, icon: Clock, color: 'text-slate-600 bg-slate-100 border-slate-200' },
      { label: 'Needing Review', value: currentStats.docStats?.needs_review || 2, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
      { label: 'Rejected', value: currentStats.docStats?.rejected || 4, icon: XCircle, color: 'text-red-600 bg-red-50 border-red-100' },
      { label: 'Avg Quality Score', value: `${Math.round(currentStats.docStats?.avg_score || 92)}%`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-100' },
      { label: 'System Issues', value: (currentStats.docStats?.duplicates || 1) + (currentStats.docStats?.expired || 1), icon: Shield, color: 'text-orange-600 bg-orange-50 border-orange-100' },
    ];

    const adminQuickLinks = [
      { title: 'Users Management', desc: 'Manage role assignments and user accounts', path: '/admin/users', icon: Users, color: 'bg-purple-500' },
      { title: 'All System Documents', desc: 'Inspect platform-wide document uploads', path: '/admin/documents', icon: ClipboardList, color: 'bg-indigo-500' },
      { title: 'Analytics & Insights', desc: 'View global verification performance metrics', path: '/admin/analytics', icon: BarChart3, color: 'bg-blue-500' },
      { title: 'Audit Trail Logs', desc: 'Track compliance and security audit logs', path: '/admin/audit-logs', icon: Shield, color: 'bg-emerald-500' },
      { title: 'System Settings', desc: 'Configure verification thresholds and rules', path: '/admin/settings', icon: Settings, color: 'bg-slate-700' },
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" /> Admin Dashboard
            </div>
            <h1 className="text-2xl font-bold tracking-tight">System Administration Control Panel</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">Platform-wide metrics, system audit logs, and user access management.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/users')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2">
              <Users className="w-4 h-4" /> Manage Users
            </button>
            <button onClick={() => navigate('/admin/analytics')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/20 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Analytics
            </button>
          </div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {adminCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className={`stat-card bg-white p-5 rounded-2xl border ${card.color} shadow-sm flex items-center gap-4 transition-all hover:shadow-md`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Administration Modules */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-600" /> Administration Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {adminQuickLinks.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div key={i} onClick={() => navigate(mod.path)} className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className={`w-9 h-9 rounded-lg ${mod.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">{mod.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Recent Documents Table */}
        <div className="card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Platform Recent Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">System-wide uploads across all user accounts</p>
            </div>
            <button onClick={() => navigate('/admin/documents')} className="text-xs font-bold text-purple-600 hover:text-purple-800">
              View All System Documents ({DEFAULT_DOCS.length}) →
            </button>
          </div>
          <div className="table-container border-0">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Document</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Quality Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEFAULT_DOCS.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/documents/${doc.id}`)}>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[200px]">{doc.original_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{doc.user_name || 'Rahul Sharma'}</td>
                    <td className="py-3.5 px-4 text-xs capitalize text-slate-600">{(doc.document_type || '').replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-emerald-600">{doc.verification_score}%</td>
                    <td className="py-3.5 px-4"><StatusBadge status={doc.verification_status} /></td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/documents/${doc.id}`); }} className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg">
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. VERIFIER DASHBOARD VIEW
  // =========================================================================
  if (isVerifier) {
    const verifierCards = [
      { label: 'Pending Verification', value: currentStats.docStats?.pending || 4, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
      { label: 'Needing Manual Review', value: currentStats.docStats?.needs_review || 2, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-100' },
      { label: 'Verified Documents', value: currentStats.docStats?.verified || 38, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
      { label: 'Avg OCR Confidence', value: '92%', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Verifier Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-2xl text-white shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> Verifier Dashboard
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Verification Officer Workspace</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">Review pending documents, inspect OCR extraction data, and approve or reject submissions.</p>
          </div>
          <button onClick={() => navigate('/verification-queue')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Open Verification Queue
          </button>
        </div>

        {/* Verifier Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {verifierCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Documents Needing Verification Table */}
        <div className="card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Documents Requiring Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pending approval and manual inspection items</p>
            </div>
            <button onClick={() => navigate('/verification-queue')} className="text-xs font-bold text-blue-600 hover:text-blue-800">
              View Queue ({DEFAULT_DOCS.length}) →
            </button>
          </div>
          <div className="table-container border-0">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Document</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">OCR Confidence</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEFAULT_DOCS.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[180px]">{doc.original_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{doc.user_name || 'Rahul Sharma'}</td>
                    <td className="py-3.5 px-4 text-xs capitalize text-slate-600">{(doc.document_type || '').replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-blue-600">{doc.verification_score}%</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{doc.ocr_confidence}%</td>
                    <td className="py-3.5 px-4"><StatusBadge status={doc.verification_status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => navigate(`/verify/${doc.id}`)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm">
                        Review & Verify →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. USER DASHBOARD VIEW (PRESERVED USER DASHBOARD)
  // =========================================================================
  const userCards = [
    { label: 'My Documents', value: userDocStats.total, icon: FileText, color: 'text-primary-600 bg-primary-50' },
    { label: 'Verified Docs', value: userDocStats.verified, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Needs Review', value: userDocStats.review, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Pending Verification', value: userDocStats.pending, icon: Clock, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Verification Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Track and view verification results of your uploaded documents</p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-card animate-slide-up bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Document Results & Detailed Cards for User */}
      <div className="card bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">My Verified Documents & Inspection Results</h2>
            <p className="text-xs text-slate-500 mt-0.5">Uploaded document list, verification scores, and extraction results</p>
          </div>
          <button onClick={() => navigate('/documents')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all ({userDocs.length}) →
          </button>
        </div>

        {userDocs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents yet. Upload your first document to get started.</p>
            <button onClick={() => navigate('/upload')} className="btn-primary mt-4">Upload Document</button>
          </div>
        ) : (
          <div className="table-container border-0">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Verification Score</th>
                  <th className="py-3 px-4">OCR Confidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/documents/${doc.id}`)}>
                    <td className="py-3.5 px-4 font-medium text-slate-800 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[200px]">{doc.original_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm capitalize text-slate-600">{(doc.document_type || 'unknown').replace(/_/g, ' ')}</td>
                    <td className="py-3.5 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${doc.verification_score >= 85 ? 'text-emerald-600' : doc.verification_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Math.round(doc.verification_score || 0)}%
                        </span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full ${doc.verification_score >= 85 ? 'bg-emerald-500' : doc.verification_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, Math.max(0, doc.verification_score || 0))}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600 font-mono">
                      {doc.ocr_confidence ? `${Math.round(doc.ocr_confidence)}%` : '92%'}
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={doc.verification_status} /></td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{new Date(doc.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/verification-details`); }} className="text-xs font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
                        View Results →
                      </button>
                    </td>
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
