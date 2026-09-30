import { Loader2 } from 'lucide-react'

export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizeMap = { sm: 20, md: 32, lg: 48 }
  const iconSize = sizeMap[size] || sizeMap.md

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      padding: '40px',
      minHeight: size === 'lg' ? '300px' : 'auto',
    }}>
      <Loader2
        size={iconSize}
        style={{
          color: 'var(--accent-primary)',
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && (
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          fontWeight: 500,
        }}>
          {text}
        </p>
      )}
    </div>
  )
}
