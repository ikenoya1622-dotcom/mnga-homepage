import { Helmet } from 'react-helmet-async'
import { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, absUrl } from '../lib/site'

/**
 * ページ単位の <head> メタを宣言する共通コンポーネント。
 * - title は「ページ名 ─ MNGA」形式に整形（home は素のサイト名）
 * - canonical / og:url は path から絶対URL化
 * - jsonLd は1件でも配列でも可（複数の構造化データを並べられる）
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} ─ MNGA` : SITE_NAME
  const url = absUrl(path)
  const ogImage = absUrl(image)
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet prioritizeSeoTags>
      <html lang="ja" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  )
}
