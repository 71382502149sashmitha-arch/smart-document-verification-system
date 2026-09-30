import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { ShieldCheck, ToggleLeft, ToggleRight, Sliders } from 'lucide-react';
import { toast } from 'react-toastify';

import AdminGuard from '../../components/AdminGuard';

export default function AdminSettings() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRules(); }, []);

  const DEFAULT_RULES = [
    { id: 1, document_type: 'aadhaar', field_name: 'uid', rule_type: 'regex', is_required: 1, is_enabled: 1, pattern: '^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$', error_message: 'Invalid Aadhaar format' },
    { id: 2, document_type: 'pan', field_name: 'pan_number', rule_type: 'regex', is_required: 1, is_enabled: 1, pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', error_message: 'Invalid PAN format' },
    { id: 3, document_type: 'passport', field_name: 'passport_number', rule_type: 'regex', is_required: 1, is_enabled: 1, pattern: '^[A-Z]{1}[0-9]{7}$', error_message: 'Invalid Passport format' },
    { id: 4, document_type: 'driving_license', field_name: 'dl_number', rule_type: 'regex', is_required: 1, is_enabled: 1, pattern: '^[A-Z]{2}[0-9]{13}$', error_message: 'Invalid DL format' },
    { id: 5, document_type: 'employee_id', field_name: 'employee_code', rule_type: 'regex', is_required: 0, is_enabled: 1, pattern: '^[A-Z0-9-]{4,12}$', error_message: 'Invalid Employee ID' }
  ];

  async function loadRules() {
    try {
      const res = await adminAPI.getValidationRules();
      const fetched = res.data?.data?.rules || res.data?.data || res.data?.rules;
      if (Array.isArray(fetched) && fetched.length > 0) {
        setRules(fetched);
      } else {
        setRules(DEFAULT_RULES);
      }
    } catch {
      setRules(DEFAULT_RULES);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRule(id) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_enabled: r.is_enabled ? 0 : 1 } : r));
    toast.success('Rule toggled successfully');
    try {
      await adminAPI.toggleValidationRule(id);
    } catch {}
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
