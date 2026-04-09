# セキュリティ実装記録 2
## 実装日: 2026-04-09

---

## 実装概要

前回（記録1）で A01・A05・A07 を対応済み。  
今回は残りの優先事項（A03・A06・A08・A09・A10）をすべて実装した。

---

## 実装内容

### 1. ファイルアップロードのバリデーション（A03）

**ファイル:** `src/pages/Admin.jsx`（変更）

**内容:**
- `validateFile(f)` 関数を新規追加
- サムネイル・ブロック画像の両方のアップロード前に呼び出し
- 不正ファイルは `e.target.value = ''` でリセットし、アップロードをブロック

**バリデーション内容:**

| チェック項目 | 許可値 |
|---|---|
| MIMEタイプ | `image/jpeg`, `image/png`, `image/webp`, `image/gif` のみ |
| ファイルサイズ | 5MB 以下 |

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

**防げる攻撃:**
- 悪意あるスクリプトファイル（.js/.php など）の偽装アップロード
- 巨大ファイルによるストレージ枯渇（DoS）

---

### 2. Dependabot による依存関係の自動更新（A06）

**ファイル:** `.github/dependabot.yml`（新規作成）

**内容:**
- npm パッケージを毎週月曜日に自動チェック
- 脆弱性のある依存パッケージを PR で通知・更新

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

**防げる攻撃:**
- 既知の脆弱性を持つライブラリの放置による攻撃（Supply Chain Attack）

---

### 3. CI/CD の最小権限設定（A08）

**ファイル:** `.github/workflows/deploy.yml`（変更）

**変更点:**
- `permissions: contents: read` を追加（デフォルトの過剰権限を排除）
- `persist-credentials: false` を追加（チェックアウト後に GitHub トークンを破棄）

```yaml
permissions:
  contents: read

jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
```

**防げる攻撃:**
- CI/CD パイプライン経由でのリポジトリへの不正書き込み
- ワークフロー内でのトークン漏洩・悪用

---

### 4. 操作ログの記録（A09）

**ファイル:** `src/pages/Admin.jsx`（変更）

**内容:**
- `logAction(action, reportId, detail)` 関数を追加
- 記事の作成・更新・削除のたびに `admin_logs` テーブルへ記録
- ログ失敗はサイレントに無視（UI への影響なし）

```js
async function logAction(action, reportId, detail = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('admin_logs').insert([{
    action,
    report_id: reportId || null,
    user_email: user?.email || null,
    detail,
  }])
}
```

**記録されるイベント:**

| イベント | action 値 | 記録内容 |
|---|---|---|
| 記事作成 | `create` | 記事ID・タイトル |
| 記事更新 | `update` | 記事ID・タイトル |
| 記事削除 | `delete` | 記事ID |

**Supabase で必要な手動作業（SQL Editor で実行）:**

```sql
-- admin_logs テーブルの作成
CREATE TABLE admin_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz DEFAULT now(),
  action      text NOT NULL,           -- 'create' | 'update' | 'delete'
  report_id   uuid REFERENCES reports(id) ON DELETE SET NULL,
  user_email  text,
  detail      jsonb DEFAULT '{}'
);

-- RLS: 認証ユーザーのみ挿入可、読み取りも認証ユーザーのみ
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated can read logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (true);
```

**防げる攻撃・リスク:**
- 不正操作の検知・追跡が可能になる
- インシデント発生時の原因調査が容易になる

---

### 5. 画像URLのドメイン制限（A10）

**ファイル:** `src/pages/ReportDetail.jsx`（変更）

**内容:**
- `ALLOWED_IMAGE_DOMAINS` 定数に許可ドメインを定義（現在は Supabase のみ）
- `isSafeImageUrl(url)` で URL をパース・検証
- 許可ドメイン以外の画像は表示しない

```js
const ALLOWED_IMAGE_DOMAINS = [
  'dqbbcnlsjqxeowfsmjwl.supabase.co',
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
```

**防げる攻撃:**
- 外部の悪意あるサーバーへの画像リクエスト（情報漏洩・トラッキング）
- DB に不正な外部 URL が混入した場合の XSS・フィッシングリスク軽減

---

## 変更ファイル一覧

| ファイル | 種別 | 変更内容 |
|---|---|---|
| `src/pages/Admin.jsx` | 変更 | validateFile() + logAction() 追加 |
| `src/pages/ReportDetail.jsx` | 変更 | 画像URLドメインホワイトリスト追加 |
| `.github/dependabot.yml` | 新規作成 | npm 週次自動更新設定 |
| `.github/workflows/deploy.yml` | 変更 | 最小権限・資格情報破棄設定 |

---

## 対応した OWASP 項目（今回分）

| OWASP | 項目名 | 対応内容 |
|---|---|---|
| **A03** | インジェクション | ファイルアップロードのMIME・サイズバリデーション |
| **A06** | 脆弱で古いコンポーネント | Dependabot で依存関係を週次自動更新 |
| **A08** | ソフトウェアとデータの整合性の不備 | CI/CD に最小権限・資格情報破棄を設定 |
| **A09** | セキュリティログとモニタリングの不備 | admin_logs テーブルで操作ログを記録 |
| **A10** | サーバーサイドリクエストフォージェリ | 画像URLにドメインホワイトリストを適用 |

---

## 全 OWASP Top 10 対応状況

| OWASP | 項目名 | 対応状況 |
|---|---|---|
| A01 | 権限制御の不備 | ✅ PrivateRoute + RLS（記録1） |
| A02 | 暗号化の失敗 | ✅ HTTPS強制（Vercel + HSTS） |
| A03 | インジェクション | ✅ ファイルバリデーション（今回） |
| A04 | 安全でない設計 | ✅ Supabase Auth + RLS 設計 |
| A05 | セキュリティの設定ミス | ✅ セキュリティヘッダー（記録1） |
| A06 | 脆弱で古いコンポーネント | ✅ Dependabot（今回） |
| A07 | 識別と認証の失敗 | ✅ Supabase Auth ログイン（記録1） |
| A08 | ソフトウェアの整合性の不備 | ✅ CI/CD最小権限（今回） |
| A09 | ログとモニタリングの不備 | ✅ admin_logs（今回） |
| A10 | SSRF | ✅ 画像URLホワイトリスト（今回） |
