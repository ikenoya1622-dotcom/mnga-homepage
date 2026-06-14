// Generates page-scoped CSS files from the MNGA mock HTML files.
// Each mock's <style> block is parsed and every selector is prefixed with a
// unique root class (e.g. `.mnga-top`) so the six pages stay isolated from one
// another and from the admin pages when Vite bundles all CSS globally.
//
// Run:  node scripts/scope-mock-css.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MOCKS = path.resolve(
  ROOT,
  '..',
  'Obsidian Vault',
  '01_プロジェクト',
  'MNGA',
  '02_サイト制作',
  'mocks',
)
const OUT_DIR = path.join(ROOT, 'src', 'styles', 'mnga')

const PAGES = [
  { file: 'mock_top.html', out: 'top.css', root: 'mnga-top' },
  { file: 'mock_about.html', out: 'about.css', root: 'mnga-about' },
  { file: 'mock_activities.html', out: 'activities.css', root: 'mnga-activities' },
  { file: 'mock_report.html', out: 'report.css', root: 'mnga-report' },
  { file: 'mock_report_detail.html', out: 'report-detail.css', root: 'mnga-report-detail' },
  { file: 'mock_news_detail.html', out: 'news-detail.css', root: 'mnga-news-detail' },
]

function extractStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/)
  return m ? m[1] : ''
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

// Split a selector list on top-level commas (ignore commas inside parens).
function splitSelectors(sel) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of sel) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur)
  return out
}

function scopeSelector(sel, root) {
  sel = sel.trim()
  if (!sel) return sel
  const R = '.' + root
  if (sel === ':root') return R
  if (sel === '*') return `${R}, ${R} *`
  if (sel === '::selection') return `${R} ::selection`
  // `html::after` (the vignette) would collide with `body::after` (the grain)
  // once both are scoped to the same root pseudo-element. Route the vignette to
  // a dedicated child element (`.mnga-vignette`, rendered in the page markup).
  if (/^html::(before|after)\b/.test(sel)) return `${R} .mnga-vignette` + sel.replace(/^html/, '')
  if (/^html\b/.test(sel)) return R + sel.replace(/^html/, '')
  if (/^body\b/.test(sel)) return R + sel.replace(/^body/, '')
  return `${R} ${sel}`
}

function parse(css) {
  let i = 0
  function readBalanced() {
    let depth = 1
    let body = ''
    while (i < css.length && depth > 0) {
      const c = css[i]
      if (c === '{') { depth++; body += c; i++ }
      else if (c === '}') { depth--; if (depth === 0) { i++; break } body += c; i++ }
      else { body += c; i++ }
    }
    return body
  }
  function parseBlock() {
    const rules = []
    while (i < css.length) {
      let prelude = ''
      while (i < css.length && css[i] !== '{' && css[i] !== '}') { prelude += css[i]; i++ }
      if (i >= css.length) break
      if (css[i] === '}') { i++; return rules }
      i++ // consume {
      const selector = prelude.trim()
      if (/^@(-\w+-)?keyframes\b/.test(selector) || /^@font-face\b/.test(selector)) {
        rules.push({ type: 'verbatim', selector, body: readBalanced() })
      } else if (/^@(media|supports)\b/.test(selector)) {
        rules.push({ type: 'nested', selector, inner: parseBlock() })
      } else {
        rules.push({ type: 'rule', selector, body: readBalanced() })
      }
    }
    return rules
  }
  return parseBlock()
}

function emit(tree, root) {
  let s = ''
  for (const n of tree) {
    if (n.type === 'rule') {
      const sels = splitSelectors(n.selector).map((x) => scopeSelector(x, root)).join(', ')
      s += `${sels}{${n.body}}\n`
    } else if (n.type === 'verbatim') {
      s += `${n.selector}{${n.body}}\n`
    } else if (n.type === 'nested') {
      s += `${n.selector}{\n${emit(n.inner, root)}}\n`
    }
  }
  return s
}

function fixUrls(css) {
  return css
    .replace(/url\((['"]?)images\//g, 'url($1/images/')
    .replace(/url\((['"]?)act-img\//g, 'url($1/act-img/')
    .replace(/url\(['"]?[^)]*board\/櫻田\.jpg['"]?\)/g, "url('/images/board/櫻田.jpg')")
}

// iOS Safari hardening. The mocks omit vendor prefixes / units that desktop
// Chromium tolerates but iPhone Safari does not, which made every page look
// broken on iOS:
//   - `backdrop-filter` needs `-webkit-backdrop-filter` or the fixed header
//     blur silently fails and page content bleeds through the translucent bar.
//   - `svh` is unsupported before iOS 15.4; emit a `vh` fallback first so the
//     hero / sticky-deck cards keep their full height on older iPhones.
function iosFixes(css) {
  return css
    .replace(/(^|[;{])(\s*)backdrop-filter:\s*([^;}]+)/g,
      (_m, pre, ws, val) => `${pre}${ws}-webkit-backdrop-filter:${val.trim()};${ws}backdrop-filter:${val.trim()}`)
    .replace(/([\w-]+)\s*:\s*(\d+(?:\.\d+)?)svh/g, '$1:$2vh;$1:$2svh')
}

fs.mkdirSync(OUT_DIR, { recursive: true })
for (const p of PAGES) {
  const html = fs.readFileSync(path.join(MOCKS, p.file), 'utf8')
  const style = stripComments(extractStyle(html))
  const tree = parse(style)
  let scoped = emit(tree, p.root)
  scoped = fixUrls(scoped)
  scoped = iosFixes(scoped)
  // Restore the implicit 16px base that the mock relied on (mock <body> had no
  // explicit font-size; the app's global body sets 20px which we must not inherit).
  const header = `/* AUTO-GENERATED from ${p.file} by scripts/scope-mock-css.mjs — do not edit by hand */\n.${p.root}{font-size:16px;}\n`
  fs.writeFileSync(path.join(OUT_DIR, p.out), header + scoped)
  console.log(`wrote src/styles/mnga/${p.out}  (${scoped.length} bytes)`)
}
