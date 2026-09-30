import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, ShieldAlert, CheckCircle2, UserCheck, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'admin') {
      setEmail('admin@sdvs.com');
      setPassword('Admin@123');
    } else if (role === 'verifier') {
      setEmail('verifier@sdvs.com');
      setPassword('Verifier@123');
    } else if (role === 'user' || role === 'user1') {
      setEmail('user1@sdvs.com');
      setPassword('User@123');
    } else if (role === 'user2') {
      setEmail('user2@sdvs.com');
      setPassword('User@123');
    }
  }, [searchParams]);

  async function handleSubmit(e, customEmail, customPass) {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) return toast.error('All fields required');
    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function triggerDemoLogin(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setShowUserModal(false);
    handleSubmit(null, demoEmail, demoPass);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4 relative">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 mb-4 border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Document Verification</h1>
          <p className="text-slate-400 mt-1 text-sm">Enterprise Automated Verification Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base shadow-lg shadow-primary-500/25">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Sign up</Link>
          </p>

          {/* Quick 1-Click Demo Login Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Quick Demo Accounts (1-Click Login)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => triggerDemoLogin('admin@sdvs.com', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl transition-all group"
              >
                <ShieldAlert className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => triggerDemoLogin('verifier@sdvs.com', 'Verifier@123')}
                className="flex flex-col items-center justify-center p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl transition-all group"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Verifier</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUserModal(true)}
                className="flex flex-col items-center justify-center p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl transition-all group"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select User Account Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Select User Account</h3>
                <p className="text-xs text-slate-500">Which user account would you like to login as?</p>
              </div>
            </div>

            <div className="space-y-3 my-5">
              <button
                type="button"
                onClick={() => triggerDemoLogin('user1@sdvs.com', 'User@123')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                    U1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">User 1 (Rahul Sharma)</h4>
                    <p className="text-xs text-slate-500">user1@sdvs.com</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Login →
                </span>
              </button>

              <button
                type="button"
                onClick={() => triggerDemoLogin('user2@sdvs.com', 'User@123')}
                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                    U2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">User 2 (Ananya Gupta)</h4>
                    <p className="text-xs text-slate-500">user2@sdvs.com</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full">
                  Login →
                </span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
