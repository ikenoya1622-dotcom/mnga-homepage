import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/news-detail.css'

// プライバシーポリシー（内容未確定のための「準備中」スケルトン。導線・URLを先に用意）。
// news-detail のヘッダー/記事/フッターを流用し、ブランド整合を保つ。
export default function Privacy() {
  return (
    <div className="mnga-news-detail js">
      <Seo title="プライバシーポリシー" path="/privacy" description="一般社団法人 Make Nippon Great Again（MNGA）のプライバシーポリシー。現在準備中です。" noindex />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/privacy" />

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
          <p className="crumb"><Link to="/">TOP</Link><span>/</span>プライバシーポリシー</p>
          <h1 className="art-title">プライバシーポリシー</h1>
          <div className="art-body">
            <p><strong>本プライバシーポリシーは現在準備中です。</strong>確定し次第、本ページにて公開します。</p>
            <p style={{ color: 'var(--muted)' }}>掲載を予定している主な項目：</p>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--ivory-dim)', lineHeight: 2.2 }}>
              <li>1. 個人情報の利用目的</li>
              <li>2. 取得する情報の範囲</li>
              <li>3. 第三者提供・委託について</li>
              <li>4. 安全管理措置</li>
              <li>5. 開示・訂正・利用停止のご請求</li>
              <li>6. お問い合わせ窓口</li>
            </ul>
            <p className="art-note">本ポリシー公開までの間、個人情報を取得するお問い合わせ・お申込みの受付は行っておりません。</p>
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
