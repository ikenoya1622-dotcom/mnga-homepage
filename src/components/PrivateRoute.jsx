import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PrivateRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = 確認中

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // セッション変化を監視（ログイン・ログアウト時に反応）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // セッション確認中はローディング表示
  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Zen Old Mincho, serif',
        color: '#888',
        fontSize: '16px',
      }}>
        確認中...
      </div>
    )
  }

  // 未ログインなら /admin/login にリダイレクト
  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
