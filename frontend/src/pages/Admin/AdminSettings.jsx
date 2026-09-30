import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { ShieldCheck, ToggleLeft, ToggleRight, Sliders } from 'lucide-react';
import { toast } from 'react-toastify';

import AdminGuard from '../../components/AdminGuard';

export default function AdminSettings() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRules(); }, []);

  async function loadRules() {
    try {
      const res = await adminAPI.getValidationRules();
      setRules(res.data?.data?.rules || res.data?.data || []);
    } catch {
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  }

  async function toggleRule(id) {
    try {
      await adminAPI.toggleValidationRule(id);
      toast.success('Rule toggled successfully');
      loadRules();
    } catch {
      toast.error('Failed to toggle rule');
    }
  }

  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  return (
    <AdminGuard>
      <div className="space-y-6 animate-fade-in pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Validation Rules & Config</h1>
          <p className="text-sm text-slate-500">Configure regex format constraints, field requirements, and automated failure severities.</p>
        </div>

        <div className="card table-container bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="data-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Field Name</th>
                <th className="py-3 px-4">Rule Type</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 text-sm">
                    No active validation rules configured.
                  </td>
                </tr>
              ) : (
                rules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium capitalize text-sm text-slate-800">
                      {(rule.document_type || 'general').replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 capitalize text-sm text-slate-600">
                      {(rule.field_name || 'field').replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">{rule.rule_type || 'regex'}</td>
                    <td className="py-3 px-4 text-sm">{rule.is_required ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.is_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {rule.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => toggleRule(rule.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800">
                        {rule.is_enabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                        {rule.is_enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
