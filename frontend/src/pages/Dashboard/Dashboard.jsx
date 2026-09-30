import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, ShieldCheck, Clock, XCircle, Activity, TrendingUp, Upload
} from 'lucide-react'
import StatsCard from '../../components/Cards/StatsCard'
import DocumentCard from '../../components/Cards/DocumentCard'
import VerificationChart from '../../components/Charts/VerificationChart'
import Loader from '../../components/Loader/Loader'
import { adminAPI } from '../../api/admin'
import { documentsAPI } from '../../api/documents'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [statsRes, recentRes] = await Promise.all([
        dashboardAPI.getStats().catch(() => ({ stats: null })),
        dashboardAPI.getRecent().catch(() => ({ recent_documents: [] })),
      ])
      setStats(statsRes.stats)
      setRecentDocs(recentRes.recent_documents || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Use mock data while no API is connected
  const docStats = stats?.documents || { total: 0, verified: 0, pending: 0, rejected: 0 }
  const verifyStats = stats?.verifications || { avg_confidence: 0 }

  if (loading) return <Loader size="lg" text="Loading dashboard..." />

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your document verification activity</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid stagger-children">
        <StatsCard
          title="Total Documents"
          value={docStats.total}
          icon={FileText}
          color="primary"
          trend="up"
          trendValue={12}
        />
        <StatsCard
          title="Verified"
          value={docStats.verified}
          icon={ShieldCheck}
          color="success"
          trend="up"
          trendValue={8}
        />
        <StatsCard
          title="Pending"
          value={docStats.pending}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Rejected"
          value={docStats.rejected}
          icon={XCircle}
          color="danger"
          trend="down"
          trendValue={3}
        />
      </div>

      {/* Charts & Recent Docs */}
      <div className="content-grid">
        {/* Verification Trends Chart */}
        <VerificationChart />

        {/* Recent Documents */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Documents</h3>
              <p className="card-subtitle">Latest uploaded documents</p>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => navigate('/upload')}
            >
              <Upload size={14} />
              Upload
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))
            ) : (
              <div className="empty-state" style={{ padding: '30px' }}>
                <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <h3>No documents yet</h3>
                <p style={{ marginBottom: '14px' }}>Upload your first document to get started</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/upload')}
                >
                  <Upload size={14} />
                  Upload Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bottom Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px',
      }}>
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '18px 20px',
        }}>
          <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg Confidence</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {verifyStats.avg_confidence || 0}%
            </p>
          </div>
        </div>
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '18px 20px',
        }}>
          <TrendingUp size={20} style={{ color: 'var(--color-success)' }} />
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Success Rate</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {docStats.total > 0 ? Math.round((docStats.verified / docStats.total) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '18px 20px',
        }}>
          <ShieldCheck size={20} style={{ color: 'var(--accent-secondary)' }} />
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Verifications</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {verifyStats.total || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
