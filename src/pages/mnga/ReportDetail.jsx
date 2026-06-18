import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis, observeSplitLines } from '../../lib/mngaMotion'
import { supabase } from '../../lib/supabase'
import { isSafeImageUrl } from '../../components/BlockRenderer'
import { Preloader, Vignette, SplitLines } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import Seo from '../../components/Seo'
import { absUrl, ORG_NAME } from '../../lib/site'
import '../../styles/mnga/report-detail.css'

const CONTACT_URL = '#' // TODO: 実Googleフォーム URL

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

function Blocks({ blocks }) {
  if (!Array.isArray(blocks)) return null
  const out = []
  blocks.forEach((b, i) => {
    if (!b) return
    if (b.type === 'heading' || b.type === 'subheading') {
      out.push(<h2 className="reveal" key={`h-${i}`}>{b.content}</h2>)
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
    } else if (b.type === 'image' && isSafeImageUrl(b.url)) {
      out.push(
        <figure className="reveal" key={`f-${i}`}><img loading="lazy" decoding="async" src={b.url} alt="" /></figure>,
      )
    }
  })
  return <>{out}</>
}

// Exact mock body, shown when the DB is unconfigured (no VITE_SUPABASE_*).
function StaticBody() {
  return (
    <>
      <div className="art-body">
        <p>第1回 共創ラウンドテーブルは、大企業とベンチャーの意思決定者が<strong>「対等に向き合う」場</strong>として設計されました。冒頭、理事長が「PoCで終わらせず、社会実装まで前進させる」という運営方針を改めて共有し、各社が抱える協業の障壁を率直に持ち寄ることから始まりました。</p>
        <h2 className="reveal">5つの協業テーマ</h2>
        <p>当日の議論を通じて、検証を先行させる協業テーマを次の5領域に整理しました。</p>
        <ul className="art-list reveal">
          <li>次世代モビリティの社会実装</li>
          <li>地域インフラのデジタル化</li>
          <li>ヘルスケア領域の共同事業化</li>
          <li>サプライチェーンの脱炭素</li>
          <li>人材・組織変革の実装支援</li>
        </ul>
        <figure className="reveal">
          <img src="/act-img/act-impl.jpg" alt="分科会での議論の様子（イメージ）" />
          <figcaption>分科会では、各テーマごとに「誰が・いつまでに・何を検証するか」を具体化した（イメージ）。</figcaption>
        </figure>
        <blockquote className="art-quote reveal">「交流で終わらせない。<br />ここで、案件を立ち上げる。」
          <small>MNGA 理事長（代表理事）</small>
        </blockquote>
        <h2 className="reveal">当日の様子</h2>
        <p>後半のクロージングでは、各テーマのオーナーを決め、次回までの検証ステップを合意。MNGAが伴走しながら、案件化・検証・事業化まで継続的に「回し続ける」体制を確認しました。</p>
        <div className="art-gallery reveal">
          <img src="/act-img/act-ikusei.jpg" alt="講話セッション（イメージ）" />
          <img src="/act-img/act-knowledge.jpg" alt="ナレッジ共有（イメージ）" />
        </div>
        <p>次回は、各テーマの検証進捗を持ち寄る「実装レビュー」を予定しています。進捗は本Reportsページで継続的に公開していきます。</p>
      </div>
    </>
  )
}

export default function ReportDetail() {
  const { id } = useParams()
  const rootRef = useRef(null)
  const [item, setItem] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const isStatic = !supabase

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) { setLoading(false); return }
      const { data, error } = await supabase.from('reports').select('*').eq('id', id).single()
      if (cancelled) return
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setItem(data)
      const { data: rel } = await supabase
        .from('reports')
        .select('id, published_at, title, thumbnail_url')
        .neq('id', id)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(3)
      if (!cancelled && rel) setRelated(rel)
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
        .from(q('.art-lead'), { opacity: 0, y: 18, duration: 0.8 }, '-=.2')
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

    const cp = q1('#copyLink')
    const onCopy = () => { try { navigator.clipboard.writeText(location.href) } catch (e) { /* noop */ } }
    if (cp) cp.addEventListener('click', onCopy)

    ScrollTrigger.refresh()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      if (cp) cp.removeEventListener('click', onCopy)
      stopSplit()
      tweens.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
      triggers.forEach((t) => t.kill())
      if (ticker) gsap.ticker.remove(ticker)
      if (lenis) lenis.destroy()
      document.body.classList.remove('mnga-active')
    }
  }, [loading, item])

  const category = isStatic ? 'Meetup' : (item?.category || 'Report')
  const title = isStatic ? '第1回 共創ラウンドテーブルを実施しました' : (item?.title || '')
  const date = isStatic ? '2026-05-28' : item?.published_at
  const lead = isStatic
    ? '2026年5月28日、大企業7社・ベンチャー12社の意思決定者が一堂に会し、第1回 共創ラウンドテーブルを実施しました。協業テーマを5領域に整理し、検証案件の優先順位を合意しました。'
    : (item?.excerpt || '')
  const heroSrc = isStatic ? '/act-img/act-match.jpg' : (item?.thumbnail_url || '')

  return (
    <div className="mnga-report-detail js" ref={rootRef}>
      <Seo
        title={title || 'レポート'}
        path={isStatic ? '/report' : `/report/${id}`}
        description={lead || '共創ラウンドテーブル、協業案件の進捗、登壇・寄稿、プレス発表まで。MNGAの活動を記録します。'}
        type="article"
        image={item?.thumbnail_url || undefined}
        noindex={!isStatic && notFound}
        jsonLd={(!notFound && title) ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          datePublished: date || undefined,
          image: item?.thumbnail_url ? absUrl(item.thumbnail_url) : undefined,
          author: { '@type': 'Organization', name: ORG_NAME },
          publisher: { '@type': 'Organization', name: ORG_NAME, logo: { '@type': 'ImageObject', url: absUrl('/mnga-horizontal.png') } },
          mainEntityOfPage: absUrl(isStatic ? '/report' : `/report/${id}`),
        } : undefined}
      />
      <Vignette />
      <Preloader variant="logo" caption="Make Nippon Great Again" />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/report" />

      <header className="site-header" id="ahdr">
        <nav className="site-nav" aria-label="メインナビゲーション">
          <Link className="site-logo" to="/" aria-label="MNGA"><img src="/mnga-horizontal-white.png" alt="MNGA ロゴ" /></Link>
          <div className="site-nav__links">
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report" aria-current="page">REPORTS</Link>
            <Link to="/news">NEWS</Link>
            <a className="site-nav__cta en" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>問い合わせ（準備中）</a>
          </div>
        </nav>
      </header>

      <main id="main">
        {!isStatic && notFound ? (
          <article className="article">
            <p className="art-body" style={{ marginTop: 0 }}>レポートが見つかりませんでした。</p>
            <div className="art-back" style={{ padding: 0 }}><Link to="/report" className="en">Back to Reports</Link></div>
          </article>
        ) : (
          <>
            <article className="article">
              <nav className="crumb en" aria-label="現在地">
                <Link to="/">Home</Link><span>/</span><Link to="/report">Reports</Link><span>/</span>{title}
              </nav>

              <div className="art-meta">
                <span className="art-pill en">{category}</span>
                <span className="art-date en">{fmtDate(date)}</span>
              </div>
              {isStatic ? (
                <SplitLines as="h1" className="art-title" lines={['第1回 共創ラウンドテーブルを<br />実施しました']} />
              ) : (
                <h1 className="art-title">{title}</h1>
              )}
              {lead && <p className="art-lead">{lead}</p>}

              {heroSrc && (
                <div className="art-hero reveal"><img src={heroSrc} alt={title} /></div>
              )}

              <div className="art-utility">
                <span className="art-source">主催: MNGA 事務局 ／ 記録: 運営事務局</span>
                <div className="art-share">
                  <span className="en">Share</span>
                  <a href="#" aria-label="Xでシェア"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.5L5.4 22H2.3l7.8-8.9L1.6 2h6.9l4.5 6 5.9-6Zm-1.2 18h1.9L7.1 4H5.1l12.6 16Z" /></svg></a>
                  <a href="#" aria-label="LinkedInでシェア"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C20.4 8.75 21 11 21 14v7h-4v-6.2c0-1.48-.03-3.4-2.07-3.4-2.07 0-2.39 1.62-2.39 3.3V21H9V9Z" /></svg></a>
                  <button type="button" id="copyLink" aria-label="リンクをコピー"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 0 1 4.2 4.2l-1.3 1.3a1 1 0 1 1-1.4-1.4l1.3-1.3a1 1 0 1 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l1.3-1.3a1 1 0 1 1 1.4 1.4L7.6 13.2a1 1 0 1 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0Z" /></svg></button>
                </div>
              </div>

              {isStatic ? (
                <StaticBody />
              ) : (
                <div className="art-body"><Blocks blocks={item?.content} /></div>
              )}

              <div className="art-tags">
                <Link to="/report">#{category}</Link>
                <Link to="/report">#活動レポート</Link>
                <Link to="/report">#実装支援</Link>
              </div>
            </article>

            <div className="art-back"><Link to="/report" className="en">Back to Reports</Link></div>

            {(isStatic ? STATIC_RELATED : related).length > 0 && (
              <section className="related">
                <div className="related__head"><span className="related__no en">—</span><span className="related__kick en">Related Reports</span></div>
                <div className="related__grid">
                  {(isStatic ? STATIC_RELATED : related).map((r, i) => {
                    const img = r.thumbnail_url || STATIC_RELATED[i % STATIC_RELATED.length].thumbnail_url
                    const inner = (
                      <>
                        <div className="rcard__media">{r.category && <span className="rcard__cat">{r.category}</span>}<img loading="lazy" decoding="async" src={img} alt="" /></div>
                        <span className="rcard__date en">{fmtDate(r.published_at)}</span>
                        <h3 className="rcard__t">{r.title}</h3>
                      </>
                    )
                    return r.id ? (
                      <Link className="rcard reveal" to={`/report/${r.id}`} key={r.id}>{inner}</Link>
                    ) : (
                      <a className="rcard reveal" href={CONTACT_URL} key={`rel-${i}`}>{inner}</a>
                    )
                  })}
                </div>
              </section>
            )}
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
              <Link to="/news">NEWS</Link>
              <Link to="/privacy">プライバシーポリシー</Link>
              <Link to="/organization">法人概要</Link>
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

const STATIC_RELATED = [
  { id: null, category: 'Project', published_at: '2026-05-16', title: '協業案件「次世代モビリティ実装」がPoCフェーズへ', thumbnail_url: '/act-img/act-impl.jpg' },
  { id: null, category: 'Talk', published_at: '2026-05-03', title: '理事長が経営者育成プログラムに登壇', thumbnail_url: '/act-img/act-ikusei.jpg' },
  { id: null, category: 'Meetup', published_at: '2026-04-12', title: '分科会「新産業デザイン」キックオフ', thumbnail_url: '/act-img/bg-dawn.jpg' },
]
