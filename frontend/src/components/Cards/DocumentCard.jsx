import { FileText, ShieldCheck, Clock, XCircle, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
}

export default function DocumentCard({ document }) {
  const navigate = useNavigate()
  const status = statusConfig[document.status] || statusConfig.pending
  const StatusIcon = status.icon

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      cursor: 'pointer',
      transition: 'all var(--transition-base)',
    }}
      onClick={() => navigate(`/verification?doc=${document.id}`)}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-accent)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
          }}>
            <FileText size={18} />
          </div>
          <div>
            <p style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              maxWidth: '180px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {document.file_name}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {typeLabels[document.document_type] || document.document_type}
            </p>
          </div>
        </div>

        <span className={`badge ${status.badge}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-color)',
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {formatDate(document.uploaded_at)} • {formatSize(document.file_size)}
        </span>
        <Eye size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  )
}
