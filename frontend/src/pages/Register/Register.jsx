import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Mail, Lock, User, FileCheck2, Eye, EyeOff, Check, X } from 'lucide-react'

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', test: password.length >= 6 },
    { label: 'Contains uppercase', test: /[A-Z]/.test(password) },
    { label: 'Contains number', test: /[0-9]/.test(password) },
    { label: 'Contains special char', test: /[^A-Za-z0-9]/.test(password) },
  ]

  const passed = checks.filter(c => c.test).length
  const strengthColors = ['var(--color-error)', 'var(--color-warning)', '#f59e0b', 'var(--color-success)']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Strength bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: i < passed ? strengthColors[passed - 1] : 'var(--bg-tertiary)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
      <p style={{
        fontSize: '0.75rem',
        color: passed > 0 ? strengthColors[passed - 1] : 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: '8px',
      }}>
        {strengthLabels[passed - 1] || ''}
      </p>

      {/* Check list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {checks.map((check, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: check.test ? 'var(--color-success)' : 'var(--text-muted)',
            transition: 'color 0.2s ease',
          }}>
            {check.test ? <Check size={12} /> : <X size={12} />}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, fullName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <FileCheck2 size={24} />
          </div>
          <span className="auth-logo-text">DocVerify</span>
        </div>

        <h1>Create Account</h1>
        <p className="auth-subtitle">Join the smart document verification platform</p>

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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div className="form-input-icon">
              <User size={18} className="icon" />
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div className="form-input-icon">
              <Mail size={18} className="icon" />
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div className="form-input-icon" style={{ position: 'relative' }}>
              <Lock size={18} className="icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
            <div className="form-input-icon">
              <Lock size={18} className="icon" />
              <input
                id="register-confirm"
                type="password"
                className="form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="form-error">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="register-submit"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
