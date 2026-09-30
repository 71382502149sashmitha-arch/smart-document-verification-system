import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, XCircle, Clock, AlertTriangle, Eye, Scan,
  CheckCircle2, FileText, Fingerprint, QrCode, Upload
} from 'lucide-react'
import Loader from '../../components/Loader/Loader'
import Modal from '../../components/Modal/Modal'
import { verificationAPI } from '../../api/verification'
import { documentsAPI } from '../../api/documents'

const typeLabels = {
  aadhaar: 'Aadhaar Card',
  pan_card: 'PAN Card',
  passport: 'Passport',
  driving_license: 'Driving License',
  voter_id: 'Voter ID',
}

const statusConfig = {
  pending: { color: 'var(--color-pending)', icon: Clock, label: 'Pending Verification', bg: 'var(--color-pending-bg)' },
  processing: { color: 'var(--color-info)', icon: Scan, label: 'Processing...', bg: 'var(--color-info-bg)' },
  verified: { color: 'var(--color-success)', icon: ShieldCheck, label: 'Verified', bg: 'var(--color-success-bg)' },
  rejected: { color: 'var(--color-error)', icon: XCircle, label: 'Rejected', bg: 'var(--color-error-bg)' },
  manual_review: { color: 'var(--color-warning)', icon: AlertTriangle, label: 'Manual Review Required', bg: 'var(--color-warning-bg)' },
}

function getConfidenceClass(score) {
  if (score >= 85) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

export default function Verification() {
  const [searchParams] = useSearchParams()
  const docId = searchParams.get('doc')
  const [document, setDocument] = useState(null)
  const [verification, setVerification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (docId) loadVerification()
    else setLoading(false)
  }, [docId])

  const loadVerification = async () => {
    try {
      setLoading(true)
      const [docRes, verRes] = await Promise.all([
        documentsAPI.get(docId).catch(() => null),
        verificationAPI.getStatus(docId).catch(() => null),
      ])
      if (docRes?.document) setDocument(docRes.document)
      if (verRes?.verification) setVerification(verRes.verification)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const triggerVerification = async () => {
    if (!docId) return
    setVerifying(true)
    try {
      const result = await verificationAPI.verify(docId)
      setVerification(result.verification)
      // Also refresh document
      const docRes = await documentsAPI.get(docId)
      if (docRes?.document) setDocument(docRes.document)
    } catch (err) {
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return <Loader size="lg" text="Loading verification details..." />

  if (!docId) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1>Verification</h1>
          <p>View document verification results</p>
        </div>
        <div className="card empty-state">
          <ShieldCheck size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Document Selected</h3>
          <p style={{ marginBottom: '16px' }}>Upload a document or select one from your history to view verification details.</p>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Upload size={16} />
            Upload Document
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[verification?.status || document?.status || 'pending']
  const StatusIcon = status.icon
  const confidence = verification?.confidence_score
  const ocrData = verification?.ocr_data || {}
  const fraudIndicators = verification?.fraud_indicators || []
  const qrValidation = verification?.qr_validation || {}

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Verification Results</h1>
        <p>{document?.file_name} • {typeLabels[document?.document_type] || document?.document_type}</p>
      </div>

      {error && (
        <div style={{
          background: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginBottom: '20px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          {error}
        </div>
      )}

      <div className="verification-grid">
        {/* Left: Confidence Score */}
        <div className="card verification-score-card animate-slide-up">
          {/* Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            background: status.bg,
            color: status.color,
            fontWeight: 600,
            fontSize: '0.88rem',
            marginBottom: '24px',
          }}>
            <StatusIcon size={18} />
            {status.label}
          </div>

          {/* Confidence Score */}
          {confidence != null ? (
            <>
              <p className={`confidence-value ${getConfidenceClass(confidence)}`}>
                {confidence}%
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px', marginBottom: '16px' }}>
                Confidence Score
              </p>
              <div className="confidence-meter" style={{ width: '80%', height: '10px' }}>
                <div
                  className={`confidence-meter-fill ${getConfidenceClass(confidence)}`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Clock size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Verification not yet completed</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
                onClick={triggerVerification}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Start Verification'}
              </button>
            </div>
          )}

          {/* Face Match Score */}
          {verification?.face_match_score != null && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '24px',
              padding: '12px 18px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              width: '80%',
            }}>
              <Fingerprint size={20} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Face Match</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {verification.face_match_score}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="verification-details-card">
          {/* OCR Data */}
          {Object.keys(ocrData).length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} style={{ color: 'var(--accent-primary)' }} />
                Extracted Information (OCR)
              </h3>
              <div className="ocr-data-grid">
                {Object.entries(ocrData).map(([key, value]) => {
                  if (typeof value === 'boolean') {
                    return (
                      <div className="ocr-field" key={key}>
                        <p className="ocr-field-label">{key.replace(/_/g, ' ')}</p>
                        <p className="ocr-field-value" style={{
                          color: value ? 'var(--color-success)' : 'var(--color-error)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          {value ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {value ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )
                  }
                  return (
                    <div className="ocr-field" key={key}>
                      <p className="ocr-field-label">{key.replace(/_/g, ' ')}</p>
                      <p className="ocr-field-value">{String(value)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* QR Validation */}
          {Object.keys(qrValidation).length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} style={{ color: 'var(--accent-secondary)' }} />
                QR Code Validation
              </h3>
              <div className="ocr-data-grid">
                {Object.entries(qrValidation).map(([key, value]) => (
                  <div className="ocr-field" key={key}>
                    <p className="ocr-field-label">{key.replace(/_/g, ' ')}</p>
                    <p className="ocr-field-value" style={{
                      color: value ? 'var(--color-success)' : 'var(--color-error)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {value ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {value ? 'Valid' : 'Invalid'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fraud Indicators */}
          {fraudIndicators.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                Fraud Analysis
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fraudIndicators.map((indicator, i) => (
                  <div className={`fraud-indicator ${indicator.severity}`} key={i}>
                    <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        {indicator.type} — {indicator.severity} severity
                      </p>
                      <p style={{ fontSize: '0.82rem', opacity: 0.85 }}>{indicator.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          {verification?.remarks && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '8px' }}>Remarks</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{verification.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
