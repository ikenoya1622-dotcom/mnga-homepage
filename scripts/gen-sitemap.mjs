// ビルド時に public/sitemap.xml を生成する。
// 静的ルートは常時出力。Supabase env があれば News/Report の動的URLも追加する。
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

// .env を簡易ロード（ローカル実行時。Vercelでは process.env に既に入る）
function loadEnv() {
  const env = { ...process.env }
  try {
    const raw = fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/)
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
  return env
}

const env = loadEnv()
const SITE_URL = (env.VITE_SITE_URL || 'https://mnga-hp-grf3.vercel.app').replace(/\/$/, '')

const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/activities', priority: '0.8', changefreq: 'monthly' },
  { loc: '/report', priority: '0.7', changefreq: 'weekly' },
]

async function fetchDynamic() {
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.log('[sitemap] Supabase env なし → 動的URLはスキップ（静的ルートのみ）')
    return []
  }
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url, key)
    const out = []
    const today = new Date().toISOString()
    const news = await sb.from('news_items').select('id, published_at').lte('published_at', today)
    for (const n of news.data || []) out.push({ loc: `/news/${n.id}`, priority: '0.6', changefreq: 'monthly', lastmod: n.published_at })
    const reports = await sb.from('reports').select('id, published_at').lte('published_at', today)
    for (const r of reports.data || []) out.push({ loc: `/report/${r.id}`, priority: '0.6', changefreq: 'monthly', lastmod: r.published_at })
    console.log(`[sitemap] 動的URL: news=${news.data?.length || 0} reports=${reports.data?.length || 0}`)
    return out
  } catch (e) {
    console.warn('[sitemap] 動的URL取得に失敗（静的のみ出力）:', e.message)
    return []
  }
}

const dynamic = await fetchDynamic()
const all = [...staticRoutes, ...dynamic]

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  all
    .map(
      (u) =>
        `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n` +
        (u.lastmod ? `    <lastmod>${String(u.lastmod).slice(0, 10)}</lastmod>\n` : '') +
        `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n') +
  `\n</urlset>\n`

const outPath = path.join(ROOT, 'public', 'sitemap.xml')
fs.writeFileSync(outPath, xml)
console.log(`[sitemap] 生成: public/sitemap.xml（${all.length} URL, base=${SITE_URL}）`)
