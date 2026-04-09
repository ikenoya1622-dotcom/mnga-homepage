import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
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
      navigate('/admin')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Zen Old Mincho, serif',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          MNGA 管理画面
        </h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#555',
              marginBottom: '6px',
              letterSpacing: '0.05em',
            }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '15px',
                fontFamily: 'inherit',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#555',
              marginBottom: '6px',
              letterSpacing: '0.05em',
            }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '15px',
                fontFamily: 'inherit',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{
              fontSize: '13px',
              color: '#dc2626',
              marginBottom: '16px',
              letterSpacing: '0.03em',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#555' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '15px',
              fontFamily: 'inherit',
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
