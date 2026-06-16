import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis, observeSplitLines } from '../../lib/mngaMotion'
import { SplitLines, Preloader } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/activities.css'
import Seo from '../../components/Seo'

const FEATURES = [
  {
    id: 'f1', flip: false, img: '/act-img/act-ikusei.jpg', fallback: '/act-img/bg-night.jpg',
    h: ['経営者育成', '― 地力と視座を磨く'],
    body: <>第一線の経営者による講話と対話を通じて、覚悟と視座を磨く場（プログラム名：<strong>櫻田塾</strong>）。アドバイスではなく経験を共有する——上から目線の助言ではなく、<strong>経営者同士が対等に学び合う</strong>設計です。</>,
  },
  {
    id: 'f2', flip: true, img: '/act-img/act-match.jpg', fallback: '/act-img/bg-night.jpg',
    h: ['協業マッチング', '― 案件を生む'],
    body: <>大企業の課題とベンチャーの技術を、<strong>事前にスクリーニングしたテーマ</strong>で突き合わせる。名刺交換で終わる交流ではなく、具体的な案件テーマとして立ち上げます。</>,
  },
  {
    id: 'f3', flip: false, img: '/act-img/act-impl.jpg', fallback: '/act-img/bg-dawn.jpg', core: true,
    h: ['実装支援', '― PoCで終わらせない'],
    body: <><strong>ここがMNGAの核心です。</strong>立ち上がった案件を、論点整理（法務・セキュリティ・競合配慮）から進捗管理、成果検証まで継続的に伴走する。多くの協業がPoCで止まるのは、この「回し続ける仕組み」がないからです。MNGAはここを持ちます。その結果として、<strong>M&A・出資・提携が生まれます。</strong></>,
  },
  {
    id: 'f4', flip: true, img: '/act-img/act-knowledge.jpg', fallback: '/act-img/bg-night.jpg',
    h: ['ナレッジ基盤', '― 場の品質を担保する'],
    body: <>評価基準・撤退ルール・共創の規律を明示し、事例と知見を蓄積する。属人的な熱量ではなく、<strong>再現性のある仕組み</strong>として協業の質を守ります。</>,
  },
]

export default function Activities() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = prefersReduced()
    const q = (s) => Array.from(root.querySelectorAll(s))
    const q1 = (s) => root.querySelector(s)
    const tweens = []
    const triggers = []
    let lenis = null
    let ticker = null
    let timeoutId = null
    let cancelled = false
    let removeParallax = null

    document.body.classList.add('mnga-active')
    const pre = q1('#preloader')
    const stopSplit = observeSplitLines(root, reduce)

    function playReveals() {
      if (reduce) { gsap.set(q('.reveal'), { opacity: 1, y: 0 }); return }
      q('.reveal').forEach((el) => {
        tweens.push(gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }))
      })
    }
    function playHero() {
      if (reduce) return
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from(q('.phero__kana'), { opacity: 0, y: 16, duration: 0.7 })
        .from(q('.phero__title .line'), { yPercent: 110, duration: 1.0, stagger: 0.12 }, '-=.2')
        .from(q('.phero__lead'), { opacity: 0, y: 18, duration: 0.8 }, '-=.5')
      tweens.push(tl)
    }

    const hdr = q1('#hdr')
    if (hdr) triggers.push(ScrollTrigger.create({ start: 'top -30', onUpdate: (s) => hdr.classList.toggle('solid', s.scroll() > 30) }))

    if (reduce) {
      gsap.set(q('.reveal'), { opacity: 1, y: 0 })
      if (pre) pre.style.display = 'none'
    } else {
      loadLenis().then((Lenis) => {
        if (cancelled || !Lenis) return
        lenis = new Lenis({ duration: 1.15, smoothWheel: true })
        lenis.on('scroll', ScrollTrigger.update)
        ticker = (t) => lenis.raf(t * 1000)
        gsap.ticker.add(ticker)
        gsap.ticker.lagSmoothing(0)
      })
      playReveals()
      // 各活動画像のスクロール・パララックス（data-parallax → --plx を更新）
      const plx = q('[data-parallax]').map((el) => ({ el, sp: parseFloat(el.getAttribute('data-parallax') || '0.12') }))
      if (plx.length) {
        let pTick = false
        const pUpd = () => {
          const mid = window.innerHeight / 2
          plx.forEach((o) => {
            const r = o.el.getBoundingClientRect()
            const c = r.top + r.height / 2
            // 移動量を画像の余白（headroom）内にクランプ＝枠から画像がはみ出して隙間が出ないように
            const max = o.el.offsetHeight * 0.08
            let y = (c - mid) * -o.sp
            if (y > max) y = max
            else if (y < -max) y = -max
            o.el.style.setProperty('--plx', y.toFixed(1) + 'px')
          })
          pTick = false
        }
        const onPScroll = () => { if (!pTick) { pTick = true; requestAnimationFrame(pUpd) } }
        window.addEventListener('scroll', onPScroll, { passive: true })
        window.addEventListener('resize', pUpd, { passive: true })
        pUpd()
        removeParallax = () => {
          window.removeEventListener('scroll', onPScroll)
          window.removeEventListener('resize', pUpd)
        }
      }
      if (pre) {
        const tl = gsap.timeline()
        tl.to('#preloader .preloader__mark span', { opacity: 1, duration: 0.5, stagger: 0.08 })
          .to('#preloader .preloader__bar i', { width: '100%', duration: 0.9, ease: 'power1.inOut' }, '-=.3')
          .to('#preloader', { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '+=.1')
          .add(() => { if (pre) pre.style.display = 'none' })
          .add(playHero)
        tweens.push(tl)
      } else {
        playHero()
      }
      timeoutId = setTimeout(() => {
        const p = q1('#preloader')
        if (p && getComputedStyle(p).display !== 'none') { p.style.display = 'none'; playHero() }
      }, 4000)
    }

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      stopSplit()
      tweens.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
      triggers.forEach((t) => t.kill())
      if (ticker) gsap.ticker.remove(ticker)
      if (removeParallax) removeParallax()
      if (lenis) lenis.destroy()
      document.body.classList.remove('mnga-active')
    }
  }, [])

  return (
    <div className="mnga-activities js" ref={rootRef}>
      <Seo title="活動内容" path="/activities" description="MNGAは、大企業とベンチャーを接続し新産業の創出を実現する実装基盤。経営者育成・協業マッチング・実装支援・ナレッジ基盤の4機能が連動し、構想を案件化・検証・事業化まで前進させる。" />
      <Preloader variant="mark" caption="Activities" />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/activities" />

      <header className="nav" id="hdr">
        <Link className="nav__brand" to="/" aria-label="MNGA トップ"><img className="nav__logo" src="/mnga-horizontal-white.png" alt="MNGA" /></Link>
        <nav aria-label="メインナビゲーション">
          <ul className="nav__links">
            <li><Link to="/">TOP</Link></li>
            <li><Link to="/about">ABOUT</Link></li>
            <li><Link className="is-current" aria-current="page" to="/activities">ACTIVITIES</Link></li>
            <li><Link to="/report">REPORTS</Link></li>
            <li><a className="nav__cta en" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>問い合わせ（準備中）</a></li>
          </ul>
        </nav>
        <button className="nav__burger" aria-label="メニュー"><span /><span /><span /></button>
      </header>

      <main id="main">
        {/* ヒーロー */}
        <section className="phero">
          <div className="phero__inner">
            <p className="phero__kana">Activities — 活動内容</p>
            <h1 className="phero__title">
              <span className="lineMask"><span className="line">提言でも、交流でもない。</span></span>
              <span className="lineMask"><span className="line">事業を、生む。</span></span>
            </h1>
            <p className="phero__lead"><strong>MNGAは、大企業とベンチャーを接続し、構想を案件化・検証・事業化まで実行する実装基盤です。</strong>経営者育成・協業マッチング・実装支援・ナレッジ基盤の4機能が連動し、PoCで終わらせず、新産業の創出まで前進させます。</p>
          </div>
        </section>

        {/* 4機能 */}
        <section className="section">
          <div className="wrap">
            {FEATURES.map((f) => (
              <article className={`feature${f.flip ? ' feature--flip' : ''}`} id={f.id} key={f.id}>
                <div className="feature__media reveal">
                  <img loading="lazy" decoding="async" className="pic" data-parallax="0.08" src={f.img} alt={`${f.h[0]}の活動イメージ`} onError={(e) => { e.currentTarget.src = f.fallback }} />
                  <div className="ovl" />
                </div>
                <div className="feature__body">
                  {f.core && <span className="feature__core en">Core ─ MNGAの核心</span>}
                  <SplitLines as="h3" lines={[`${f.h[0]}<br>${f.h[1]}`]} />
                  <p>{f.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 場の設計 */}
        <section className="section wash--dawn" id="ba">
          <div className="wrap">
            <p className="sec-kana reveal en">The Setting ― 場の設計</p>
            <SplitLines className="sec-head" lines={['語るのではなく、', '<span class="accent">実装する。</span>']} />
            <div className="duo reveal">
              <div className="duo__cell">
                <h4>本会</h4>
                <div className="meta en">会員限定 ・ 月1回</div>
                <p>月例会で、上記4機能を一体で回す。NDA・チャタムハウスルール（発言者を特定しない前提）のもと、立場を超えて本音で議論できる場を担保します。</p>
              </div>
              <div className="duo__cell">
                <h4>分科会</h4>
                <div className="meta en">会員＋ゲスト</div>
                <p>特定テーマを深掘りし、新しい案件の種を探す入口。関心の高い参加者が、審査を経て本会へ加わります。</p>
              </div>
            </div>
            <p className="prose reveal" style={{ marginTop: '30px', maxWidth: '760px' }}>会員が4つの機能を一体で回し、構想を実装まで運ぶ。<strong style={{ color: 'var(--cream)' }}>それがMNGAの活動です。</strong></p>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-strip">
          <SplitLines as="h3" lines={['構想を、案件に。案件を、事業に。<span class="en">From words to results.</span>']} />
          <p className="reveal">自ら事業を起こし、動かし、意思決定できる立場の方へ。実装の場で会いましょう。</p>
          <div className="btn-row reveal">
            <a className="btn btn--solid en" role="link" aria-disabled="true" tabIndex={-1} title="参加申込フォームは準備中です" onClick={(e) => e.preventDefault()}>参加を申し込む（準備中）</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__top">
          <div className="footer__brand">
            <img className="footer__logo" src="/mnga-horizontal.png" alt="MNGA" />
            <div className="tag en">Make Nippon Great Again<br />Co-Creation &amp; Implementation Platform for an Indispensable Japan</div>
            <p className="shield">私たちの “Again” は、復古ではなく前進です。“Great” は、規模ではなく不可欠性です。本団体は政治的・宗教的な含意を一切持たず、経団連・経済同友会が築いてきた産業共創の系譜に連なる、非政治・中立のプラットフォームです。</p>
          </div>
          <nav className="footer__nav" aria-label="フッターナビ">
            <Link to="/">TOP</Link>
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
            <Link to="/#news">NEWS</Link>
            <a role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>CONTACT（準備中）</a>
          </nav>
        </div>
        <div className="footer__bar">
          <span className="en">© 2026 Make Nippon Great Again. All rights reserved.</span>
          <span className="en">Toward an Indispensable Japan.</span>
        </div>
      </footer>
    </div>
  )
}
