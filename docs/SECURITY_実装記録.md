# セキュリティ実装記録
## 実装日: 2026-04-09

---

## 実装概要

OWASP Top 10 の最優先事項（A01・A07・A05）に対応した。
主な対策は「管理画面の認証保護」と「セキュリティヘッダーの追加」。

---

## 実装内容

### 1. 管理者ログイン画面の新規作成（A01 / A07）

**ファイル:** `src/pages/AdminLogin.jsx`（新規作成）

**内容:**
- メールアドレス・パスワードによるログインフォーム
- `supabase.auth.signInWithPassword()` で Supabase Auth に認証リクエスト
- ログイン成功 → `/admin` にリダイレクト
- ログイン失敗 → 「メールアドレスまたはパスワードが正しくありません」を表示
  - ※ セキュリティ上、「メールが存在しない」「パスワードが違う」は区別して表示しない

```jsx
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) {
  setError('メールアドレスまたはパスワードが正しくありません')
} else {
  navigate('/admin')
}
```

---

### 2. ルート保護コンポーネントの作成（A01）

**ファイル:** `src/components/PrivateRoute.jsx`（新規作成）

**内容:**
- `/admin` にアクセスしたとき、セッション（ログイン状態）を確認する
- セッションなし → `/admin/login` に自動リダイレクト
- `supabase.auth.onAuthStateChange()` でログイン・ログアウトの変化をリアルタイム検知

```jsx
// セッション確認中
if (session === undefined) return <ローディング表示>

// 未ログイン → ログイン画面へ
if (!session) return <Navigate to="/admin/login" replace />

// ログイン済み → 管理画面を表示
return children
```

---

### 3. ルーティングの更新（A01）

**ファイル:** `src/App.jsx`（変更）

**変更点:**
- `/admin/login` ルートを追加（`AdminLogin` コンポーネント）
- `/admin` ルートを `PrivateRoute` でラップし、未認証アクセスを防止

```jsx
// 変更前
<Route path="/admin" element={<Admin />} />

// 変更後
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin" element={
  <PrivateRoute>
    <Admin />
  </PrivateRoute>
} />
```

---

### 4. 管理画面にログアウトボタンを追加（A07）

**ファイル:** `src/pages/Admin.jsx`（変更）

**内容:**
- 一覧ビューのヘッダー右上に「ログアウト」ボタンを追加
- クリックで `supabase.auth.signOut()` を実行
- サインアウト後、`PrivateRoute` がセッション消滅を検知して自動的に `/admin/login` へリダイレクト

```jsx
<button onClick={async () => { await supabase.auth.signOut() }}>
  ログアウト
</button>
```

---

### 5. セキュリティヘッダーの追加（A05）

**ファイル:** `vercel.json`（変更）

**内容:**
全レスポンスに以下のセキュリティヘッダーを付与するよう Vercel に設定。

| ヘッダー | 設定値 | 効果 |
|---|---|---|
| `X-Frame-Options` | `DENY` | クリックジャッキング攻撃を防ぐ |
| `X-Content-Type-Options` | `nosniff` | MIMEタイプ偽装による攻撃を防ぐ |
| `Strict-Transport-Security` | `max-age=63072000` | HTTPS 通信を強制（2年間） |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | リファラー情報の過剰送信を防ぐ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 不要なブラウザ機能へのアクセスを禁止 |

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

## Supabase 側で必要な手動設定

コード変更だけでは完結しない設定が 3 つある。
Supabase ダッシュボードで実施すること。

### ① 管理者アカウントの作成

1. Supabase Dashboard → **Authentication** → **Users**
2. 「**Add user**」→ メールアドレス・パスワードを設定
3. このアカウントが `/admin` にログインできる唯一のアカウントとなる

### ② 新規サインアップの無効化

1. Supabase Dashboard → **Authentication** → **Settings**
2. 「**Enable email signups**」を **OFF** にする
3. 外部からのアカウント作成を完全に防ぐ

### ③ RLS（Row Level Security）の設定

Supabase SQL Editor で以下を実行：

```sql
-- reports テーブルの RLS を有効化
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能（公開記事）
CREATE POLICY "public can read" ON reports
  FOR SELECT USING (true);

-- 書き込みは認証ユーザーのみ
CREATE POLICY "authenticated can insert" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated can update" ON reports
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated can delete" ON reports
  FOR DELETE USING (auth.role() = 'authenticated');

-- Storage: アップロードを認証ユーザーのみに変更
DROP POLICY IF EXISTS "allow anon insert" ON storage.objects;

CREATE POLICY "authenticated can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'report-thumbnails');
```

---

## 変更ファイル一覧

| ファイル | 種別 | 変更内容 |
|---|---|---|
| `src/pages/AdminLogin.jsx` | 新規作成 | ログインフォーム |
| `src/components/PrivateRoute.jsx` | 新規作成 | セッションチェック・リダイレクト |
| `src/App.jsx` | 変更 | ルート保護・ログインルート追加 |
| `src/pages/Admin.jsx` | 変更 | ログアウトボタン追加 |
| `vercel.json` | 変更 | セキュリティヘッダー追加 |

---

## 対応した OWASP 項目

| OWASP | 項目名 | 対応内容 |
|---|---|---|
| **A01** | 権限制御の不備 | PrivateRoute + RLS で管理画面・DBを保護 |
| **A05** | セキュリティの設定ミス | vercel.json にセキュリティヘッダーを追加 |
| **A07** | 識別と認証の失敗 | Supabase Auth によるログイン認証を実装 |

---

## 残タスク（次回以降）

| 優先度 | OWASP | 内容 |
|---|---|---|
| 🟠 高 | A03 | ファイルアップロードのバリデーション追加 |
| 🟡 中 | A09 | admin_logs テーブルで操作ログ記録 |
| 🟡 中 | A06 | Dependabot の設定 |
| 🟢 低 | A08 | CI/CD の最小権限設定 |
| 🟢 低 | A10 | 画像 URL のドメイン制限 |
