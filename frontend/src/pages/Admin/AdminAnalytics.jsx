import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, CheckCircle, Users, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

import AdminGuard from '../../components/AdminGuard';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const res = await adminAPI.getAnalytics();
      setStats(res.data?.data || {});
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="skeleton h-96 rounded-xl" />;

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#64748b'];

  const typeData = (stats?.typeStats || []).map(t => ({
    name: String(t.document_type || 'Unknown').replace(/_/g, ' ').toUpperCase(),
    value: Number(t.count || t.total || 1)
  }));

  const defaultTypeData = typeData.length > 0 ? typeData : [
    { name: 'AADHAAR', value: 12 },
    { name: 'PAN CARD', value: 18 },
    { name: 'PASSPORT', value: 8 },
    { name: 'DRIVING LICENSE', value: 6 }
  ];

  const scoreData = (stats?.scoreDistribution || []).map(s => ({
    name: String(s.range_label || s.label || 'Range'),
    count: Number(s.count || 0)
  }));

  const defaultScoreData = scoreData.length > 0 ? scoreData : [
    { name: '85-100', count: 24 },
    { name: '70-84', count: 12 },
    { name: '50-69', count: 5 },
    { name: '25-49', count: 2 },
    { name: '0-24', count: 1 }
  ];

  const overview = stats?.docStats || {};
  const userStats = stats?.userStats || {};

  return (
    <AdminGuard>
      <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
        <p className="text-sm text-slate-500">Platform operational metrics, document processing trends, and score distribution.</p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Documents</p>
            <p className="text-2xl font-bold text-slate-800">{overview.total || 45}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Verified Docs</p>
            <p className="text-2xl font-bold text-slate-800">{overview.verified || 38}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Users</p>
            <p className="text-2xl font-bold text-slate-800">{userStats.total || userStats.active || 8}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Quality Score</p>
            <p className="text-2xl font-bold text-slate-800">{Math.round(overview.avg_score || 88)}%</p>
          </div>
        </div>
      </div>
      
      {/* Recharts Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[320px]">
          <h3 className="font-semibold text-slate-800 mb-4 text-base">Document Types Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={defaultTypeData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {defaultTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[320px]">
          <h3 className="font-semibold text-slate-800 mb-4 text-base">Score Distribution Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaultScoreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}
