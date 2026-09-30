import { useEffect, useState } from 'react';
import { verificationAPI } from '../api/verification';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { FileText, CheckCircle2, RefreshCw, Eye, Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

export default function VerificationQueue() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const isUserRole = user?.role === 'user';

  useEffect(() => { loadQueue(); }, []);

  async function loadQueue(isManual = false) {
    if (isManual) setRefreshing(true);
    try {
      const res = await verificationAPI.getQueue();
      setDocs(res.data.data.documents || []);
      if (isManual) toast.success('Queue refreshed!');
    } catch {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function getPipelineStep(doc) {
    const pStatus = doc.processing_status || 'completed';
    if (pStatus === 'queued') return 1;
    if (pStatus === 'preprocessing') return 2;
    if (['ocr_processing', 'classifying'].includes(pStatus)) return 3;
    if (['extracting', 'validating', 'scoring'].includes(pStatus)) return 4;
    return 5;
  }

  const PIPELINE_STEPS = [
    { number: 1, title: 'Upload', desc: 'Received & Stored' },
    { number: 2, title: 'Quality Check', desc: 'Blur & Tampering' },
    { number: 3, title: 'OCR & Classify', desc: 'Text & Type Match' },
    { number: 4, title: 'Validation', desc: 'Rules & Checksum' },
    { number: 5, title: 'Decision', desc: 'Verification Finalized' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-10 bg-slate-100 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isUserRole ? 'Verification Process Tracker' : 'Verification Queue'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isUserRole
              ? 'Real-time step-by-step verification pipeline status for your documents'
              : 'Documents pending verification and manual review'}
          </p>
        </div>
        <button
          onClick={() => loadQueue(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-primary-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Documents in Queue</h3>
          <p className="text-slate-500 text-sm mt-1">
            {isUserRole ? 'You have no documents currently being processed.' : 'The queue is clear! All documents have been reviewed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map(doc => {
            const currentStep = getPipelineStep(doc);
            const isCompleted = doc.processing_status === 'completed';
            const isFailed = doc.processing_status === 'failed';

            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Document Header Line */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-800">{doc.original_name}</h3>
                        <span className="text-xs uppercase font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {(doc.document_type || 'unknown').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Submitted: {new Date(doc.created_at).toLocaleString('en-IN')}
                        {!isUserRole && doc.user_name && ` • User: ${doc.user_name} (${doc.user_email})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Score</p>
                      <p className={`text-base font-extrabold ${doc.verification_score >= 85 ? 'text-emerald-600' : doc.verification_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {Math.round(doc.verification_score || 0)}%
                      </p>
                    </div>
                    <StatusBadge status={doc.verification_status} />
                    <button
                      onClick={() => navigate(isUserRole ? `/documents/${doc.id}` : `/verify/${doc.id}`)}
                      className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isUserRole ? 'Details' : 'Review'}</span>
                    </button>
                  </div>
                </div>

                {/* Pipeline Step Tracker */}
                <div className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                      Verification Pipeline Status
                    </span>
                    <span className="text-xs font-semibold text-primary-600">
                      {isCompleted
                        ? 'Completed (100%)'
                        : isFailed
                        ? 'Failed'
                        : `Step ${currentStep} of 5 in Progress`}
                    </span>
                  </div>

                  {/* Stepper Grid */}
                  <div className="grid grid-cols-5 gap-2 relative mt-4">
                    {PIPELINE_STEPS.map((step) => {
                      const stepDone = isCompleted || step.number < currentStep;
                      const stepCurrent = !isCompleted && !isFailed && step.number === currentStep;

                      return (
                        <div key={step.number} className="flex flex-col items-center text-center group relative">
                          {/* Indicator Circle */}
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                              stepDone
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : stepCurrent
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-4 ring-primary-100 animate-pulse'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {stepDone ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : stepCurrent ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              step.number
                            )}
                          </div>

                          {/* Step Text */}
                          <span
                            className={`text-xs font-bold mt-2 ${
                              stepDone
                                ? 'text-emerald-700'
                                : stepCurrent
                                ? 'text-primary-700 font-extrabold'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{step.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
