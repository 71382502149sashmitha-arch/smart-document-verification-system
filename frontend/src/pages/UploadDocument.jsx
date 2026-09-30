import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { documentsAPI } from '../api/documents';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' }, { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' }, { value: 'driving_license', label: 'Driving License' },
  { value: 'college_certificate', label: 'College Certificate' }, { value: 'marksheet', label: 'Marksheet' },
  { value: 'birth_certificate', label: 'Birth Certificate' }, { value: 'employee_id', label: 'Employee ID' },
  { value: 'resume', label: 'Resume' }, { value: 'invoice', label: 'Invoice' },
  { value: 'bank_statement', label: 'Bank Statement' }, { value: 'unknown', label: 'Auto-Detect' },
];

const STAGES = [
  'Uploading', 'Reading document', 'OCR processing', 'Identifying document',
  'Extracting fields', 'Validating', 'Checking duplicates', 'Calculating score', 'Generating result'
];

export default function UploadDocument() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('unknown');
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) { setFile(accepted[0]); setError(''); setResult(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'application/pdf': [] },
    maxSize: 16 * 1024 * 1024,
    multiple: false,
    onDropRejected: (rej) => {
      const err = rej[0]?.errors?.[0];
      if (err?.code === 'file-too-large') setError('File too large. Max 16MB.');
      else setError(err?.message || 'Invalid file');
    },
  });

  async function handleUpload() {
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    setError('');

    // Simulate processing stages
    for (let i = 0; i <= 1; i++) {
      setStage(i);
      await new Promise(r => setTimeout(r, 300));
    }

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', docType);

      const res = await documentsAPI.upload(formData);
      const docId = res.data?.data?.documentId || res.data?.documentId || 1;

      // Continue showing stages
      for (let i = 2; i < STAGES.length; i++) {
        setStage(i);
        await new Promise(r => setTimeout(r, 800));
      }

      setResult({ id: docId, status: 'success' });
      toast.success('Document uploaded and processing started!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setStage(-1);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Document</h1>
        <p className="text-slate-500 text-sm mt-1">Upload a document for automated verification</p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
          <select value={docType} onChange={e => setDocType(e.target.value)} className="input-field" disabled={uploading}>
            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <p className="text-xs text-slate-400 mt-1">Select "Auto-Detect" to let the system identify the document type.</p>
        </div>

        {/* Dropzone */}
        {!result && (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50'} ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-primary-500" />
                <div className="text-left">
                  <p className="font-medium text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Drag & drop your document here</p>
                <p className="text-sm text-slate-400 mt-1">or click to browse. Supports JPEG, PNG, WebP, PDF (max 16MB)</p>
              </>
            )}
          </div>
        )}

        {/* Processing Stages */}
        {uploading && stage >= 0 && (
          <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
            {STAGES.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm ${i < stage ? 'text-emerald-600' : i === stage ? 'text-primary-600 font-medium' : 'text-slate-400'}`}>
                {i < stage ? <CheckCircle className="w-4 h-4" /> : i === stage ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                {s}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="text-center p-6 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Document Uploaded Successfully!</h3>
            <p className="text-slate-500 text-sm mt-1">Your document is being processed. You will be notified when verification is complete.</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => navigate(`/documents/${result.id}`)} className="btn-primary">View Document</button>
              <button onClick={() => { setFile(null); setResult(null); }} className="btn-secondary">Upload Another</button>
            </div>
          </div>
        )}

        {!result && (
          <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary w-full py-3">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Upload className="w-4 h-4" /> Upload & Verify</>}
          </button>
        )}
      </div>
    </div>
  );
}
