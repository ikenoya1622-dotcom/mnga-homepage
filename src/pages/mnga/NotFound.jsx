import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/news-detail.css'

// 既存の news-detail のヘッダー/記事レイアウトを流用した、ブランド整合の404。
export default function NotFound() {
  return (
    <div className="mnga-news-detail js">
      <Seo title="ページが見つかりません" path="/404" noindex />
      <MobileNav current="/" />

      <header className="site-header solid" id="ahdr">
        <nav className="site-nav">
          <Link className="site-logo" to="/" aria-label="MNGA"><img src="/mnga-horizontal-white.png" alt="MNGA ロゴ" /></Link>
          <div className="site-nav__links">
            <Link to="/">TOP</Link>
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
          </div>
        </nav>
      </header>

      <main>
        <article className="article" style={{ textAlign: 'center', minHeight: '52vh' }}>
          <p className="en" style={{ fontSize: 13, letterSpacing: '.32em', color: '#8f8f80', marginBottom: 18 }}>404 — NOT FOUND</p>
          <h1 className="art-title" style={{ borderBottom: 'none', paddingBottom: 0 }}>ページが見つかりませんでした</h1>
          <p className="art-body">お探しのページは、移動または削除された可能性があります。URLをご確認のうえ、トップページからお進みください。</p>
          <div className="art-back"><Link to="/" className="en">Back to Home</Link></div>
        </article>
      </main>
    </div>
  )
}
