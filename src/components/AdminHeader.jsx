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
    <header className="adm-header">
      <div className="adm-header__bar">
        <span className="adm-header__brand">
          <span className="adm-header__mark en">MNGA Console</span>
          <span className="adm-header__title">{title}</span>
        </span>
        <div className="adm-header__actions">
          {right}
          <button onClick={handleLogout} className="adm-btn adm-btn--sm">
            ログアウト
          </button>
        </div>
      </div>

      <nav className="adm-tabs">
        {tabs.map((t) => {
          const active = location.pathname === t.path
          return (
            <Link
              key={t.path}
              to={t.path}
              className={`adm-tab${active ? ' is-active' : ''}`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
