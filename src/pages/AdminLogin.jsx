import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/mnga/admin.css'

export default function AdminLogin() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    if (!supabase) { setError('Supabase の設定が完了していません'); return }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
    } else {
      navigate('/mnga-console-7kx9a')
    }
  }

  return (
    <div className="mnga-admin adm-login">
      <div className="adm-login__card">
        <span className="adm-login__mark">Make Nippon Great Again</span>
        <h1 className="adm-login__title">管理画面</h1>

        <form onSubmit={handleLogin}>
          <div className="adm-field">
            <label className="adm-label">メールアドレス</label>
            <input
              type="email"
              className="adm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">パスワード</label>
            <input
              type="password"
              className="adm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="adm-login__error">{error}</p>}

          <button type="submit" disabled={loading} className="adm-btn adm-btn--solid adm-btn--block">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
