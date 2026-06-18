import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis } from '../../lib/mngaMotion'
import { Preloader, Vignette } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/about.css'
import Seo from '../../components/Seo'
import { ORGANIZATION_JSONLD } from '../../lib/site'

const REVEAL_SEL = '.reveal, .cover__jp, .cover__en, .cover__q, .cover__scroll, .tagline, .close__lead, .shield'

export default function About() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = prefersReduced()
    const isMobile = window.matchMedia('(max-width: 820px)').matches
    const q = (s) => Array.from(root.querySelectorAll(s))
    const q1 = (s) => root.querySelector(s)
    const tweens = []
    const triggers = []
    let lenis = null
    let ticker = null
    let timeoutId = null
    let cancelled = false

    document.body.classList.add('mnga-active')
    const pre = q1('#preloader')

    // Preloader
    if (pre) {
      if (reduce) { pre.style.display = 'none' } else {
        const tl = gsap.timeline()
        tl.to('#preloader .preloader__bar', { opacity: 1, duration: 0.3 })
          .to('#preloader .preloader__logo', { opacity: 1, duration: 0.6 }, '-=.1')
          .to('#preloader .preloader__txt', { opacity: 1, duration: 0.5 }, '-=.35')
          .to('#preloader .preloader__bar i', { width: '100%', duration: 0.9, ease: 'power1.inOut' }, '-=.5')
          .to('#preloader', { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '+=.15')
          .add(() => { if (pre) pre.style.display = 'none' })
        tweens.push(tl)
        timeoutId = setTimeout(() => {
          if (pre && getComputedStyle(pre).display !== 'none') pre.style.display = 'none'
        }, 4000)
      }
    }

    if (!reduce) {
      loadLenis().then((Lenis) => {
        if (cancelled || !Lenis) return
        lenis = new Lenis({ duration: 1.15, smoothWheel: true })
        lenis.on('scroll', ScrollTrigger.update)
        ticker = (t) => lenis.raf(t * 1000)
        gsap.ticker.add(ticker)
        gsap.ticker.lagSmoothing(0)
      })
    }

    const cards = q('.card')
    const nodes = q('.thread__node')

    // Thread fill draws down to just before the closing card.
    if (cards.length) {
      tweens.push(
        gsap.to(q1('.thread__fill'), {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: q1('.deck'), start: 'top top', end: () => cards[cards.length - 1].offsetTop, scrub: true },
        }),
      )
    }

    const depthZ = isMobile ? 150 : 300
    cards.forEach((card, i) => {
      const items = card.querySelectorAll(REVEAL_SEL)
      const glyph = card.querySelector('.glyph__char')
      const inner = card.querySelector('.card__inner')

      if (reduce) {
        gsap.set(items, { opacity: 1, y: 0 })
        if (glyph) gsap.set(glyph, { opacity: 1, scale: 1 })
      } else {
        if (glyph) {
          tweens.push(gsap.to(glyph, { opacity: 1, scale: 1, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 60%', once: true } }))
        }
        tweens.push(gsap.to(items, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 55%', once: true } }))
      }

      if (nodes[i - 1]) {
        triggers.push(ScrollTrigger.create({ trigger: card, start: 'top 55%', end: 'bottom 45%', onToggle: (s) => nodes[i - 1].classList.toggle('is-active', s.isActive) }))
      }

      if (inner && !reduce && i < cards.length - 1) {
        tweens.push(gsap.to(inner, { z: depthZ, scale: 1.05, opacity: 0, ease: 'power1.in', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 35%', scrub: true } }))
      }
    })

    // Nexus bridge
    const bridge = q1('.nexus .bridge i')
    if (bridge) {
      if (reduce) bridge.style.width = '100%'
      else tweens.push(gsap.to(bridge, { width: '100%', ease: 'power2.inOut', duration: 1.2, scrollTrigger: { trigger: q1('.nexus'), start: 'top 68%', once: true } }))
    }

    // GDP chart lines
    q('.chart .ln').forEach((ln, i) => {
      const len = ln.getTotalLength()
      gsap.set(ln, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len })
      if (!reduce) {
        tweens.push(gsap.to(ln, { strokeDashoffset: 0, ease: 'power2.out', duration: 1.5 + i * 0.25, scrollTrigger: { trigger: q1('.chart'), start: 'top 80%', once: true } }))
      }
    })

    // Hide the thread after leaving the deck.
    const deck = q1('.deck')
    if (deck) {
      triggers.push(ScrollTrigger.create({
        trigger: deck, start: 'top top', end: 'bottom top',
        onLeave: () => gsap.to(q1('.thread'), { opacity: 0, duration: 0.4, pointerEvents: 'none' }),
        onEnterBack: () => gsap.to(q1('.thread'), { opacity: 1, duration: 0.4 }),
      }))
    }

    // Header solid
    const ahdr = q1('#ahdr')
    if (ahdr) triggers.push(ScrollTrigger.create({ start: 'top -30', onUpdate: (s) => ahdr.classList.toggle('solid', s.scroll() > 30) }))

    ScrollTrigger.refresh()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      tweens.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
      triggers.forEach((t) => t.kill())
      if (ticker) gsap.ticker.remove(ticker)
      if (lenis) lenis.destroy()
      document.body.classList.remove('mnga-active')
    }
  }, [])

  return (
    <div className="mnga-about js" ref={rootRef}>
      <Seo title="団体概要" path="/about" description="MNGAはなぜつくられたのか。失った30年・一人の問い・断絶、そして接続。大企業とベンチャーをつなぎ、構想を事業化・社会実装まで実行する産業実装基盤の物語。" jsonLd={ORGANIZATION_JSONLD} />
      <Vignette />
      <Preloader variant="logo" caption="Make Nippon Great Again" />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/about" />

      <header className="site-header" id="ahdr">
        <nav className="site-nav" aria-label="メインナビゲーション">
          <Link className="site-logo" to="/" aria-label="MNGA"><img src="/mnga-horizontal-white.png" alt="MNGA ロゴ" /></Link>
          <div className="site-nav__links">
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
            <a className="site-nav__cta en" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>問い合わせ（準備中）</a>
          </div>
        </nav>
      </header>

      <div className="thread" aria-hidden="true">
        <div className="thread__track" />
        <div className="thread__fill" />
        <span className="thread__node" style={{ top: '8%' }} />
        <span className="thread__node" style={{ top: '26%' }} />
        <span className="thread__node" style={{ top: '43%' }} />
        <span className="thread__node" style={{ top: '60%' }} />
        <span className="thread__node" style={{ top: '78%' }} />
      </div>

      <main className="deck" id="main">
        {/* 表紙 */}
        <section className="card cover" data-card="0">
          <div className="veil" />
          <div className="card__inner">
            <h1 className="cover__jp">いなくては<br />ならない日本へ</h1>
            <p className="cover__en en">Make Nippon Great Again<br />Co-Creation &amp; Implementation Platform for an Indispensable Japan</p>
            <p className="cover__q">なぜ、私たちはこの団体をつくったのか。</p>
          </div>
          <p className="cover__scroll">SCROLL ─ めくる</p>
        </section>

        {/* 壱：失 */}
        <section className="card" data-card="1">
          <div className="veil" />
          <div className="card__inner">
            <div className="lede">
              <p className="kana reveal">THE LOST 30 YEARS</p>
              <h2 className="title reveal">この30年を、<br />「失われた」とは呼ばない。</h2>
              <p className="body reveal">日本のこの30年を、私たちは「失われた30年」とは呼びません。<strong>私たち自身が「失った」30年</strong>です。共通の将来像を描けず、計画を執行まで運べず、既存事業を守るために自己変革から逃げてきた——その結果、新しい産業が生まれず、日本の停滞を招いたのです。</p>
              <div className="chart reveal">
                <div className="chart__cap">名目GDP（米ドル）　1995 → 2023</div>
                <svg className="chart__svg" viewBox="0 0 690 262" preserveAspectRatio="xMidYMid meet" role="img" aria-label="日本・米国・中国の名目GDP推移。日本だけが横ばい。">
                  <line className="chart__base" x1="40" y1="240" x2="520" y2="240" />
                  <path className="ln ln--cn" d="M40,234 L126,230 L211,222 L297,192 L383,151 L469,121 L520,96" />
                  <path className="ln ln--us" d="M40,180 L126,160 L211,138 L297,122 L383,96 L469,72 L520,22" />
                  <path className="ln ln--jp" d="M40,196 L126,200 L211,202 L297,194 L383,204 L469,199 L520,206" />
                  <text className="lb lb--us" x="528" y="25">米国 27.8兆</text>
                  <text className="lb lb--cn" x="528" y="99">中国 18.4兆</text>
                  <text className="lb lb--jp" x="528" y="209">日本 4.4兆</text>
                  <text className="lb lb--jp0" x="34" y="193" textAnchor="end">5.6兆</text>
                  <text className="ax" x="40" y="256">1995</text>
                  <text className="ax" x="520" y="256" textAnchor="end">2023</text>
                </svg>
                <div className="chart__src">出典：IMF World Economic Outlook (2026.04)　単位：兆ドル</div>
              </div>
            </div>
          </div>
        </section>

        {/* 弐：問 */}
        <section className="card" data-card="2">
          <div className="veil" />
          <div className="card__inner">
            <div className="lede">
              <p className="kana reveal">THE QUESTION</p>
              <p className="say reveal">「停滞を招いたのは、政府でも、国民でもない。<br />経営者である」</p>
              <p className="body reveal">そして、<strong>自らもその一人だ</strong>——私たちはそう考えます。MNGAは、この問題意識から設立されました。停滞を招いたのが経営者の責任なら、それを変えられるのも、また経営者です。</p>
            </div>
          </div>
        </section>

        {/* 参：断 */}
        <section className="card" data-card="3">
          <div className="veil" />
          <div className="card__inner">
            <div className="lede">
              <p className="kana reveal">THE DISCONNECT</p>
              <h2 className="title reveal">足りなかったのは構想ではなく、<br />「つなぐ仕組み」だった。</h2>
              <p className="body reveal">このような停滞を打破するには、日本が持つ技術・人材・精神性を掛け合わせ、世界に新たな価値を生み出す新産業が必要です。足りないのは構想ではなく、構想を事業化・実装まで運ぶ<strong>「回路」</strong>。世界に不可欠な新産業を生み出すことで、日本を「いなくてはならない国」と再定義します。</p>
              <p className="body reveal">大企業には豊富な資本・顧客基盤・社会実装力がある一方、既存事業に縛られ、自己変革や外部共創の機敏性に欠ける。ベンチャーには迅速な意思決定と実行力がある一方、実装フィールドや市場・顧客からの信用、大企業との接点が足りない。<strong>これらを補いあうこと</strong>が、日本に新産業を生み出すために不可欠です。</p>
            </div>
          </div>
        </section>

        {/* 肆：接 */}
        <section className="card" data-card="4">
          <div className="veil" />
          <div className="card__inner">
            <div className="lede">
              <p className="kana reveal">OUR ROLE</p>
              <h2 className="title reveal">大企業とベンチャーを、<br />「接続」する実装基盤。</h2>
              <p className="body reveal">MNGAの役割は、大企業とベンチャーを接続し、新産業の<strong>案件化・検証・事業化まで前進させる仕組みづくり</strong>です。大企業の資本・顧客基盤・社会実装力とベンチャーの意思決定・実行力を接続し、PoCで終わらせず、迅速な検証から事業化・実装まで実行します。</p>
              <p className="body reveal">多くの経済団体が交流に留まるなか、MNGAは協業・提携から新産業創出までを実現する、経営者と起業家の共創プラットフォームです。</p>
              <div className="nexus reveal">
                <div className="p"><div className="k">大企業</div><div className="s">資本・顧客基盤・社会実装力</div></div>
                <div className="bridge"><i /></div>
                <div className="p" style={{ textAlign: 'right' }}><div className="k">ベンチャー</div><div className="s">意思決定・実行力</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* 伍：実 */}
        <section className="card" data-card="5">
          <div className="veil" />
          <div className="card__inner">
            <div className="lede">
              <p className="kana reveal">FROM WORDS TO RESULTS</p>
              <h2 className="title reveal">語ることではなく、<br />事業を通じて結果を残す。</h2>
              <p className="body reveal">評価基準・撤退ルール・共創の規律を明示し、<strong>場の品質を担保</strong>します。提言で終わらせず、実装まで行く。私たちが進める協業案件は、売上だけでなく、生活者価値・社会実装可能性で評価します。</p>
              <p className="body reveal">協業・提携を掲げるだけでは終わらせません。立ち上げ期は、大企業の経営層とベンチャーの意思決定者の双方から信頼される<strong>人物の問題意識と人的基盤</strong>によって、初期参加者の質を担保。中長期は、人材交流・育成・マッチングの運営基盤を構築し、新産業の創出を実現します。</p>
            </div>
          </div>
        </section>

        {/* 結び（反転） */}
        <section className="card card--close" data-card="6">
          <div className="card__inner">
            <p className="tagline">前進を、取り戻す。<span className="en">Toward an Indispensable Japan.</span></p>
            <p className="close__lead">世界にとって不可欠な新産業を生み出すことで、停滞した日本を、再び前へ進める。それが、私たちがこの団体をつくった理由です。</p>
            <p className="shield">私たちの “Again” は、復古ではなく前進です。“Great” は、規模ではなく不可欠性です。本団体は政治的・宗教的な含意を一切持たず、経団連・経済同友会が築いてきた産業共創の系譜に連なる、非政治・中立の団体です。</p>
          </div>
        </section>
      </main>

      <div className="after">
        <footer className="site-footer">
          <div className="awrap">
            <div className="foot-grid">
              <div>
                <Link className="foot-logo-link" to="/"><img className="foot-logo" src="/mnga-horizontal.png" alt="MNGA" /></Link>
                <p className="foot-org">一般社団法人 Make Nippon Great Again<br />〒xxx-xxxx xxx<br />平日 10:00–18:00（JST）</p>
              </div>
              <div className="foot-nav">
                <Link to="/about">ABOUT</Link>
                <Link to="/activities">ACTIVITIES</Link>
                <Link to="/report">REPORTS</Link>
                <Link to="/#news">NEWS</Link>
                <a role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>CONTACT（準備中）</a>
              </div>
            </div>
            <p className="foot-neutral">私たちの “Again” は、復古ではなく前進です。“Great” は、規模ではなく不可欠性です。本団体は政治的・宗教的な含意を一切持たず、経団連・経済同友会が築いてきた産業共創の系譜に連なる、非政治・中立のプラットフォームです。</p>
            <p className="foot-copy en">© 2026 Make Nippon Great Again. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
