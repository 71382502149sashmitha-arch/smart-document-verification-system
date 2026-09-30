import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Document', icon: Upload },
  { path: '/verification', label: 'Verification', icon: ShieldCheck },
  { path: '/history', label: 'History', icon: History },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isMobile = window.innerWidth <= 768

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: isMobile ? 'flex' : 'none',
          position: 'fixed',
          top: '12px',
          left: '12px',
          width: '42px',
          height: '42px',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          zIndex: 300,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Menu size={22} />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && isMobile && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 250,
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,

          width: isMobile
            ? '280px'
            : collapsed
              ? 'var(--sidebar-collapsed)'
              : 'var(--sidebar-width)',

          background: 'var(--gradient-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',

          transition: 'transform 0.3s ease, width 0.3s ease',

          zIndex: 260,
          overflow: 'hidden',

          transform:
            isMobile && !mobileOpen
              ? 'translateX(-100%)'
              : 'translateX(0)',
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',

            padding:
              !isMobile && collapsed
                ? '20px 16px'
                : '20px 22px',

            height: 'var(--navbar-height)',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
          }}
        >
          {/* LOGO ICON */}
          <div
            style={{
              width: '38px',
              height: '38px',
              minWidth: '38px',
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 0 16px var(--accent-primary-glow)',
            }}
          >
            <FileCheck2 size={20} />
          </div>

          {/* LOGO TEXT */}
          {(isMobile || !collapsed) && (
            <div
              style={{
                flex: 1,
                animation: 'fadeIn 0.3s ease-out',
                whiteSpace: 'nowrap',
              }}
            >
              <p
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                DocVerify
              </p>

              <p
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Smart System
              </p>
            </div>
          )}

          {/* MOBILE CLOSE BUTTON */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav
          style={{
            flex: 1,
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile) {
                    setMobileOpen(false)
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',

                  padding:
                    !isMobile && collapsed
                      ? '12px 16px'
                      : '11px 16px',

                  borderRadius: 'var(--radius-md)',

                  color: isActive
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',

                  background: isActive
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'transparent',

                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.88rem',

                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',

                  justifyContent:
                    !isMobile && collapsed
                      ? 'center'
                      : 'flex-start',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: '3px',
                      background: 'var(--accent-primary)',
                      borderRadius: '0 4px 4px 0',
                    }}
                  />
                )}

                <Icon
                  size={20}
                  style={{
                    minWidth: '20px',
                  }}
                />

                {(isMobile || !collapsed) && (
                  <span>{item.label}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* DESKTOP COLLAPSE BUTTON */}
        {!isMobile && (
          <button
            id="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              margin: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}

            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </aside>
    </>
  )
}