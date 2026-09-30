import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Generate mock monthly data if no data is provided
const defaultData = [
  { month: 'Jan', verified: 12, rejected: 2, pending: 3 },
  { month: 'Feb', verified: 19, rejected: 3, pending: 5 },
  { month: 'Mar', verified: 25, rejected: 1, pending: 4 },
  { month: 'Apr', verified: 31, rejected: 4, pending: 2 },
  { month: 'May', verified: 22, rejected: 2, pending: 6 },
  { month: 'Jun', verified: 38, rejected: 3, pending: 3 },
  { month: 'Jul', verified: 28, rejected: 1, pending: 4 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <p style={{
        fontSize: '0.82rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '6px',
      }}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          marginTop: '2px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: entry.color,
          }} />
          <span style={{ textTransform: 'capitalize' }}>{entry.dataKey}:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function VerificationChart({ data }) {
  const chartData = data || defaultData

  return (
    <div className="card" style={{ padding: '20px 20px 12px' }}>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="card-title">Verification Trends</h3>
          <p className="card-subtitle">Monthly verification activity</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="verified"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gradVerified)"
          />
          <Area
            type="monotone"
            dataKey="rejected"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#gradRejected)"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradPending)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '8px',
      }}>
        {[
          { label: 'Verified', color: '#10b981' },
          { label: 'Rejected', color: '#ef4444' },
          { label: 'Pending', color: '#8b5cf6' },
        ].map((item) => (
          <div key={item.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: item.color,
            }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
