# OWASP Top 10 対策 仕組み解説
## 対象サイト: MNGA Homepage（React SPA + Supabase + Vercel）

---

## A01: 権限制御の不備（Broken Access Control）

### 何が起きる？
現状、`/admin` のURLを知っている人なら**誰でも**記事の投稿・編集・削除ができます。
悪意ある人物がサイトを改ざんできる状態です。

### どう防ぐ？

```
ユーザー → /admin にアクセス
              ↓
        ログイン済み？
       YES ↙     ↘ NO
    Admin表示   /admin/login にリダイレクト
```

**Supabase Auth** はメール・パスワードで「この人は管理者か？」を確認する仕組みです。
ログインすると Supabase が **JWT トークン**（証明書のようなもの）を発行し、ブラウザに保存します。
以降のリクエストにはこのトークンが自動で付与され、「認証済みユーザー」として識別されます。

**RLS（Row Level Security）** はデータベース側の門番です。
SQL を直接叩いても「認証済みユーザーでなければ書き込み不可」というルールを DB 側で強制します。
フロントエンドのコードを迂回して API を直接叩かれても防げます。

### 実装方法
```jsx
// src/components/PrivateRoute.jsx
// ログイン済みでなければ /admin/login にリダイレクト
export default function PrivateRoute({ children }) {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])
  if (session === undefined) return null
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}
```

```sql
-- Supabase RLS: 書き込みを認証ユーザーのみに制限
CREATE POLICY "authenticated can write" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## A02: 暗号化の失敗（Cryptographic Failures）

### 何が起きる？
API キーが GitHub に流出すると、第三者が Supabase のデータを自由に操作できます。

### どう防ぐ？

```
.env ファイル（ローカルのみ）
  VITE_SUPABASE_ANON_KEY=xxx
      ↓ .gitignore で除外
  GitHub には上がらない
      ↓ Vercel の環境変数として別途登録
  ビルド時にのみ注入される
```

**重要な区別：**

| キー | 公開可否 | 理由 |
|---|---|---|
| `anon key` | 公開 OK | RLS で制御されるため |
| `service_role key` | **絶対 NG** | RLS を完全にバイパスできる |

`anon key` はビルド後の JS ファイルに含まれ誰でも見られますが、それ自体は問題ありません。
RLS が正しく設定されていれば、そのキーでできることは「公開データの読み取りのみ」に制限されます。

**セキュリティヘッダー（HSTS）** は「このサイトは必ず HTTPS で通信せよ」とブラウザに命令します。
HTTP で通信しようとしても強制的に HTTPS に切り替わり、通信の盗聴を防ぎます。

### 実装方法
```json
// vercel.json にセキュリティヘッダーを追加
{
  "key": "Strict-Transport-Security",
  "value": "max-age=63072000; includeSubDomains"
}
```

---

## A03: インジェクション（Injection）

### 何が起きる？

**XSS（クロスサイトスクリプティング）** は、悪意ある JavaScript をサイトに埋め込む攻撃です。

```
攻撃者が記事本文に以下を入力：
  <script>document.cookie を盗んで外部送信</script>

→ 閲覧者のブラウザでスクリプトが実行される
→ セッション情報・個人情報が盗まれる
```

### どう防ぐ？

**React のエスケープ処理** がほぼ自動で守ってくれます。
JSX でテキストを表示する際、`<script>` は `&lt;script&gt;` という無害な文字列に変換されます。
`dangerouslySetInnerHTML` を使わない限り安全です。

**CSP（Content Security Policy）** はブラウザへの追加ルールです。
「このサイトで実行できるスクリプトはこのドメインのものだけ」と指定することで、
万一 XSS が発生しても外部への通信をブロックできます。

**ファイルバリデーション** は「画像と偽って PHP ファイルをアップロードする」攻撃を防ぎます。
MIME タイプとファイルサイズをチェックすることで、実行可能なファイルの混入を防ぎます。

### 実装方法
```js
// ファイルアップロード時のバリデーション
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('JPEG / PNG / WebP / GIF のみ許可されています')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`ファイルサイズは ${MAX_SIZE_MB}MB 以下にしてください`)
  }
}
```

---

## A04: 安全でない設計（Insecure Design）

### 何が起きる？
技術的な実装が正しくても、**設計レベル**でセキュリティが考慮されていないと破られます。

### どう防ぐ？

```
悪い設計：
  誰でも /admin にアクセス可能
  → ログインで防ごうとする（後付け）

良い設計：
  「管理者のみが使う機能」として最初から設計
  → 認証なしではページ自体が存在しないように
```

「管理者の自己登録を無効化」する意味は、Supabase のサインアップ機能をオフにして、
管理者アカウントはダッシュボードから1つだけ手動作成する、ということです。
登録フォームが存在しなければ攻撃の入口もありません。

### 実装方法
- Supabase Dashboard → Authentication → Settings → **Disable signups** をオン
- 管理者アカウントは Dashboard から手動で1件のみ作成

---

## A05: セキュリティの設定ミス（Security Misconfiguration）

### 何が起きる？

```
X-Frame-Options が未設定の場合：
  攻撃者が自サイトに <iframe src="https://mnga.jp/admin"> を埋め込む
  → 透明な iframe を重ねてクリックを盗む（クリックジャッキング）
  → 管理者が気づかずに操作させられる
```

### どう防ぐ？

`vercel.json` にヘッダーを追加することで、Vercel のサーバーがすべてのレスポンスにセキュリティ指示を自動付与します。

| ヘッダー | 役割 |
|---|---|
| `X-Frame-Options: DENY` | iframe への埋め込みを禁止 |
| `X-Content-Type-Options: nosniff` | ファイルの種別を偽装させない |
| `Strict-Transport-Security` | HTTPS 強制（A02 と連携） |
| `Permissions-Policy` | カメラ・マイクへのアクセスを禁止 |

### 実装方法
```json
// vercel.json
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

## A06: 脆弱で古くなったコンポーネント（Vulnerable and Outdated Components）

### 何が起きる？
`npm install` で入れたライブラリに脆弱性が発見されても、更新しなければ攻撃を受け続けます。

### どう防ぐ？

```
Dependabot（GitHub 機能）の仕組み：

毎週自動でチェック
  ↓
脆弱性のあるパッケージを発見
  ↓
自動で PR を作成「gsap を v3.11 → v3.12 に更新」
  ↓
開発者がマージするだけで更新完了
```

`npm audit` は現時点の脆弱性を即座にスキャンして報告するコマンドです。
`High` や `Critical` と表示されたものは優先的に対応します。

### 実装方法
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

### 何が起きる？

```
ブルートフォース攻撃：
  admin@mnga.jp に対して
  password1, password2, password3 ... と総当たり
  → いつか正しいパスワードに当たる
```

### どう防ぐ？

Supabase Auth は5回連続でログイン失敗するとアカウントを一時ロックします。
これは設定なしで自動的に有効です。

**JWT の有効期限**も重要です。
ログイン後に発行されるトークンはデフォルト1時間で失効します。
万一トークンが盗まれても、1時間後には無効になります。

```
ログイン成功
  → JWT トークン発行（有効期限 1 時間）
  → ブラウザの localStorage に保存
  → 1 時間後に失効 → 再ログイン必要
```

### 実装方法
```jsx
// src/pages/AdminLogin.jsx
async function handleLogin(e) {
  e.preventDefault()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    setError('メールアドレスまたはパスワードが正しくありません')
  } else {
    navigate('/admin')
  }
}
```

---

## A08: ソフトウェアとデータの整合性の失敗（Software and Data Integrity Failures）

### 何が起きる？

```
CI/CD への攻撃：
  攻撃者が GitHub Actions のワークフローを改ざん
  → 本番デプロイ時にマルウェアを混入
  → ユーザーが汚染されたサイトにアクセス
```

### どう防ぐ？

**最小権限の原則** を CI/CD に適用します。
GitHub Actions のワークフローに `permissions: contents: read` を設定すると、
そのジョブはコードの読み取りしかできず、リポジトリへの書き込みや改ざんができません。

**package-lock.json** はインストールするパッケージのバージョンを完全に固定するファイルです。
これをコミットしておくことで、環境によって異なるバージョンが入ることを防ぎます。

### 実装方法
```yaml
# .github/workflows/deploy.yml
permissions:
  contents: read  # 最小権限

steps:
  - uses: actions/checkout@v4
    with:
      persist-credentials: false  # 認証情報を残さない
```

---

## A09: セキュリティログとモニタリングの失敗（Security Logging and Monitoring Failures）

### 何が起きる？
攻撃が成功しても気づかなければ被害が拡大し続けます。
「いつ・誰が・何をしたか」の記録がなければ原因調査も困難です。

### どう防ぐ？

```
admin_logs テーブルの仕組み：

管理者が記事を削除
  ↓
Supabase に DELETE リクエスト
  ↓
同時に admin_logs に記録
  { action: 'delete', target_id: 'xxx', performed_at: '2026-04-09T10:30' }
  ↓
後から「誰がいつ何を操作したか」を確認可能
```

Supabase のダッシュボードには標準でログ機能があります。
- Authentication → Logs：不審なログイン試行を確認
- Database → Logs：SQL 実行履歴を確認

### 実装方法
```sql
-- 操作ログ用テーブル
CREATE TABLE admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,       -- 'create' | 'update' | 'delete'
  target_table text NOT NULL,
  target_id uuid,
  performed_at timestamptz DEFAULT now()
);
```

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

### 何が起きる？
フロントエンドのみの構成なので本来リスクは低いですが、
コンテンツブロックの画像 URL が任意の外部 URL を参照できる状態は問題になり得ます。

```
攻撃者が管理画面で以下の URL を画像として登録：
  http://169.254.169.254/latest/meta-data/  ← クラウドの内部メタデータ

→ 内部ネットワーク情報が漏洩する可能性
```

### どう防ぐ？

画像 URL を Supabase Storage のドメインのみ許可するホワイトリスト方式で制限します。

```
表示前に URL をチェック：

block.url = "https://dqbbcnlsjqxeowfsmjwl.supabase.co/..." → 表示 OK
block.url = "http://悪意あるサーバー/..."                    → 表示しない
```

### 実装方法
```js
// src/utils/validateImageUrl.js
const ALLOWED_ORIGINS = ['https://dqbbcnlsjqxeowfsmjwl.supabase.co']

export function isAllowedImageUrl(url) {
  if (!url) return false
  return ALLOWED_ORIGINS.some(origin => url.startsWith(origin))
}
```

```jsx
// ReportDetail.jsx の image ブロック表示時に適用
case 'image':
  const isSafe = isAllowedImageUrl(block.url)
  return isSafe
    ? <img src={block.url} alt="" referrerPolicy="no-referrer" style={...} />
    : null
```

---

## 対策の全体像

```
外部からの攻撃
    ↓
[A05] Vercel セキュリティヘッダー ── 最初の壁（iframe 禁止・HTTPS 強制）
    ↓
[A01/A07] Supabase Auth ─────────── 管理機能への入口（JWT 認証）
    ↓
[A03] React XSS エスケープ + CSP ── コンテンツの安全（スクリプト無効化）
    ↓
[A01] Supabase RLS ─────────────── DB への最後の砦（書き込み制限）
    ↓
[A09] ログ記録 ─────────────────── 攻撃が通った場合の検知・追跡
```

---

## 優先度別 実装ロードマップ

| 優先度 | OWASP | 対策内容 | 工数目安 |
|---|---|---|---|
| 🔴 緊急 | A01 / A07 | Supabase Auth + PrivateRoute でログイン実装 | 2〜3 時間 |
| 🔴 緊急 | A01 | Supabase RLS で reports テーブルを保護 | 30 分 |
| 🟠 高 | A05 | vercel.json にセキュリティヘッダー追加 | 30 分 |
| 🟠 高 | A03 | ファイルアップロードのバリデーション追加 | 1 時間 |
| 🟡 中 | A09 | admin_logs テーブル + ログ記録の実装 | 2 時間 |
| 🟡 中 | A06 | Dependabot の設定 | 15 分 |
| 🟢 低 | A08 | CI/CD の最小権限設定 | 30 分 |
| 🟢 低 | A10 | 画像 URL のドメイン制限 | 1 時間 |

---

*作成日: 2026-04-09*
*対象バージョン: OWASP Top 10 2021*
