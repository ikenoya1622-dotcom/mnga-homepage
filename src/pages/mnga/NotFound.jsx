import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/news-detail.css'

// 既存の news-detail のヘッダー/記事レイアウトを流用した、ブランド整合の404。
export default function NotFound() {
  return (
    <div className="mnga-news-detail js">
      <Seo title="ページが見つかりません" path="/404" noindex />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/" />

      <header className="site-header solid" id="ahdr">
        <nav className="site-nav" aria-label="メインナビゲーション">
          <Link className="site-logo" to="/" aria-label="MNGA"><img src="/mnga-horizontal-white.png" alt="MNGA ロゴ" /></Link>
          <div className="site-nav__links">
            <Link to="/">TOP</Link>
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
          </div>
        </nav>
      </header>

      <main id="main">
        <article className="article" style={{ textAlign: 'center', minHeight: '52vh' }}>
          <p className="en" style={{ fontSize: 13, letterSpacing: '.32em', color: '#8f8f80', marginBottom: 18 }}>404 ― NOT FOUND</p>
          <h1 className="art-title" style={{ borderBottom: 'none', paddingBottom: 0 }}>ページが見つかりませんでした</h1>
          <p className="art-body">お探しのページは、移動または削除された可能性があります。URLをご確認のうえ、トップページからお進みください。</p>
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
              <Link to="/">TOP</Link>
              <Link to="/about">ABOUT</Link>
              <Link to="/activities">ACTIVITIES</Link>
              <Link to="/report">REPORTS</Link>
              <Link to="/#news">NEWS</Link>
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
