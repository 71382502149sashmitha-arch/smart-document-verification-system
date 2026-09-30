import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verificationAPI } from '../api/verification';
import { documentsAPI } from '../api/documents';
import { getApiUrl } from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { FileText, CheckCircle, XCircle, AlertTriangle, Image } from 'lucide-react';
import { toast } from 'react-toastify';

export default function VerifyDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const res = await verificationAPI.getById(id);
      setData(res.data.data);
    } catch {
      toast.error('Failed to load document for verification');
      navigate('/verification-queue');
    }
    setLoading(false);
  }

  async function handleDecision(decision) {
    try {
      await verificationAPI.submitDecision(id, { decision, remarks });
      toast.success(`Document ${decision} successfully`);
      navigate('/verification-queue');
    } catch {
      toast.error('Failed to submit decision');
    }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>;
  if (!data) return null;

  const { document: doc, extractedFields, validationResults, issues } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Verify Document #{doc.id}</h1>
          <p className="text-slate-500 text-sm capitalize">{(doc.document_type || 'unknown').replace(/_/g, ' ')} • Uploaded by {doc.user_name}</p>
        </div>
        <StatusBadge status={doc.verification_status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Document View */}
        <div className="card flex flex-col h-[700px]">
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
              />
            )}
          </div>
        </div>

        {/* Right: Data & Actions */}
        <div className="flex flex-col gap-6">
          
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Extracted Fields</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {extractedFields?.map(f => {
                const validation = validationResults?.find(v => v.field_name === f.field_name);
                const statusColor = validation?.status === 'INVALID' ? 'text-red-600 bg-red-50' : validation?.status === 'MISSING' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
                return (
                  <div key={f.id} className="flex justify-between items-center p-2 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 capitalize">{(f.field_name || '').replace(/_/g, ' ')}</p>
                      <p className="text-sm font-medium">{f.is_sensitive ? f.display_value : f.field_value}</p>
                    </div>
                    {validation && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor}`}>
                        {validation.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Issues Found</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {issues?.length === 0 ? (
                <p className="text-sm text-slate-500 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> No issues detected automatically.</p>
              ) : (
                issues?.map(issue => (
                  <div key={issue.id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{issue.title}</p>
                      <p className="text-xs text-red-600 mt-0.5">{issue.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-5 bg-slate-50 border-primary-100">
            <h3 className="font-semibold text-slate-800 mb-3">Verification Decision</h3>
            <textarea
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm mb-4"
              rows={3}
              placeholder="Add remarks for this decision (required for rejection/flagging)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => handleDecision('verified')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => handleDecision('rejected')} disabled={!remarks} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => handleDecision('flagged')} disabled={!remarks} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Flag
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
