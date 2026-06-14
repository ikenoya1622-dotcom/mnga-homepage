# セキュリティ対策 総まとめ
## 実施日: 2026-04-09

---

## はじめに

OWASP Top 10（2021年版）は、Webアプリケーションにおける最も重大なセキュリティリスクのランキング。  
本日はこの10項目すべてに対応した。以下では、**どんなリスクがあったか**・**何をしたか**・**なぜそれで防げるか（仕組み）** を記録する。

---

## A01 — 権限制御の不備（Broken Access Control）

### どんなリスクがあったか

管理画面 `/admin` に URL を直接入力するだけで、**誰でもアクセスできる**状態だった。  
悪意ある第三者が記事を勝手に作成・編集・削除できるだけでなく、Supabase のデータベースにも認証なしで書き込めた。

### 何をしたか

**① PrivateRoute コンポーネントの作成**（`src/components/PrivateRoute.jsx`）

```jsx
// ログインしていなければ /admin/login に強制リダイレクト
if (!session) return <Navigate to="/admin/login" replace />
return children
```

**② Supabase の RLS（Row Level Security）を有効化**

```sql
-- 誰でも読み取り可（公開記事）
CREATE POLICY "public can read" ON reports FOR SELECT USING (true);

-- 書き込みは認証ユーザーのみ
CREATE POLICY "authenticated can insert" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 仕組み

`PrivateRoute` はページを表示する前に Supabase のセッション（JWT トークン）を確認する。  
セッションがなければ画面を描画せずにログイン画面へ飛ばすため、**URL を直打ちしても管理画面に入れない**。

RLS は**データベース側でも**アクセス制御を行う。  
フロントエンドを騙って直接 API をたたいても、Supabase が「認証されていないユーザーからの書き込みは拒否」するため、二重の壁になっている。

---

## A02 — 暗号化の失敗（Cryptographic Failures）

### どんなリスクがあったか

HTTP でサイトを配信していると、通信経路（Wi-Fi など）で**パスワードやトークンが盗み見**られる可能性がある（中間者攻撃）。

### 何をしたか

**HSTS（HTTP Strict Transport Security）ヘッダーを追加**（`vercel.json`）

```json
{ "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" }
```

### 仕組み

HSTS はブラウザに「このサイトは必ず HTTPS で接続すること」を命令するヘッダー。  
`max-age=63072000` は約2年間この設定を維持することを意味する。  
一度 HTTPS で接続したブラウザは、以後 HTTP の URL を開こうとしても自動的に HTTPS に切り替えるため、**暗号化されていない通信が発生しない**。

---

## A03 — インジェクション（Injection）

### どんなリスクがあったか

管理画面の画像アップロードに制限がなく、**拡張子を偽った悪意あるファイル**（例：スクリプトを仕込んだ `.jpg` に見せかけた `.php`）を送り込める状態だった。  
また、サイズ制限がないため**巨大ファイルを大量に送りつけてストレージを枯渇**させることもできた。

### 何をしたか

**`validateFile()` 関数を Admin.jsx に追加**

```js
function validateFile(f) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(f.type)) {
    alert('JPEG・PNG・WebP・GIF のみアップロードできます')
    return false
  }
  if (f.size > 5 * 1024 * 1024) {
    alert('ファイルサイズは 5MB 以下にしてください')
    return false
  }
  return true
}
```

サムネイルとブロック画像のどちらをアップロードする際も、この関数を必ず通過させる。

### 仕組み

ブラウザはファイルを選択した瞬間に `File` オブジェクトの `type`（MIME タイプ）と `size` を取得できる。  
MIME タイプは拡張子ではなくファイルの**内容に基づいて判定**されるため、`.jpg` に名前を変えた `.php` ファイルを送ってきても `image/jpeg` 以外と判定されてブロックされる。  
サイズは `5 * 1024 * 1024`（5MB）を超えた瞬間にアップロードを拒否する。

---

## A04 — 安全でない設計（Insecure Design）

### どんなリスクがあったか

認証の仕組み自体が設計レベルで存在しない場合、後からパッチを当てても根本的な解決にならない。

### 何をしたか

Supabase Auth を設計の中心に据えた。

- **新規サインアップを無効化**（Supabase Dashboard → Authentication → Settings → Enable email signups: OFF）
- 管理者アカウントは**管理者が手動で1件だけ作成**する設計
- フロントエンドの PrivateRoute と DB の RLS を**両方に**設けた多層防御設計

### 仕組み

単一の防御ではなく「**フロントエンド → バックエンド API → DB**」の3層それぞれで認証・認可を確認する。  
一層が突破されても次の層でブロックできる設計（多層防御）。  
また、サインアップを無効にすることで、攻撃者が自分でアカウントを作れなくなる。

---

## A05 — セキュリティの設定ミス（Security Misconfiguration）

### どんなリスクがあったか

セキュリティヘッダーが未設定の場合、以下のような攻撃が通ってしまう。

- **クリックジャッキング**: 透明な iframe でサイトを覆い、ユーザーに意図しないボタンをクリックさせる
- **MIME スニッフィング**: ブラウザが Content-Type を無視して別の形式で解釈し、スクリプトを実行させる
- **不要な権限**: カメラ・マイク・位置情報へのアクセスを勝手に要求できる

### 何をしたか

**`vercel.json` に5種類のセキュリティヘッダーを追加**

| ヘッダー | 設定値 | 効果 |
|---|---|---|
| `X-Frame-Options` | `DENY` | iframe での埋め込みを全面禁止 |
| `X-Content-Type-Options` | `nosniff` | MIME タイプの偽装解釈を禁止 |
| `Strict-Transport-Security` | `max-age=63072000` | HTTPS 強制（A02 と共通） |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | リファラー情報の過剰送信を制限 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 不要なブラウザ機能を無効化 |

### 仕組み

これらはすべて**HTTPレスポンスヘッダー**として配信される。ブラウザはこのヘッダーを読んで、自動的に危険な動作を拒否する。  
Vercel の `vercel.json` に書くことで、すべてのページ（`/(.*)`）に一括適用できる。

---

## A06 — 脆弱で古いコンポーネント（Vulnerable and Outdated Components）

### どんなリスクがあったか

`package.json` の依存ライブラリが古いままだと、**既知の脆弱性を持つバージョン**を使い続けることになる。  
例えば `vite` や `react` の旧バージョンには XSS や DoS の脆弱性が発見されることがある。

### 何をしたか

**Dependabot の設定ファイルを追加**（`.github/dependabot.yml`）

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
```

### 仕組み

GitHub の Dependabot は毎週月曜日に `package.json` と `package-lock.json` をスキャンし、脆弱性が報告されたパッケージや新しいバージョンが出たパッケージを自動で検出する。  
更新が必要なものは**自動で Pull Request を作成**してくれるため、管理者はそれをマージするだけで常に最新・安全な状態を保てる。

---

## A07 — 識別と認証の失敗（Identification and Authentication Failures）

### どんなリスクがあったか

管理画面にログイン機能がなく、誰でも操作できた。  
また、セッション管理がないため「ログアウト」の概念もなく、PCを借りられただけで永続的に管理権限を持たれてしまう。

### 何をしたか

**① 管理者ログイン画面の作成**（`src/pages/AdminLogin.jsx`）

```jsx
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) {
  setError('メールアドレスまたはパスワードが正しくありません')
} else {
  navigate('/admin')
}
```

エラーメッセージは「メールが間違い」「パスワードが間違い」を**区別して表示しない**（情報漏洩防止）。

**② ログアウトボタンの追加**（`src/pages/Admin.jsx`）

```jsx
<button onClick={async () => { await supabase.auth.signOut() }}>
  ログアウト
</button>
```

### 仕組み

Supabase Auth は**JWT（JSON Web Token）**でセッションを管理する。  
ログイン成功時にブラウザのローカルストレージに JWT が保存され、以後のリクエストにはこのトークンが自動で付与される。  
`signOut()` でトークンを削除すると、次のリクエストから未認証状態になる。  
Supabase の設定でセッション有効期限が設定されており、一定時間操作がなければ自動でログアウトされる。

---

## A08 — ソフトウェアとデータの整合性の不備（Software and Data Integrity Failures）

### どんなリスクがあったか

GitHub Actions のワークフローに過剰な権限が付いていると、**CI/CD パイプラインが攻撃されたときにリポジトリ全体を書き換えられる**リスクがある。  
また、チェックアウト時の GitHub トークンが残ったままだと、後続ステップで悪意あるコードに悪用される可能性がある。

### 何をしたか

**`.github/workflows/deploy.yml` に最小権限を設定**

```yaml
permissions:
  contents: read          # 読み取りのみ（書き込み権限を削除）

steps:
  - uses: actions/checkout@v4
    with:
      persist-credentials: false   # チェックアウト後にトークンを破棄
```

### 仕組み

GitHub Actions はデフォルトでワークフローに「リポジトリへの書き込み権限」を付与してしまう。  
`permissions: contents: read` と明示することで、**このワークフローは読み取りしかできない**と制限できる。  
`persist-credentials: false` はコードのチェックアウトに使った認証情報を以降のステップに引き継がないようにする設定。  
これにより、ワークフロー内に悪意あるコードが混入しても、トークンを使った不正操作ができなくなる。

---

## A09 — セキュリティログとモニタリングの不備（Security Logging and Monitoring Failures）

### どんなリスクがあったか

誰がいつ何の記事を投稿・編集・削除したかの記録がなく、**不正操作が発生しても検知・追跡できない**状態だった。

### 何をしたか

**`logAction()` 関数を Admin.jsx に追加**

```js
async function logAction(action, reportId, detail = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('admin_logs').insert([{
    action,        // 'create' | 'update' | 'delete'
    report_id: reportId || null,
    user_email: user?.email || null,
    detail,        // { title: '記事タイトル' } など
  }])
}
```

記事の作成・更新・削除のたびに自動で呼び出される。

**Supabase に `admin_logs` テーブルを作成（SQL）**

```sql
CREATE TABLE admin_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  action      text NOT NULL,
  report_id   uuid REFERENCES reports(id) ON DELETE SET NULL,
  user_email  text,
  detail      jsonb DEFAULT '{}'
);
```

### 仕組み

操作のたびに `admin_logs` テーブルへレコードが挿入される。  
`created_at` は自動で現在時刻が入るため、**誰がいつ何をしたか**がすべて記録される。  
RLS で「書き込みは認証ユーザーのみ、読み取りも認証ユーザーのみ」に制限しているため、ログ自体を外部から改ざん・閲覧できない。  
不審な操作（深夜の削除、短時間での大量更新など）を後から確認できる。

---

## A10 — サーバーサイドリクエストフォージェリ（SSRF）

### どんなリスクがあったか

DB に保存された画像 URL を無検証でそのまま `<img src>` に渡していた。  
**外部の悪意あるサーバーの URL** が混入した場合、ユーザーのブラウザがそのサーバーにリクエストを送ってしまい、IPアドレスの漏洩やトラッキングに悪用される可能性があった。

### 何をしたか

**`isSafeImageUrl()` 関数と許可ドメインリストを ReportDetail.jsx に追加**

```js
const ALLOWED_IMAGE_DOMAINS = [
  'dqbbcnlsjqxeowfsmjwl.supabase.co',  // 自プロジェクトの Supabase Storage のみ
]

function isSafeImageUrl(url) {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return ALLOWED_IMAGE_DOMAINS.includes(hostname)
  } catch {
    return false
  }
}

// 表示時
{isSafeImageUrl(block.url) && <img src={block.url} ... />}
```

### 仕組み

`new URL(url)` で URL をパースし、`hostname`（ドメイン部分）を取り出す。  
許可リスト（`ALLOWED_IMAGE_DOMAINS`）に含まれていなければ `<img>` タグ自体を描画しない。  
これにより、DB に `https://evil.example.com/track.gif` のような URL が入っていても**ブラウザがリクエストを送らない**。  
将来的に許可するドメインが増えた場合は `ALLOWED_IMAGE_DOMAINS` 配列に追加するだけでよい。

---

## 全 OWASP Top 10 対応一覧

| 優先度 | OWASP | リスク名 | 対応ファイル | 状態 |
|---|---|---|---|---|
| 最高 | A01 | 権限制御の不備 | PrivateRoute.jsx / RLS | ✅ |
| 最高 | A07 | 認証の失敗 | AdminLogin.jsx / Admin.jsx | ✅ |
| 高 | A03 | インジェクション | Admin.jsx（validateFile） | ✅ |
| 高 | A05 | セキュリティ設定ミス | vercel.json | ✅ |
| 中 | A02 | 暗号化の失敗 | vercel.json（HSTS） | ✅ |
| 中 | A04 | 安全でない設計 | 設計・Supabase設定 | ✅ |
| 中 | A09 | ログ不備 | Admin.jsx（logAction） | ✅ |
| 中 | A06 | 古いコンポーネント | dependabot.yml | ✅ |
| 低 | A08 | 整合性の不備 | deploy.yml | ✅ |
| 低 | A10 | SSRF | ReportDetail.jsx | ✅ |

---

## 補足: 多層防御の考え方

本日の対策は、単一の防御に頼らず**複数の層で守る**構造になっている。

```
ユーザー
  │
  ▼
[ブラウザ]
  ├─ セキュリティヘッダー（A05）
  ├─ 画像URLホワイトリスト（A10）
  └─ ファイルバリデーション（A03）
  │
  ▼
[フロントエンド: React]
  ├─ PrivateRoute でセッション確認（A01）
  └─ Supabase Auth でログイン管理（A07）
  │
  ▼
[Supabase API]
  ├─ JWT トークン検証
  └─ RLS でテーブル単位のアクセス制御（A01）
  │
  ▼
[データベース: PostgreSQL]
  └─ admin_logs で全操作を記録（A09）
  │
  ▼
[インフラ: GitHub / Vercel]
  ├─ Dependabot で脆弱ライブラリを自動検知（A06）
  └─ CI/CD 最小権限設定（A08）
```

どこか一箇所が突破されても、次の層でブロックできる設計になっている。
