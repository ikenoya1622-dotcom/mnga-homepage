# OWASP Top 10 セキュリティ対策まとめ
## 対象サイト: MNGA Homepage（React SPA + Supabase + Vercel）

---

## サイト構成の前提

| レイヤー | 技術 |
|---|---|
| フロントエンド | React + Vite + Tailwind CSS + GSAP |
| バックエンド（BaaS） | Supabase（PostgreSQL + Storage + Auth） |
| ホスティング | Vercel |
| 管理画面 | /admin（現状: 認証なし） |

---

## A01: 権限制御の不備（Broken Access Control）

### 現状の問題
- `/admin` ページに認証が一切なく、URLを知っていれば誰でも記事の投稿・編集・削除が可能
- Supabase の `reports` テーブルに anon ユーザーへの書き込み権限を付与している

### 実装すべき対策

#### 1. Supabase Auth による管理者認証
```jsx
// src/lib/supabase.js に認証ヘルパーを追加
export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}
export async function signOut() {
  return await supabase.auth.signOut()
}
export async function getSession() {
  return await supabase.auth.getSession()
}
```

#### 2. PrivateRoute コンポーネントの実装
```jsx
// src/components/PrivateRoute.jsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PrivateRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  if (session === undefined) return null // ローディング中
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}
```

#### 3. App.jsx でルートを保護
```jsx
<Route path="/admin" element={
  <PrivateRoute>
    <Admin />
  </PrivateRoute>
} />
<Route path="/admin/login" element={<AdminLogin />} />
```

#### 4. Supabase RLS（Row Level Security）の設定
```sql
-- reports テーブルへの書き込みを認証ユーザーのみに制限
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read" ON reports
  FOR SELECT USING (true);

CREATE POLICY "authenticated can write" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated can update" ON reports
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated can delete" ON reports
  FOR DELETE USING (auth.role() = 'authenticated');
```

#### 5. Storage ポリシーの修正
```sql
-- アップロードを認証ユーザーのみに制限
DROP POLICY IF EXISTS "allow anon insert" ON storage.objects;

CREATE POLICY "authenticated can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'report-thumbnails');
```

---

## A02: 暗号化の失敗（Cryptographic Failures）

### 現状の問題
- `.env` ファイルの管理が不適切な場合、APIキーが漏洩するリスク
- `VITE_SUPABASE_ANON_KEY` はビルド後のJSに含まれる（公開される）

### 実装すべき対策

#### 1. .gitignore の確認
```gitignore
# 以下が必ず含まれていること
.env
.env.local
.env.production
```

#### 2. Supabase Service Role Key を絶対にフロントエンドで使わない
```js
// NG: フロントエンドで service_role key を使う
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

// OK: anon key のみ使用（RLS で制御）
const supabase = createClient(url, process.env.VITE_SUPABASE_ANON_KEY)
```

#### 3. Vercel のセキュリティヘッダー設定
```json
// vercel.json に追加
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## A03: インジェクション（Injection）

### 現状の状態
- **SQLインジェクション**: Supabase クライアントはパラメータ化クエリを使用するため安全
- **XSS**: React の JSX は基本的にエスケープ済み（`dangerouslySetInnerHTML` 不使用）

### 実装すべき対策

#### 1. Content Security Policy（CSP）の設定
```json
// vercel.json headers に追加
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co"
}
```

#### 2. 画像URLのホワイトリストバリデーション
```js
// src/utils/validateImageUrl.js
const ALLOWED_ORIGINS = [
  'https://dqbbcnlsjqxeowfsmjwl.supabase.co',
]

export function isAllowedImageUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ALLOWED_ORIGINS.some(origin => url.startsWith(origin))
  } catch {
    return false
  }
}
```

#### 3. ファイルアップロードのバリデーション強化
```js
// Admin.jsx の uploadThumbnail / uploadBlockImages に追加
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('許可されていないファイル形式です（JPEG/PNG/WebP/GIF のみ）')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`ファイルサイズは ${MAX_SIZE_MB}MB 以下にしてください`)
  }
}
```

---

## A04: 安全でない設計（Insecure Design）

### 現状の問題
- 管理機能の認証設計がない（A01と重複するが設計レベルの問題）
- ファイルアップロードのサイズ・種別制限がない

### 実装すべき対策

#### 1. 管理者アカウントの設計
- Supabase Dashboard でメール・パスワードによる管理者アカウントを1つ作成
- 一般ユーザーの自己登録は無効化（Supabase → Authentication → Settings → Disable signups）

#### 2. レート制限の検討
- Supabase には組み込みのレート制限あり（デフォルト: 30req/min）
- 管理画面へのアクセスは認証後のみに制限することで緩和

#### 3. アップロードファイルのサイズ制限
```js
// Supabase Storage の fileSizeLimit を設定（Dashboard で設定可能）
// または Storage ポリシーで制限
```

---

## A05: セキュリティの設定ミス（Security Misconfiguration）

### 現状の問題
- Vercel にセキュリティヘッダーが未設定
- Supabase の RLS が reports テーブルで不完全

### 実装すべき対策

#### 1. vercel.json のセキュリティヘッダー（A02の設定と統合）
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
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

#### 2. Supabase の設定確認チェックリスト
- [ ] `reports` テーブルの RLS が有効になっている
- [ ] `storage.objects` の RLS が有効になっている
- [ ] Service Role Key が公開されていない
- [ ] Supabase Dashboard → Authentication → Email の確認メール設定

---

## A06: 脆弱で古くなったコンポーネント（Vulnerable and Outdated Components）

### 実装すべき対策

#### 1. npm audit の定期実行
```bash
npm audit
npm audit fix
```

#### 2. 依存関係の定期更新
```bash
npx npm-check-updates -u
npm install
```

#### 3. GitHub Dependabot の有効化
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## A07: 識別と認証の失敗（Identification and Authentication Failures）

### 現状の問題
- /admin に認証が一切ない（A01と重複）
- ブルートフォース対策がない

### 実装すべき対策

#### 1. ログインページの実装
```jsx
// src/pages/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
    } else {
      navigate('/admin')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <p>{error}</p>}
      <button type="submit">ログイン</button>
    </form>
  )
}
```

#### 2. Supabase の認証設定
- ブルートフォース保護: Supabase 組み込みのレート制限（5回失敗でロック）
- セッション有効期限: Dashboard → Auth → JWT expiry で設定（デフォルト3600秒）

---

## A08: ソフトウェアとデータの整合性の失敗（Software and Data Integrity Failures）

### 実装すべき対策

#### 1. package-lock.json のコミット確認
```bash
# package-lock.json が .gitignore に含まれていないか確認
git ls-files package-lock.json
```

#### 2. GitHub Actions のセキュリティ強化
```yaml
# .github/workflows/deploy.yml に追加
permissions:
  contents: read  # 最小権限の原則

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false  # 認証情報を残さない
```

#### 3. 外部フォント（Google Fonts）の Subresource Integrity
```html
<!-- index.html で integrity 属性を追加 -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/..."
  crossorigin="anonymous"
/>
```

---

## A09: セキュリティログとモニタリングの失敗（Security Logging and Monitoring Failures）

### 現状の問題
- 管理操作（投稿・編集・削除）のログが一切ない
- 不正アクセス試行の検知手段がない

### 実装すべき対策

#### 1. Supabase の監査ログ活用
- Supabase Dashboard → Database → Logs で SQL 実行ログを確認可能
- Auth → Logs で認証試行ログを確認可能

#### 2. 管理操作ログテーブルの作成
```sql
CREATE TABLE admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,          -- 'create' | 'update' | 'delete'
  target_table text NOT NULL,    -- 'reports'
  target_id uuid,
  performed_at timestamptz DEFAULT now()
);
```

#### 3. フロントエンドからのログ記録
```js
// Admin.jsx の投稿・更新・削除処理に追加
async function logAction(action, targetId) {
  await supabase.from('admin_logs').insert({
    action,
    target_table: 'reports',
    target_id: targetId,
  })
}
```

---

## A10: サーバーサイドリクエストフォージェリ（SSRF）

### 現状の状態
- フロントエンドのみの構成のため、SSRF リスクは比較的低い
- ただし、コンテンツブロックの画像URLが任意の外部URLを参照できる状態

### 実装すべき対策

#### 1. 画像URLのドメイン制限（A03と共通）
```js
// ReportDetail.jsx の ContentBlock (image) に適用
case 'image':
  const isSafeUrl = block.url?.startsWith('https://dqbbcnlsjqxeowfsmjwl.supabase.co')
  return isSafeUrl ? (
    <img src={block.url} alt="" ... />
  ) : null
```

#### 2. img タグの referrerpolicy 設定
```jsx
<img
  src={block.url}
  alt=""
  referrerPolicy="no-referrer"
  style={{ ... }}
/>
```

---

## 優先度別 実装ロードマップ

| 優先度 | 対策 | 工数目安 |
|---|---|---|
| **緊急** | A01/A07: Supabase Auth + PrivateRoute の実装 | 2〜3時間 |
| **緊急** | A01: Supabase RLS の設定（reports テーブル） | 30分 |
| **高** | A05: vercel.json にセキュリティヘッダー追加 | 30分 |
| **高** | A03: ファイルアップロードのバリデーション追加 | 1時間 |
| **中** | A09: admin_logs テーブル + ログ記録の実装 | 2時間 |
| **中** | A06: Dependabot の設定 | 15分 |
| **低** | A08: CI/CD の最小権限設定 | 30分 |
| **低** | A10: 画像URLのドメイン制限 | 1時間 |

---

*作成日: 2026-04-09*
*対象バージョン: OWASP Top 10 2021*
