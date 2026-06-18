import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis, observeSplitLines } from '../../lib/mngaMotion'
import { supabase } from '../../lib/supabase'
import { Preloader, Vignette } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/news.css'
import Seo from '../../components/Seo'

const PAGE_SIZE = 12

const CATEGORIES = [
  { key: 'All', en: 'All', ja: 'すべて' },
  { key: 'お知らせ', en: 'Notice', ja: 'お知らせ' },
  { key: 'プレス', en: 'Press', ja: 'プレス' },
  { key: 'イベント', en: 'Event', ja: 'イベント' },
  { key: '情報公開', en: 'Disclosure', ja: '情報公開' },
]

// Mirrors the site's static rows; used when the DB is unconfigured/empty.
const FALLBACK = [
  { id: null, category: 'プレス', published_at: '2026-06-10', title: 'MNGA 設立記者発表会を開催しました' },
  { id: null, category: 'お知らせ', title: '第1回 共創ラウンドテーブルの参加申込を開始しました', published_at: '2026-05-28' },
  { id: null, category: '情報公開', published_at: '2026-04-23', title: '2026年度 理事体制を発表しました' },
]

function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d)) return s
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

export default function News() {
  const rootRef = useRef(null)
  const revealTriggers = useRef([])
  const [items, setItems] = useState(FALLBACK)
  const [activeCat, setActiveCat] = useState('All')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) return
      const { data, error } = await supabase
        .from('news_items')
        .select('id, category, published_at, title, sort_order')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .order('sort_order', { ascending: true })
      if (!cancelled && !error && data && data.length) setItems(data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (activeCat === 'All') return items
    return items.filter((a) => (a.category || '') === activeCat)
  }, [items, activeCat])

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
    // 同期適用し、プリローダ下で隠す。退場後に playHero() で再生。
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

  // Reveal rows as they enter view; re-runs whenever the visible set changes.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = prefersReduced()
    revealTriggers.current.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
    revealTriggers.current = []
    const rows = Array.from(root.querySelectorAll('.nrow.reveal'))
    if (reduce) { gsap.set(rows, { opacity: 1, y: 0 }); return }
    rows.forEach((el) => {
      revealTriggers.current.push(
        gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }),
      )
    })
    ScrollTrigger.refresh()
    return () => {
      revealTriggers.current.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
      revealTriggers.current = []
    }
  }, [items, activeCat, visible])

  function selectCat(key) {
    setActiveCat(key)
    setVisible(PAGE_SIZE)
  }

  return (
    <div className="mnga-news js" ref={rootRef}>
      <Seo title="お知らせ" path="/news" description="MNGA（Make Nippon Great Again）のお知らせ一覧。設立・理事体制・定款などの公式開示から、共創ラウンドテーブルや登壇・プレスまで、一次情報を時系列で記録します。" />
      <Vignette />
      <Preloader variant="logo" caption="Make Nippon Great Again" />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/news" />

      <header className="site-header" id="ahdr">
        <nav className="site-nav" aria-label="メインナビゲーション">
          <Link className="site-logo" to="/" aria-label="MNGA"><img src="/mnga-horizontal-white.png" alt="MNGA ロゴ" /></Link>
          <div className="site-nav__links">
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
            <Link to="/news" aria-current="page">NEWS</Link>
            <a className="site-nav__cta en" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>問い合わせ（準備中）</a>
          </div>
        </nav>
      </header>

      <main id="main">
        <div className="news-head">
          <p className="phero__kana">News — お知らせ</p>
          <h1 className="phero__title">
            <span className="lineMask"><span className="line">お知らせ</span></span>
          </h1>
        </div>

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

          {shown.length === 0 ? (
            <p className="nlist-empty">該当するお知らせはまだありません。</p>
          ) : (
            <div className="nlist">
              {shown.map((n, i) => {
                const inner = (
                  <>
                    <span className="nrow-date en">{fmtDate(n.published_at)}</span>
                    <span className="nrow-cat">{n.category || 'お知らせ'}</span>
                    <span className="nrow-t">{n.title}</span>
                  </>
                )
                return n.id ? (
                  <Link className="nrow reveal" to={`/news/${n.id}`} key={n.id}>{inner}</Link>
                ) : (
                  <span className="nrow reveal" key={`fb-${i}`} aria-disabled="true">{inner}</span>
                )
              })}
            </div>
          )}

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
              <Link to="/about">ABOUT</Link>
              <Link to="/activities">ACTIVITIES</Link>
              <Link to="/report">REPORTS</Link>
              <Link to="/news">NEWS</Link>
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
