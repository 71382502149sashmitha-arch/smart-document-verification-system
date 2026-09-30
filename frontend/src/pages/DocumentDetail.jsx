import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { documentsAPI } from '../api/documents';
import { getApiUrl } from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { Download, FileText, CheckCircle, XCircle, AlertTriangle, Shield, Clock, Image, Search, BarChart3, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const TABS = ['Overview', 'Extracted Info', 'Validation', 'Issues', 'OCR Text', 'Security', 'History'];

export default function DocumentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => { loadDocument(); }, [id]);

  async function loadDocument() {
    try {
      const res = await documentsAPI.getById(id);
      setData(res.data.data);
    } catch { toast.error('Failed to load document'); }
    setLoading(false);
  }

  async function downloadReport() {
    try {
      const res = await documentsAPI.getReport(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `verification_report_${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download report'); }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>;
  if (!data) return <div className="text-center py-12"><p className="text-slate-500">Document not found</p></div>;

  const { document: doc, extractedFields, validationResults, issues, verificationResult, verificationHistory } = data;

  const scoreColor = (doc.verification_score || 0) >= 85 ? 'text-emerald-600' : (doc.verification_score || 0) >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document #{doc.id}</h1>
          <p className="text-slate-500 text-sm capitalize">{(doc.document_type || 'unknown').replace(/_/g, ' ')} • {doc.original_name}</p>
          {doc.is_demo && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Demo/Synthetic Data</span>}
        </div>
        <button onClick={downloadReport} className="btn-primary"><Download className="w-4 h-4" /> Download Report</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="stat-card items-center text-center"><p className={`text-3xl font-bold ${scoreColor}`}>{Math.round(doc.verification_score || 0)}</p><p className="text-xs text-slate-500">Score</p></div>
        <div className="stat-card items-center text-center"><StatusBadge status={doc.verification_status} /><p className="text-xs text-slate-500 mt-1">Status</p></div>
        <div className="stat-card items-center text-center"><p className="text-xl font-bold text-slate-700">{Math.round(doc.classification_confidence || 0)}%</p><p className="text-xs text-slate-500">Classification</p></div>
        <div className="stat-card items-center text-center"><p className="text-xl font-bold text-slate-700">{Math.round(doc.image_quality_score || 0)}/100</p><p className="text-xs text-slate-500">Image Quality</p></div>
        <div className="stat-card items-center text-center"><p className="text-xl font-bold text-slate-700">{Math.round(doc.ocr_confidence || 0)}%</p><p className="text-xs text-slate-500">OCR Confidence</p></div>
        <div className="stat-card items-center text-center"><p className="text-xs text-slate-600">{new Date(doc.created_at).toLocaleDateString('en-IN')}</p><p className="text-xs text-slate-500">Upload Date</p></div>
      </div>

      {/* Layout with Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Document Preview */}
        <div className="lg:col-span-1">
          <div className="card flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Image className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Original Document</h2>
            </div>
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-2 rounded-b-xl">
              {doc.mime_type?.includes('pdf') ? (
                <iframe 
                  src={`${getApiUrl()}/documents/${doc.id}/file`} 
                  className="w-full h-full border-0 rounded-lg"
                  title="Document Preview"
                />
              ) : (
                <img 
                  src={`${getApiUrl()}/documents/${doc.id}/file`} 
                  alt="Document Preview" 
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              )}
              <div className="hidden absolute inset-0 flex-col items-center justify-center text-slate-400">
                <FileText className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">Preview not available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-slate-200 flex gap-0 overflow-x-auto">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} className={`tab whitespace-nowrap ${activeTab === i ? 'active' : ''}`}>{tab}</button>
            ))}
          </div>

          <div className="card p-6 min-h-[500px]">
            {activeTab === 0 && <OverviewTab doc={doc} vr={verificationResult} />}
            {activeTab === 1 && <ExtractedInfoTab fields={extractedFields} />}
            {activeTab === 2 && <ValidationTab results={validationResults} />}
            {activeTab === 3 && <IssuesTab issues={issues} />}
            {activeTab === 4 && <OcrTab text={doc.ocr_raw_text} />}
            {activeTab === 5 && <SecurityTab doc={doc} />}
            {activeTab === 6 && <HistoryTab history={verificationHistory} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ doc, vr }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Document Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ['Document ID', `DOC-${String(doc.id).padStart(6, '0')}`],
            ['Document Type', (doc.document_type || 'unknown').replace(/_/g, ' ')],
            ['File Name', doc.original_name],
            ['File Size', `${(doc.file_size / 1024).toFixed(1)} KB`],
            ['File Type', doc.mime_type],
            ['Pages', doc.page_count],
            ['Upload Date', new Date(doc.created_at).toLocaleString('en-IN')],
            ['Processing Status', doc.processing_status],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm font-medium text-slate-800 capitalize">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
      {vr && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Score Breakdown</h3>
          <div className="space-y-2">
            {[
              ['Completeness', vr.completeness_score, 40],
              ['Format Validity', vr.format_score, 35],
              ['Duplicate Check', vr.duplicate_score, 15],
              ['Expiry Check', vr.expiry_score, 10],
            ].map(([label, score, weight]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-36">{label} ({weight}%)</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score || 0}%` }} />
                </div>
                <span className="text-sm font-semibold w-12 text-right">{Math.round(score || 0)}%</span>
              </div>
            ))}
          </div>
          {vr.remarks && <div className="mt-4 p-3 bg-slate-50 rounded-lg"><p className="text-sm text-slate-600"><b>Remarks:</b> {vr.remarks}</p></div>}
        </div>
      )}
    </div>
  );
}

function ExtractedInfoTab({ fields }) {
  if (!fields || fields.length === 0) return <p className="text-slate-500 text-center py-8">No fields extracted</p>;
  return (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Field</th><th>Value</th><th>Type</th><th>Confidence</th></tr></thead>
        <tbody>
          {fields.map(f => (
            <tr key={f.id}>
              <td className="font-medium capitalize">{(f.field_name || '').replace(/_/g, ' ')}</td>
              <td>{f.is_sensitive ? (f.display_value || '****') : (f.field_value || 'N/A')}</td>
              <td className="text-slate-500 capitalize">{f.field_type}</td>
              <td><span className={`font-semibold ${f.confidence >= 80 ? 'text-emerald-600' : f.confidence >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{Math.round(f.confidence || 0)}%</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValidationTab({ results }) {
  if (!results || results.length === 0) return <p className="text-slate-500 text-center py-8">No validation results</p>;
  const statusIcon = { VALID: <CheckCircle className="w-4 h-4 text-emerald-500" />, INVALID: <XCircle className="w-4 h-4 text-red-500" />, MISSING: <AlertTriangle className="w-4 h-4 text-amber-500" />, WARNING: <AlertTriangle className="w-4 h-4 text-orange-500" /> };
  return (
    <div className="table-container">
      <table className="data-table">
        <thead><tr><th>Field</th><th>Value</th><th>Status</th><th>Message</th></tr></thead>
        <tbody>
          {results.map(r => (
            <tr key={r.id}>
              <td className="font-medium capitalize">{(r.field_name || '').replace(/_/g, ' ')}</td>
              <td className="max-w-[200px] truncate">{r.extracted_value || 'N/A'}</td>
              <td><div className="flex items-center gap-1.5">{statusIcon[r.status] || null}<span className="font-semibold text-xs">{r.status}</span></div></td>
              <td className="text-sm text-slate-600">{r.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IssuesTab({ issues }) {
  if (!issues || issues.length === 0) return <div className="text-center py-8"><CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-2" /><p className="text-slate-500">No issues detected</p></div>;
  const severityColors = { critical: 'border-red-500 bg-red-50', high: 'border-orange-500 bg-orange-50', medium: 'border-amber-500 bg-amber-50', low: 'border-blue-500 bg-blue-50', info: 'border-slate-300 bg-slate-50' };
  return (
    <div className="space-y-3">
      {issues.map(issue => (
        <div key={issue.id} className={`p-4 rounded-lg border-l-4 ${severityColors[issue.severity] || severityColors.info}`}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800">{issue.title}</h4>
            <span className={`text-xs font-bold uppercase ${issue.severity === 'critical' ? 'text-red-600' : issue.severity === 'high' ? 'text-orange-600' : 'text-amber-600'}`}>{issue.severity}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
          <span className="text-xs text-slate-400 capitalize mt-1 inline-block">{(issue.category || '').replace(/_/g, ' ')}</span>
        </div>
      ))}
    </div>
  );
}

function OcrTab({ text }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Raw OCR Text</h3>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto font-mono">
        {text || 'No OCR text available'}
      </pre>
    </div>
  );
}

function SecurityTab({ doc }) {
  const tamperingIndicators = doc.tampering_indicators ? (typeof doc.tampering_indicators === 'string' ? JSON.parse(doc.tampering_indicators) : doc.tampering_indicators) : [];
  const qualityDetails = doc.image_quality_details ? (typeof doc.image_quality_details === 'string' ? JSON.parse(doc.image_quality_details) : doc.image_quality_details) : {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Security & Integrity Checks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ['QR Code', doc.qr_detected ? 'Detected' : 'Not Detected'],
            ['Barcode', doc.barcode_detected ? 'Detected' : 'Not Detected'],
            ['Duplicate Check', doc.is_duplicate ? '⚠️ Duplicate Found' : '✅ No Duplicate'],
            ['Expiry Check', doc.is_expired ? '⚠️ Expired' : '✅ Not Expired / N/A'],
            ['Tampering Risk', (doc.tampering_risk || 'none').toUpperCase()],
            ['Image Quality', `${Math.round(doc.image_quality_score || 0)}/100`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm font-medium text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {tamperingIndicators.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-2">Potential Tampering Indicators</h4>
          {tamperingIndicators.map((ti, i) => (
            <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2">
              <p className="text-sm font-medium text-amber-800">[{ti.severity}] {ti.type}</p>
              <p className="text-sm text-amber-700">{ti.message}</p>
            </div>
          ))}
        </div>
      )}

      {Object.keys(qualityDetails).length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-2">Image Quality Details</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(qualityDetails).map(([k, v]) => (
              <div key={k} className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-xs text-slate-500 capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="text-xs font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ history }) {
  if (!history || history.length === 0) return <p className="text-slate-500 text-center py-8">No verification history</p>;
  return (
    <div className="space-y-0">
      {history.map((h, i) => (
        <div key={h.id} className="flex gap-4 pb-6 relative">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${i === history.length - 1 ? 'bg-primary-500' : 'bg-slate-300'}`} />
            {i < history.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{(h.action || '').replace(/_/g, ' ')}</p>
            {h.from_status && <p className="text-xs text-slate-500">{h.from_status} → {h.to_status}</p>}
            {h.actor_name && <p className="text-xs text-slate-400">by {h.actor_name}</p>}
            {h.remarks && <p className="text-xs text-slate-600 mt-0.5">{h.remarks}</p>}
            <p className="text-xs text-slate-400 mt-0.5">{new Date(h.created_at).toLocaleString('en-IN')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
