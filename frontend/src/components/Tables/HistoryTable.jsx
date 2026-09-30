import { FileText, ShieldCheck, Clock, XCircle, AlertTriangle, Eye } from 'lucide-react'

const typeLabels = {
  aadhaar: 'Aadhaar Card',
  pan_card: 'PAN Card',
  passport: 'Passport',
  driving_license: 'Driving License',
  voter_id: 'Voter ID',
}

const statusConfig = {
  pending: { badge: 'badge-pending', icon: Clock, label: 'Pending' },
  processing: { badge: 'badge-processing', icon: Clock, label: 'Processing' },
  verified: { badge: 'badge-verified', icon: ShieldCheck, label: 'Verified' },
  rejected: { badge: 'badge-rejected', icon: XCircle, label: 'Rejected' },
  manual_review: { badge: 'badge-warning', icon: AlertTriangle, label: 'Review' },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getConfidenceClass(score) {
  if (score >= 85) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

export default function HistoryTable({ data, onViewDetails }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <h3>No verification history</h3>
        <p>Upload and verify documents to see them here.</p>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Type</th>
            <th>Status</th>
            <th>Confidence</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const status = statusConfig[item.status] || statusConfig.pending
            const StatusIcon = status.icon
            const doc = item.documents || {}
            const confidence = item.confidence_score

            return (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      flexShrink: 0,
                    }}>
                      <FileText size={16} />
                    </div>
                    <span style={{
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 500,
                    }}>
                      {doc.file_name || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {typeLabels[doc.document_type] || doc.document_type || '—'}
                </td>
                <td>
                  <span className={`badge ${status.badge}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </td>
                <td>
                  {confidence != null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="confidence-meter" style={{ width: '60px' }}>
                        <div
                          className={`confidence-meter-fill ${getConfidenceClass(confidence)}`}
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: `var(--color-${getConfidenceClass(confidence) === 'high' ? 'success' : getConfidenceClass(confidence) === 'medium' ? 'warning' : 'error'})`,
                      }}>
                        {confidence}%
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {formatDate(item.created_at)}
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onViewDetails?.(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--accent-primary)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
