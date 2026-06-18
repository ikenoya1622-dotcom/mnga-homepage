import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis, observeSplitLines } from '../../lib/mngaMotion'
import { supabase } from '../../lib/supabase'
import { Preloader, Vignette, SplitLines } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import Seo from '../../components/Seo'
import { absUrl, ORG_NAME } from '../../lib/site'
import '../../styles/mnga/news-detail.css'


function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d)) return s
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

function renderBold(text) {
  return String(text).split(/\*\*(.*?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

function NewsBlocks({ blocks }) {
  if (!Array.isArray(blocks) || !blocks.length) return null
  const out = []
  blocks.forEach((b, i) => {
    if (!b) return
    if (b.type === 'heading' || b.type === 'subheading') {
      out.push(<p key={`h-${i}`}><strong>{b.content}</strong></p>)
    } else if (b.type === 'text') {
      String(b.content || '').split(/\n\n+/).forEach((para, j) => {
        out.push(
          <p key={`p-${i}-${j}`}>
            {para.split('\n').map((ln, k, arr) => (
              <span key={k}>{renderBold(ln)}{k < arr.length - 1 && <br />}</span>
            ))}
          </p>,
        )
      })
    }
  })
  return <>{out}</>
}

export default function NewsDetail() {
  const { id } = useParams()
  const rootRef = useRef(null)
  const [item, setItem] = useState(null)
  const [prev, setPrev] = useState(null)
  const [next, setNext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const isStatic = !supabase

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) { setLoading(false); return }
      const { data, error } = await supabase.from('news_items').select('*').eq('id', id).single()
      if (cancelled) return
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setItem(data)
      // Prev (older) / Next (newer) within the published timeline.
      const { data: list } = await supabase
        .from('news_items')
        .select('id, title, published_at')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
      if (!cancelled && Array.isArray(list)) {
        const idx = list.findIndex((n) => n.id === id)
        setNext(idx > 0 ? list[idx - 1] : null)
        setPrev(idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (loading) return
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

    function playReveals() {
      if (reduce) { gsap.set(q('.reveal'), { opacity: 1, y: 0 }); return }
      q('.reveal').forEach((el) => {
        tweens.push(gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }))
      })
    }
    // 見出し帯は paused で即生成 → gsap.from の immediateRender で初期(非表示)状態を
    // 同期適用し、プリローダ下で隠す。退場後に playHead() で再生（見出しの一瞬の表示を防ぐ）。
    let headTl = null
    function buildHead() {
      if (reduce || headTl) return
      headTl = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true })
      headTl.from(q('.crumb'), { opacity: 0, y: 12, duration: 0.6 })
        .from(q('.art-meta'), { opacity: 0, y: 14, duration: 0.6 }, '-=.3')
        .from(q('.art-body'), { opacity: 0, y: 18, duration: 0.8 }, '-=.2')
        .from(q('.art-extlink'), { opacity: 0, y: 14, duration: 0.6 }, '-=.4')
      tweens.push(headTl)
    }
    function playHead() { buildHead(); if (headTl) headTl.play() }
    buildHead()

    const ahdr = q1('#ahdr')
    if (ahdr) triggers.push(ScrollTrigger.create({ start: 'top -30', onUpdate: (s) => ahdr.classList.toggle('solid', s.scroll() > 30) }))

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
      if (pre) {
        const tl = gsap.timeline()
        tl.to('#preloader .preloader__bar', { opacity: 1, duration: 0.3 })
          .to('#preloader .preloader__logo', { opacity: 1, duration: 0.6 }, '-=.1')
          .to('#preloader .preloader__txt', { opacity: 1, duration: 0.5 }, '-=.35')
          .to('#preloader .preloader__bar i', { width: '100%', duration: 0.9, ease: 'power1.inOut' }, '-=.5')
          .to('#preloader', { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '+=.15')
          .add(() => { if (pre) pre.style.display = 'none' })
          .add(playHead)
        tweens.push(tl)
      } else {
        playHead()
      }
      timeoutId = setTimeout(() => {
        const p = q1('#preloader')
        if (p && getComputedStyle(p).display !== 'none') { p.style.display = 'none'; playHead() }
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
  }, [loading, item])

  const category = isStatic ? 'プレス' : (item?.category || 'お知らせ')
  const title = isStatic ? 'MNGA 設立記者発表会を開催しました' : (item?.title || '')
  const date = isStatic ? '2026-06-10' : item?.published_at
  const hasBlocks = !isStatic && Array.isArray(item?.content) && item.content.length > 0
  // B-3: 本文ブロックもPDFも無い「空記事」（定款・事業報告などを"出している風"で中身ゼロにしない）
  const isEmpty = !isStatic && !notFound && !hasBlocks && !item?.file_url

  return (
    <div className="mnga-news-detail js" ref={rootRef}>
      <Seo
        title={title || 'お知らせ'}
        path={isStatic ? '/news' : `/news/${id}`}
        description={title ? `${title}｜一般社団法人 MNGA（Make Nippon Great Again）からのお知らせ。` : 'MNGA（Make Nippon Great Again）からのお知らせ。'}
        type="article"
        noindex={!isStatic && (notFound || isEmpty)}
        jsonLd={(!notFound && title) ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          datePublished: date || undefined,
          author: { '@type': 'Organization', name: ORG_NAME },
          publisher: { '@type': 'Organization', name: ORG_NAME, logo: { '@type': 'ImageObject', url: absUrl('/mnga-horizontal.png') } },
          mainEntityOfPage: absUrl(isStatic ? '/news' : `/news/${id}`),
        } : undefined}
      />
      <Vignette />
      <Preloader variant="logo" caption="Make Nippon Great Again" />
      <MobileNav current="/report" />

      <a className="skip-link" href="#main">本文へスキップ</a>
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

      <main id="main">
        {!isStatic && notFound ? (
          <article className="article">
            <p className="art-body" style={{ marginTop: 0 }}>お知らせが見つかりませんでした。</p>
            <div className="art-back" style={{ marginTop: 24 }}><Link to="/#news" className="en">Back to list</Link></div>
          </article>
        ) : (
          <>
            <article className="article">
              <nav className="crumb en" aria-label="現在地">
                <Link to="/">Home</Link><span>/</span><Link to="/#news">News</Link><span>/</span>{title}
              </nav>

              <div className="art-meta">
                <span className="art-date en">{fmtDate(date)}</span>
                <span className="art-pill en">{category}</span>
              </div>
              {isStatic ? (
                <SplitLines as="h1" className="art-title" lines={['MNGA 設立記者発表会を<br />開催しました']} />
              ) : (
                <h1 className="art-title">{title}</h1>
              )}

              <div className="art-body">
                {isStatic ? (
                  <>
                    <p>一般社団法人 Make Nippon Great Again は、2026年6月10日、東京都内にて設立記者発表会を開催し、設立の背景と初年度の実装方針を発表しました。</p>
                    <p>当日は理事長 櫻田謙悟が登壇し、<strong>大企業とベンチャーを「接続」し、新産業を社会実装まで前進させる</strong>という設立趣旨をお伝えしました。発表内容の詳細は、下記のプレスリリースをご覧ください。</p>
                  </>
                ) : hasBlocks ? (
                  <NewsBlocks blocks={item.content} />
                ) : item?.file_url ? (
                  <p>詳細は下記の添付資料をご覧ください。</p>
                ) : (
                  <p className="art-prep">本記事は現在準備中です。内容が整い次第、公開いたします。</p>
                )}
              </div>

              {(isStatic || item?.file_url) && (
                <p className="art-extlink">
                  <a href={isStatic ? '#' : item.file_url} target="_blank" rel="noopener"><span className="ja">{isStatic ? 'プレスリリースを読む' : '添付資料を読む'}</span></a>
                </p>
              )}
            </article>

            <nav className="art-paging" aria-label="記事送り">
              <div className="pg-grid">
                {prev || isStatic ? (
                  <Link className="pg-cell pg-cell--prev" to={prev ? `/news/${prev.id}` : '#'}>
                    <span className="pg-lbl en">Prev</span>
                    <span className="pg-ttl">{prev ? prev.title : '第1回 共創ラウンドテーブルを実施'}</span>
                  </Link>
                ) : (
                  <span className="pg-cell pg-cell--prev is-empty"><span className="pg-lbl en">Prev</span><span className="pg-ttl">―</span></span>
                )}
                <div className="pg-div" aria-hidden="true" />
                {next || isStatic ? (
                  <Link className="pg-cell pg-cell--next" to={next ? `/news/${next.id}` : '#'}>
                    <span className="pg-lbl en">Next</span>
                    <span className="pg-ttl">{next ? next.title : '理事体制について（第一次発表）'}</span>
                  </Link>
                ) : (
                  <span className="pg-cell pg-cell--next is-empty"><span className="pg-lbl en">Next</span><span className="pg-ttl">―</span></span>
                )}
              </div>
            </nav>

            <div className="art-back"><Link to="/#news" className="en">Back to list</Link></div>

            <section className="news-cta">
              <div className="news-cta__in">
                <p className="news-cta__t">MNGAの活動に参加しませんか。<span className="en">Join the platform for an indispensable Japan.</span></p>
                <a className="news-cta__btn" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>お問い合わせ（準備中）</a>
              </div>
            </section>
          </>
        )}
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
              <Link to="/#news">NEWS</Link>
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
