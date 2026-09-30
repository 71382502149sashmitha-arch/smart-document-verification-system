import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) {
  const colorMap = {
    primary: { gradient: 'var(--gradient-primary)', glow: 'var(--accent-primary-glow)' },
    success: { gradient: 'var(--gradient-success)', glow: 'rgba(16, 185, 129, 0.2)' },
    warning: { gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', glow: 'rgba(245, 158, 11, 0.2)' },
    danger: { gradient: 'var(--gradient-danger)', glow: 'rgba(239, 68, 68, 0.2)' },
    info: { gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', glow: 'rgba(6, 182, 212, 0.2)' },
  }

  const colorStyle = colorMap[color] || colorMap.primary
  const isPositive = trend === 'up'

  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      transition: 'all var(--transition-base)',
      cursor: 'default',
    }}>
      {/* Icon */}
      <div style={{
        width: '48px',
        height: '48px',
        minWidth: '48px',
        borderRadius: 'var(--radius-md)',
        background: colorStyle.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: `0 4px 14px ${colorStyle.glow}`,
      }}>
        <Icon size={22} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500,
          marginBottom: '4px',
        }}>
          {title}
        </p>
        <p style={{
          fontSize: '1.7rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
        }}>
          {value}
        </p>

        {/* Trend */}
        {trendValue !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
          }}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue}%</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs last month</span>
          </div>
        )}
      </div>
    </div>
  )
}
