import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/news-detail.css'

// 法人概要（内容未確定のための枠。導線・URLを先に用意）。
// 確定済みの団体名のみ記載し、個人名・未確定項目は「準備中」とする。
const ROWS = [
  ['名称', '一般社団法人 Make Nippon Great Again'],
  ['設立年月日', '準備中'],
  ['主たる事務所', '準備中'],
  ['代表理事', '準備中'],
  ['役員一覧', '準備中'],
  ['事業目的', '準備中'],
  ['連絡先', '準備中'],
  ['決算公告', '準備中'],
]

export default function Organization() {
  return (
    <div className="mnga-news-detail js">
      <Seo title="法人概要" path="/organization" description="一般社団法人 Make Nippon Great Again（MNGA）の法人概要。詳細は順次公開します。" noindex />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/organization" />

      <header className="site-header solid" id="ahdr">
        <nav className="site-nav" aria-label="メインナビゲーション">
          <Link className="site-logo" to="/" aria-label="MNGA"><img src="/mnga-horizontal-white.png" alt="MNGA ロゴ" /></Link>
          <div className="site-nav__links">
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
            <Link to="/news">NEWS</Link>
          </div>
        </nav>
      </header>

      <main id="main">
        <article className="article">
          <p className="crumb"><Link to="/">TOP</Link><span>/</span>法人概要</p>
          <h1 className="art-title">法人概要</h1>
          <div className="art-body">
            <p><strong>本ページは準備中です。</strong>代表理事・設立年月日・役員一覧・連絡先・決算公告などの詳細は、確定し次第、順次公開します。</p>
            <dl style={{ margin: '36px 0 0', borderTop: '1px solid var(--hair)' }}>
              {ROWS.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    gap: '16px',
                    padding: '18px 0',
                    borderBottom: '1px solid var(--hair)',
                  }}
                >
                  <dt style={{ color: 'var(--ivory-dim)', fontSize: '.92rem', letterSpacing: '.04em' }}>{label}</dt>
                  <dd style={{ margin: 0, color: value === '準備中' ? 'var(--muted)' : 'var(--ivory)' }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="art-back"><Link to="/" className="en">Back to Home</Link></div>
        </article>
      </main>

      <footer className="site-footer">
        <div className="awrap">
          <div className="foot-grid">
            <div>
              <Link className="foot-logo-link" to="/"><img className="foot-logo" src="/mnga-horizontal.png" alt="MNGA" /></Link>
              <p className="foot-org">一般社団法人 Make Nippon Great Again<br />〒xxx-xxxx xxx<br />平日 10:00–18:00（JST）</p>
            </div>
            <nav className="foot-nav" aria-label="フッターナビゲーション">
              <Link to="/about">ABOUT</Link>
              <Link to="/activities">ACTIVITIES</Link>
              <Link to="/report">REPORTS</Link>
              <Link to="/news">NEWS</Link>
              <Link to="/privacy">プライバシーポリシー</Link>
              <Link to="/organization">法人概要</Link>
              <a role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>CONTACT（準備中）</a>
            </nav>
          </div>
          <p className="foot-neutral">私たちの “Again” は、復古ではなく前進です。“Great” は、規模ではなく不可欠性です。本団体は政治的・宗教的な含意を一切持たず、経団連・経済同友会が築いてきた産業共創の系譜に連なる、非政治・中立のプラットフォームです。</p>
          <p className="foot-copy en">© 2026 Make Nippon Great Again. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
