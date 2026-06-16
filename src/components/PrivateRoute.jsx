import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/mnga/admin.css'

export default function PrivateRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = 確認中

  useEffect(() => {
    // Supabase 未設定（env欠落）なら未認証扱いでログインへ
    if (!supabase) { setSession(null); return }

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
      <div className="mnga-admin adm-loading">
        確認中...
      </div>
    )
  }

  // 未ログインならログイン画面にリダイレクト
  if (!session) {
    return <Navigate to="/mnga-console-7kx9a/login" replace />
  }

  // 認可：admin ロール（app_metadata.role==='admin'）必須。
  // 自己登録ユーザー等の非adminはセッションがあっても拒否（RLSと二重で防御）。
  // ※ app_metadata はユーザー自身が改変できないため、なりすまし不可。
  const role = session.user?.app_metadata?.role
  if (role !== 'admin') {
    supabase.auth.signOut()
    return <Navigate to="/mnga-console-7kx9a/login" replace />
  }

  return children
}
