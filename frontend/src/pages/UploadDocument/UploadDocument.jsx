import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Upload, CloudUpload, FileText, X, CheckCircle2, AlertCircle, Image
} from 'lucide-react'
import { documentsAPI } from '../../api/documents'
import { verificationAPI } from '../../api/verification'

const documentTypes = [
  { value: 'aadhaar', label: 'Aadhaar Card', description: 'Indian unique identity card' },
  { value: 'pan_card', label: 'PAN Card', description: 'Permanent Account Number card' },
  { value: 'passport', label: 'Passport', description: 'International travel document' },
  { value: 'driving_license', label: 'Driving License', description: 'Vehicle driving permit' },
  { value: 'voter_id', label: 'Voter ID', description: 'Election Commission identity card' },
]

export default function UploadDocument() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [documentType, setDocumentType] = useState('')
  const [uploading, setUploading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('')

    if (rejectedFiles.length > 0) {
      setError('Invalid file type. Please upload PNG, JPG, JPEG, PDF, or WebP files.')
      return
    }

    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        setError('File too large. Maximum size is 16MB.')
        return
      }
      setSelectedFile(file)
      setUploadResult(null)

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }
    if (!documentType) {
      setError('Please select a document type')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('documentType', documentType)

      const res = await documentsAPI.upload(formData)
      const docData = res.data?.data || res.data || res
      setUploadResult(docData)

      // Auto-trigger verification
      setVerifying(true)
      try {
        await verificationAPI.verify(result.document.id)
      } catch {
        // Verification might fail, but upload succeeded
      }
      setVerifying(false)

    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreview(null)
    setDocumentType('')
    setUploadResult(null)
    setError('')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Upload Document</h1>
        <p>Upload a document for AI-powered verification</p>
      </div>

      {/* Success State */}
      {uploadResult && (
        <div className="card animate-fade-in-scale" style={{
          textAlign: 'center',
          padding: '40px',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-success-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
            Document Uploaded Successfully!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>
            {verifying ? 'AI verification in progress...' : 'Your document has been submitted for verification.'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Document ID: <code style={{
              background: 'var(--bg-tertiary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
            }}>{uploadResult.id?.slice(0, 8)}...</code>
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/verification?doc=${uploadResult.id}`)}
            >
              View Verification
            </button>
            <button className="btn btn-secondary" onClick={resetForm}>
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!uploadResult && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Left: Drop Zone */}
          <div>
            <div
              {...getRootProps()}
              className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
            >
              <input {...getInputProps()} id="file-upload-input" />

              {selectedFile ? (
                <div className="animate-fade-in">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="doc-preview"
                      style={{ margin: '0 auto 16px', maxHeight: '240px' }}
                    />
                  ) : (
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}>
                      <FileText size={32} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                  )}

                  <h3>{selectedFile.name}</h3>
                  <p>{formatSize(selectedFile.size)} • {selectedFile.type}</p>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '12px', color: 'var(--color-error)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      resetForm()
                    }}
                  >
                    <X size={14} />
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-zone-icon">
                    <CloudUpload size={32} />
                  </div>
                  <h3>
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your document'}
                  </h3>
                  <p>
                    or <span className="browse-link">browse files</span> from your computer
                  </p>
                  <p style={{ marginTop: '12px', fontSize: '0.78rem' }}>
                    Supports PNG, JPG, JPEG, PDF, WebP • Max 16MB
                  </p>
                </>
              )}
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '14px',
                padding: '10px 14px',
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          {/* Right: Document Type & Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Document Type</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {documentTypes.map((type) => (
                  <label
                    key={type.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${documentType === type.value ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: documentType === type.value ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseOver={(e) => {
                      if (documentType !== type.value) {
                        e.currentTarget.style.borderColor = 'var(--border-color-hover)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (documentType !== type.value) {
                        e.currentTarget.style.borderColor = 'var(--border-color)'
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="documentType"
                      value={type.value}
                      checked={documentType === type.value}
                      onChange={(e) => setDocumentType(e.target.value)}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: `2px solid ${documentType === type.value ? 'var(--accent-primary)' : 'var(--text-muted)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all var(--transition-fast)',
                    }}>
                      {documentType === type.value && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--accent-primary)',
                        }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {type.label}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {type.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handleUpload}
              disabled={!selectedFile || !documentType || uploading}
              id="upload-submit"
            >
              {uploading ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload size={18} />
                  Upload & Verify
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
