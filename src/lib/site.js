// ===== サイト全体のメタ設定（SEO/OG/構造化データの単一の出所） =====
// 本番ドメインが決まったら Vercel の環境変数 VITE_SITE_URL に設定してください。
// 未設定時は暫定で Vercel プロジェクトURLを使用します。
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mnga-hp-grf3.vercel.app').replace(/\/$/, '')

export const SITE_NAME = 'MNGA — Make Nippon Great Again'
export const ORG_NAME = '一般社団法人 Make Nippon Great Again'
export const DEFAULT_TITLE = 'MNGA — Make Nippon Great Again'
export const DEFAULT_DESCRIPTION =
  '一般社団法人 MNGA（Make Nippon Great Again）は、大企業とベンチャーを接続し、新産業を案件化・検証・事業化まで前進させる、経営者と起業家の共創・実装プラットフォームです。'
export const DEFAULT_OG_IMAGE = '/images/ogp.png' // ASCII名（I-3）。本番ではOG専用画像(1200x630)を推奨

// 絶対URLを組み立てる（canonical / og:url / og:image 用）
export function absUrl(path = '/') {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  return SITE_URL + (path.startsWith('/') ? path : '/' + path)
}

// 組織（Organization）構造化データ ─ 全ページ共通でブランドSERPを補強
export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ORG_NAME,
  alternateName: 'MNGA',
  url: SITE_URL,
  logo: absUrl('/mnga-horizontal.png'),
  description: DEFAULT_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'JP',
    addressRegion: 'xxx',
    addressLocality: 'xxx',
    streetAddress: 'xxx',
    postalCode: 'xxx',
  },
  areaServed: 'JP',
}
