import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_BASE = '/mnga-console-7kx9a'

const tabs = [
  { label: '活動レポート', path: ADMIN_BASE },
  { label: 'お知らせ', path: `${ADMIN_BASE}/news` },
]

export default function AdminHeader({ title = 'MNGA 管理画面', right = null }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate(`${ADMIN_BASE}/login`)
  }

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 40px',
    }}>
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.1em' }}>
          {title}
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {right}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.05em',
            }}
          >
            ログアウト
          </button>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '24px', marginTop: '-1px' }}>
        {tabs.map((t) => {
          const active = location.pathname === t.path
          return (
            <Link
              key={t.path}
              to={t.path}
              style={{
                padding: '12px 4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
                color: active ? '#000' : '#6b7280',
                borderBottom: active ? '2px solid #000' : '2px solid transparent',
                textDecoration: 'none',
              }}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
