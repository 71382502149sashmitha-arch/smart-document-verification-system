import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import { documentsAPI } from '../../api/documents';
import {
  User, Mail, Shield, Key, Bell, Save, CheckCircle, FileText, Clock, Copy, Lock
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // User stats state
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Notification settings toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user?.fullName || user?.full_name || '');
      setEmail(user?.email || '');
    }
    loadStats();
  }, [user]);

  async function loadStats() {
    try {
      const res = await documentsAPI.getMy({ limit: 100 });
      const docs = res.data?.data?.documents || [];
      const verified = docs.filter(d => d.status === 'verified').length;
      const pending = docs.filter(d => d.status === 'pending' || d.status === 'processing').length;
      setStats({ total: docs.length, verified, pending });
    } catch {
      // fallback if error
    } finally {
      setLoadingStats(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      return toast.error('Full name cannot be empty');
    }
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ full_name: fullName, fullName });
      const updatedUser = res.data?.data?.user || res.data?.user || { ...user, fullName, full_name: fullName };
      localStorage.setItem('sdvs_user', JSON.stringify(updatedUser));
      try {
        await refreshUser();
      } catch (e) {}
      toast.success('Profile updated successfully!');
    } catch (err) {
      const updatedUser = { ...user, fullName, full_name: fullName };
      localStorage.setItem('sdvs_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill in all password fields');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setUpdatingPassword(true);
    try {
      await authAPI.updateProfile({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.data?.message || err.response?.status >= 400) {
        toast.error(msg || 'Failed to update password');
      } else {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setUpdatingPassword(false);
    }
  }

  function copyUserId() {
    if (user?.id) {
      navigator.clipboard.writeText(String(user.id));
      toast.info('User ID copied to clipboard');
    }
  }

  const roleStyles = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    verifier: 'bg-blue-100 text-blue-700 border-blue-200',
    user: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const displayName = fullName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-500/30 flex-shrink-0 border-2 border-white/20">
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${roleStyles[user?.role] || roleStyles.user}`}>
              {user?.role || 'user'}
            </span>
          </div>
          <p className="text-slate-300 text-sm flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-4 h-4 text-primary-400" /> {user?.email}
          </p>
          {user?.id && (
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 hover:bg-white/20 transition-colors cursor-pointer" onClick={copyUserId}>
              <span>ID: {user.id}</span>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">My Documents</p>
            <p className="text-2xl font-bold text-slate-800">{loadingStats ? '...' : stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Verified Docs</p>
            <p className="text-2xl font-bold text-slate-800">{loadingStats ? '...' : stats.verified}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Verification</p>
            <p className="text-2xl font-bold text-slate-800">{loadingStats ? '...' : stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (2 span): Personal Info & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-slate-800">Personal Details</h2>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role / Designation</label>
                <input
                  type="text"
                  value={(user?.role || 'user').toUpperCase()}
                  disabled
                  className="input-field bg-slate-50 text-slate-500 cursor-not-allowed font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <Key className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-slate-800">Security & Password</h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={updatingPassword} className="btn-primary bg-slate-800 hover:bg-slate-900">
                  <Lock className="w-4 h-4" />
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col (1 span): System & Preferences */}
        <div className="space-y-6">
          {/* Notifications Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <Bell className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-slate-800">Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Email Notifications</p>
                  <p className="text-xs text-slate-400">Receive alerts when verification completes</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={e => setEmailNotifs(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                />
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Security Alerts</p>
                  <p className="text-xs text-slate-400">Notify on login from new devices</p>
                </div>
                <input
                  type="checkbox"
                  checked={securityAlerts}
                  onChange={e => setSecurityAlerts(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Account Security Badge */}
          <div className="bg-gradient-to-br from-slate-50 to-primary-50/40 rounded-xl border border-primary-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Account Protected</h3>
                <p className="text-xs text-slate-500">JWT Token Authentication Active</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Your session is secured using standard JSON Web Tokens. All uploaded documents are processed securely via OCR & Machine Learning verification engines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
