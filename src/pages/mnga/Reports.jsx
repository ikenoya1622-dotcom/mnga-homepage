import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis, observeSplitLines } from '../../lib/mngaMotion'
import { supabase } from '../../lib/supabase'
import { Preloader, Vignette } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/report.css'
import Seo from '../../components/Seo'

const CONTACT_URL = '#' // TODO: 実Googleフォーム URL
const PAGE_SIZE = 6
const FALLBACK_IMG = ['/images/about/c5.jpg', '/act-img/act-match.jpg', '/act-img/act-impl.jpg', '/act-img/act-ikusei.jpg', '/act-img/act-knowledge.jpg', '/act-img/bg-dawn.jpg']

const CATEGORIES = [
  { key: 'All', en: 'All', ja: 'すべて' },
  { key: 'Meetup', en: 'Meetup', ja: '会合' },
  { key: 'Project', en: 'Project', ja: '協業案件' },
  { key: 'Talk', en: 'Talk', ja: '登壇・寄稿' },
  { key: 'Press', en: 'Press', ja: 'プレス' },
]

// Mirrors the mock's static cards; used when the DB is unconfigured/empty.
const FALLBACK = [
  { id: null, category: 'Press', published_at: '2026-06-10', title: 'MNGA 設立記者発表会を開催しました', excerpt: '大企業経営層とベンチャー意思決定者、報道関係者を迎え、設立の背景と初年度の実装方針を発表しました。', thumbnail_url: '/images/about/c5.jpg' },
  { id: null, category: 'Meetup', published_at: '2026-05-28', title: '第1回 共創ラウンドテーブルを実施', excerpt: '大企業7社・ベンチャー12社が参加。協業テーマを5領域に整理し、検証案件の優先順位を合意しました。', thumbnail_url: '/act-img/act-match.jpg' },
  { id: null, category: 'Project', published_at: '2026-05-16', title: '協業案件「次世代モビリティ実装」がPoCフェーズへ', excerpt: '大企業の社会実装力とベンチャーの検証速度を接続。半年での社会実装を目標にPoCを開始しました。', thumbnail_url: '/act-img/act-impl.jpg' },
  { id: null, category: 'Talk', published_at: '2026-05-03', title: '理事長 櫻田が経営者育成プログラムに登壇', excerpt: '「停滞を招いたのも、変えられるのも経営者である」——自己変革と実装責任をテーマに講演しました。', thumbnail_url: '/act-img/act-ikusei.jpg' },
  { id: null, category: 'Project', published_at: '2026-04-24', title: 'ナレッジ基盤「実装の型」第1版を公開', excerpt: '評価基準・撤退ルール・共創の規律を体系化。会員が案件設計に再利用できる形で整備しました。', thumbnail_url: '/act-img/act-knowledge.jpg' },
  { id: null, category: 'Meetup', published_at: '2026-04-12', title: '分科会「新産業デザイン」キックオフ', excerpt: '領域横断の少人数分科会を始動。仮説の筋とフィールドの確度を、現場目線で磨き込みます。', thumbnail_url: '/act-img/bg-dawn.jpg' },
]

function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d)) return s
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

function deriveExcerpt(a) {
  if (a.excerpt) return a.excerpt
  if (Array.isArray(a.content)) {
    const t = a.content.find((b) => b && b.type === 'text' && b.content)
    if (t) return String(t.content).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().slice(0, 88)
  }
  return ''
}

export default function Reports() {
  const rootRef = useRef(null)
  const revealTriggers = useRef([])
  const [articles, setArticles] = useState(FALLBACK)
  const [activeCat, setActiveCat] = useState('All')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) return
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
      if (!cancelled && !error && data && data.length) setArticles(data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (activeCat === 'All') return articles
    return articles.filter((a) => (a.category || '').toLowerCase() === activeCat.toLowerCase())
  }, [articles, activeCat])

  const shown = filtered.slice(0, visible)

  // Page chrome (preloader / lenis / header / hero). Runs once.
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

    document.body.classList.add('mnga-active')
    const pre = q1('#preloader')
    const stopSplit = observeSplitLines(root, reduce)

    // ヒーローは paused で即生成 → gsap.from の immediateRender で初期(非表示)状態を
    // 同期適用し、プリローダ下で隠す。退場後に playHero() で再生（見出しの一瞬の表示を防ぐ）。
    let heroTl = null
    function buildHero() {
      if (reduce || heroTl) return
      heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true })
      heroTl.from(q('.phero__kana'), { opacity: 0, y: 16, duration: 0.7 })
        .from(q('.phero__title .line'), { yPercent: 110, duration: 1.0, stagger: 0.12 }, '-=.2')
        .from(q('.phero__lead'), { opacity: 0, y: 18, duration: 0.8 }, '-=.5')
      tweens.push(heroTl)
    }
    function playHero() { buildHero(); if (heroTl) heroTl.play() }
    buildHero()

    const ahdr = q1('#ahdr')
    if (ahdr) triggers.push(ScrollTrigger.create({ start: 'top -30', onUpdate: (s) => ahdr.classList.toggle('solid', s.scroll() > 30) }))

    if (reduce) {
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
      if (pre) {
        const tl = gsap.timeline()
        tl.to('#preloader .preloader__bar', { opacity: 1, duration: 0.3 })
          .to('#preloader .preloader__logo', { opacity: 1, duration: 0.6 }, '-=.1')
          .to('#preloader .preloader__txt', { opacity: 1, duration: 0.5 }, '-=.35')
          .to('#preloader .preloader__bar i', { width: '100%', duration: 0.9, ease: 'power1.inOut' }, '-=.5')
          .to('#preloader', { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '+=.15')
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
      if (lenis) lenis.destroy()
      document.body.classList.remove('mnga-active')
    }
  }, [])

  // Reveal cards as they enter view; re-runs whenever the visible set changes.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = prefersReduced()
    revealTriggers.current.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
    revealTriggers.current = []
    const cards = Array.from(root.querySelectorAll('.rcard.reveal'))
    if (reduce) { gsap.set(cards, { opacity: 1, y: 0 }); return }
    cards.forEach((el) => {
      revealTriggers.current.push(
        gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
      )
    })
    ScrollTrigger.refresh()
    return () => {
      revealTriggers.current.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
      revealTriggers.current = []
    }
  }, [shown.length, activeCat])

  function selectCat(key) {
    setActiveCat(key)
    setVisible(PAGE_SIZE)
  }

  return (
    <div className="mnga-report js" ref={rootRef}>
      <Seo title="活動レポート" path="/report" description="共創ラウンドテーブル、協業案件の進捗、登壇・寄稿、プレス発表まで。MNGAが「接続」を実装に変えていく一次情報を記録する活動レポート一覧。" />
      <Vignette />
      <Preloader variant="logo" caption="Make Nippon Great Again" />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/report" />

      <header className="site-header" id="ahdr">
        <nav className="site-nav" aria-label="メインナビゲーション">
          <Link className="site-logo" to="/" aria-label="MNGA"><img src="/mnga-horizontal-white.png" alt="MNGA ロゴ" /></Link>
          <div className="site-nav__links">
            <Link to="/">TOP</Link>
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report" aria-current="page">REPORTS</Link>
            <a className="site-nav__cta en" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>問い合わせ（準備中）</a>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className="phero">
          <div className="phero__bg" aria-hidden="true" />
          <div className="phero__inner">
            <p className="phero__kana">Reports — 活動レポート</p>
            <h1 className="phero__title">
              <span className="lineMask"><span className="line">提言ではなく、</span></span>
              <span className="lineMask"><span className="line">現場の記録を。</span></span>
            </h1>
            <p className="phero__lead">共創ラウンドテーブル、協業案件の進捗、登壇・寄稿、プレス発表まで。MNGAが「接続」を実装に変えていく一次情報を、現場の温度のまま記録します。</p>
          </div>
        </section>

        <div className="repwrap">
          <div className="repfilter" role="group" aria-label="カテゴリで絞り込み">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className="chip"
                aria-pressed={activeCat === c.key}
                onClick={() => selectCat(c.key)}
              >
                <span className="en">{c.en}</span> <span className="ja">{c.ja}</span>
              </button>
            ))}
          </div>

          <div className="repgrid">
            {shown.map((a, i) => {
              const img = a.thumbnail_url || FALLBACK_IMG[i % FALLBACK_IMG.length]
              const inner = (
                <>
                  <div className="rcard__media">
                    <img loading="lazy" decoding="async" src={img} alt="" />
                  </div>
                  <span className="rcard__cat">{a.category || 'Report'}</span>
                  <h2 className="rcard__t">{a.title}</h2>
                  <p className="rcard__ex">{deriveExcerpt(a)}</p>
                  <span className="rcard__date en">{fmtDate(a.published_at)}</span>
                </>
              )
              return a.id ? (
                <Link className="rcard reveal" to={`/report/${a.id}`} key={a.id}>{inner}</Link>
              ) : (
                <a className="rcard reveal" href={CONTACT_URL} key={`fb-${i}`}>{inner}</a>
              )
            })}
          </div>

          {visible < filtered.length && (
            <div className="repmore">
              <button type="button" className="en" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Load more</button>
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="awrap">
          <div className="foot-grid">
            <div>
              <Link className="foot-logo-link" to="/"><img className="foot-logo" src="/mnga-horizontal.png" alt="MNGA" /></Link>
              <p className="foot-org">一般社団法人 Make Nippon Great Again<br />〒xxx-xxxx xxx<br />平日 10:00–18:00（JST）</p>
            </div>
            <div className="foot-nav">
              <Link to="/">TOP</Link>
              <Link to="/about">ABOUT</Link>
              <Link to="/activities">ACTIVITIES</Link>
              <Link to="/report">REPORTS</Link>
              <a role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>CONTACT（準備中）</a>
            </div>
          </div>
          <p className="foot-neutral">私たちの “Again” は、復古ではなく前進です。“Great” は、規模ではなく不可欠性です。本団体は政治的・宗教的な含意を一切持たず、経団連・経済同友会が築いてきた産業共創の系譜に連なる、非政治・中立のプラットフォームです。</p>
          <p className="foot-copy en">© 2026 Make Nippon Great Again. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
