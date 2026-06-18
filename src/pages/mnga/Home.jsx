import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis, observeSplitLines } from '../../lib/mngaMotion'
import { supabase } from '../../lib/supabase'
import { SplitLines, Preloader } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/top.css'
import Seo from '../../components/Seo'
import { ORGANIZATION_JSONLD } from '../../lib/site'

const CONTACT_URL = '#' // TODO: 実Googleフォーム URL

function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d)) return s
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

// Mirrors the mock's static NEWS rows; used when the DB is unconfigured/empty.
const FALLBACK_NEWS = [
  { id: null, published_at: '2026-06-10', category: 'プレス', title: 'MNGA 設立記者発表会を開催しました' },
  { id: null, published_at: '2026-05-28', category: 'お知らせ', title: '第1回 共創ラウンドテーブルの参加申込を開始しました' },
  { id: null, published_at: '2026-05-03', category: 'お知らせ', title: '理事体制について（第一次発表）' },
]

export default function Home() {
  const rootRef = useRef(null)
  const [news, setNews] = useState(FALLBACK_NEWS)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) return
      const { data, error } = await supabase
        .from('news_items')
        .select('id, category, published_at, title')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(3)
      if (!cancelled && !error && data && data.length) setNews(data)
    }
    load()
    return () => { cancelled = true }
  }, [])

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

    // ヒーローは paused で即生成 → gsap.from の immediateRender で初期(非表示)状態が
    // 同期適用され、プリローダ下で隠れる。退場後に playHero() で再生する。
    // （以前は退場後に from を初めて適用→見出しが一瞬最終状態で見えてからスナップしていた）
    let heroTl = null
    function buildHero() {
      if (reduce || heroTl) return
      heroTl = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true })
      heroTl.from(q('.hero__kicker'), { opacity: 0, y: 16, duration: 0.7 })
        .from(q('.hero__jp .line'), { yPercent: 70, opacity: 0, duration: 1.0, stagger: 0.12 }, '-=.2')
        .from(q('.hero__en'), { opacity: 0, y: 18, duration: 0.8 }, '-=.5')
        .from(q('.hero__meta'), { opacity: 0, y: 14, duration: 0.7 }, '-=.45')
        .from(q('.hero__rail'), { opacity: 0, duration: 1.1 }, '-=.7')
      tweens.push(heroTl)
    }
    function playHero() { buildHero(); if (heroTl) heroTl.play() }
    buildHero()

    const stopSplit = observeSplitLines(root, reduce)

    if (reduce) {
      gsap.set(q('.reveal'), { opacity: 1, y: 0 })
      gsap.set(q('.shead__rule'), { scaleX: 1 })
      if (pre) pre.style.display = 'none'
      playHero()
    } else {
      const hdr = q1('#hdr')
      if (hdr) {
        triggers.push(
          ScrollTrigger.create({
            start: 'top -40',
            onUpdate: (s) => hdr.classList.toggle('solid', s.scroll() > 40),
          }),
        )
      }
      q('section.band').forEach((band) => {
        const items = band.querySelectorAll('.reveal')
        tweens.push(
          gsap.to(items, {
            opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: band, start: 'top 70%', once: true },
          }),
        )
        const rule = band.querySelector('.shead__rule')
        if (rule) {
          tweens.push(
            gsap.fromTo(rule, { scaleX: 0 }, {
              scaleX: 1, duration: 1.1, ease: 'power3.inOut',
              scrollTrigger: { trigger: band, start: 'top 70%', once: true },
            }),
          )
        }
      })
      q('.cta-strip .reveal').forEach((el) => {
        tweens.push(
          gsap.to(el, {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }),
        )
      })
      const bridge = q1('.nexus .bridge i')
      if (bridge) {
        tweens.push(
          gsap.to(bridge, {
            width: '100%', ease: 'power2.inOut', duration: 1.2,
            scrollTrigger: { trigger: q1('.nexus'), start: 'top 72%', once: true },
          }),
        )
      }

      loadLenis().then((Lenis) => {
        if (cancelled) return
        if (Lenis) {
          lenis = new Lenis({ duration: 1.15, smoothWheel: true })
          lenis.on('scroll', ScrollTrigger.update)
          ticker = (t) => lenis.raf(t * 1000)
          gsap.ticker.add(ticker)
          gsap.ticker.lagSmoothing(0)
        }
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

  return (
    <div className="mnga-top js" ref={rootRef}>
      <Seo path="/" jsonLd={ORGANIZATION_JSONLD} />
      <Preloader variant="logo" caption="Make Nippon Great Again" />
      <a className="skip-link" href="#main">本文へスキップ</a>
      <MobileNav current="/" />

      <header id="hdr">
        <nav className="nav" aria-label="メインナビゲーション">
          <a className="logo" href="#top" aria-label="MNGA">
            <img className="logo__img" src="/mnga-horizontal-white.png" alt="MNGA ロゴ" />
          </a>
          <div className="nav__links">
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
            <Link to="/news">NEWS</Link>
            <a className="nav__cta en" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>問い合わせ（準備中）</a>
          </div>
          <button className="burger" aria-label="メニュー"><span /><span /><span /></button>
        </nav>
      </header>

      <main id="main">
      {/* 00 Hero */}
      <section className="hero" id="top">
        <div className="hero__bg" aria-hidden="true" />
        <span className="hero__rail en" aria-hidden="true">Toward an Indispensable Japan</span>
        <div className="hero__inner">
          <p className="hero__kicker">Make Nippon Great Again</p>
          <h1 className="hero__jp">
            <span className="lineMask"><span className="line">いなくては<wbr />ならない<span className="accent">日本へ</span>。</span></span>
          </h1>
          <p className="hero__en en">Co-Creation &amp; Implementation Platform<br />for an Indispensable Japan</p>
          <div className="hero__meta en" aria-hidden="true">
            <span>Tokyo, Japan</span>
            <span>Non-partisan / Neutral</span>
            <span>General Incorporated Association</span>
          </div>
        </div>
        <span className="hero__scroll en">SCROLL</span>
      </section>

      {/* 01 What We Are */}
      <section className="band band--a" id="purpose">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">01</span><span className="shead__kick en">What We Are<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['私たちは、いなくてはならない', '日本をつくる団体です。']} />
          <p className="lede reveal">世界に不可欠な新産業を生み出し、停滞した日本を再び前へ進める——それが私たちの目的です。そのために、大企業とベンチャーの協業を「検討」で終わらせず、事業化・実装まで運ぶ。<strong>MNGAは、その手段としての実装基盤</strong>です。</p>
          <p className="lede reveal">多くの経済団体は、交流や情報交換に留まり、協業・提携を通じた新産業の創出には至っていません。MNGAは、そうした団体やコミュニティとは異なります。</p>
          <p className="lede reveal"><strong>協業・提携から新産業創出まで</strong>を実現する、経営者と起業家が共創するプラットフォーム——それがMNGAです。</p>
        </div>
      </section>

      {/* 02 Message */}
      <section className="band band--b" id="message">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">02</span><span className="shead__kick en">Message<span className="shead__rule" aria-hidden="true" /></span></div>
          <div className="speaker reveal">
            <div>
              <p className="speaker__quote">「停滞を招いたのは、政府でも、国民でもない。経営者である」</p>
              <p className="lede speaker__body">そして、自らもその一人だと、私たちは考えます。MNGAは、この問題意識から設立されました。停滞を招いたのが経営者の責任なら、<strong>それを変えられるのも、また経営者</strong>です。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 Board */}
      <section className="band band--b" id="board">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">03</span><span className="shead__kick en">Board Members<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['立ち上げ期を支える、', '各界を代表する理事体制。']} />
          <p className="board-note reveal" style={{ marginTop: '24px', color: 'var(--olive)', letterSpacing: '.04em' }}>理事体制は順次発表します。</p>
        </div>
      </section>

      {/* 04 Disconnect */}
      <section className="band band--b" id="disconnect">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">04</span><span className="shead__kick en">The Disconnect<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['足りなかったのは構想ではなく、', '「<span class="accent">つなぐ仕組み</span>」だった。']} />
          <p className="lede reveal">日本が持つ技術・人材・精神性を掛け合わせれば、世界に不可欠な新産業を生み出せる。足りないのは構想ではなく、それを事業化・実装へ<strong>「接続」する回路</strong>でした。大企業の資本・顧客基盤・社会実装力と、ベンチャーの意思決定・実行力——補い合えるはずの両者は、出会わないまま離れていたのです。</p>
          <div className="nexus reveal">
            <div className="p"><div className="k">大企業</div><div className="s en">資本・顧客基盤・社会実装力</div></div>
            <div className="bridge"><i /></div>
            <div className="p" style={{ textAlign: 'right' }}><div className="k">ベンチャー</div><div className="s en">意思決定・実行力</div></div>
          </div>
        </div>
      </section>

      {/* 05 Functions */}
      <section className="band band--a" id="functions">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">05</span><span className="shead__kick en">Four Functions<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['構想を案件に、案件を事業に。']} />
          <div className="fnrow reveal">
            <Link className="fn fn--core" to="/activities">
              <div className="fn__glyph" aria-hidden="true">実</div>
              <div>
                <div className="fn__flag en">MNGAの核心</div>
                <div className="fn__t">実装支援 ― PoCで終わらせない</div>
                <div className="fn__d">立ち上がった案件を、論点整理から進捗管理・成果検証まで継続的に伴走する。多くの協業がPoCで止まるのは、この「回し続ける仕組み」がないから。MNGAはここを持ち、その結果としてM&amp;A・出資・提携が生まれます。</div>
              </div>
            </Link>
            <Link className="fn" to="/activities"><div className="fn__char">育</div><div><div className="fn__t">経営者育成</div><div className="fn__d">第一線の経営者による講話と対話で、覚悟と視座を磨く。</div></div></Link>
            <Link className="fn" to="/activities"><div className="fn__char">繋</div><div><div className="fn__t">協業マッチング</div><div className="fn__d">スクリーニング済みのテーマで、具体的な案件を立ち上げる。</div></div></Link>
            <Link className="fn" to="/activities"><div className="fn__char">知</div><div><div className="fn__t">ナレッジ基盤</div><div className="fn__d">評価基準・撤退ルール・規律で、場の品質を担保する。</div></div></Link>
          </div>
          <div className="btn-row reveal" style={{ marginTop: '28px' }}><Link className="btn" to="/activities">活動内容をすべて見る</Link></div>
        </div>
      </section>

      {/* 06 Offer */}
      <section className="band band--a" id="offer">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">06</span><span className="shead__kick en">What We Offer<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['規模ではなく、質で選ぶ。']} />
          <div className="bento reveal">
            <div className="bento__cell bento__cell--lead c3 r2">
              <div className="bento__k">対等な関係</div>
              <div className="bento__v">どちらかが上に立つのではなく、対等に学び合う。組織規模や知名度に依存せず、大企業とベンチャーが本気で向き合える環境をつくる。これが、すべての価値の土台になります。</div>
            </div>
            <div className="bento__cell c3"><div className="bento__k">会員の質</div><div className="bento__v">会員数ではなく、厳選された経営者の質と、関係性の深さを重視します。</div></div>
            <div className="bento__cell c3"><div className="bento__k">本質的な協業</div><div className="bento__v">名刺交換ではなく、具体的な協業プロジェクトの創出。</div></div>
            <div className="bento__cell c2"><div className="bento__k">経営スキル</div><div className="bento__v">経営者同士の相談と知見共有を通じた、経営スキルの向上。</div></div>
            <div className="bento__cell c4"><div className="bento__k">将来志向</div><div className="bento__v">過去の再現ではなく、世界に貢献する日本の実現。“いなくてはならない国”へ。</div></div>
          </div>
        </div>
      </section>

      {/* 07 News */}
      <section className="band band--a" id="news">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">07</span><span className="shead__kick en">News<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['最新のお知らせ']} />
          <div className="nlist reveal">
            {news.map((n, i) => {
              const inner = (
                <>
                  <span className="nrow-date en">{fmtDate(n.published_at)}</span>
                  <span className="nrow-cat">{n.category || 'お知らせ'}</span>
                  <span className="nrow-t">{n.title}</span>
                </>
              )
              return n.id ? (
                <Link className="nrow" to={`/news/${n.id}`} key={n.id}>{inner}</Link>
              ) : (
                <a className="nrow" href={CONTACT_URL} key={i}>{inner}</a>
              )
            })}
          </div>
          <div className="btn-row reveal" style={{ marginTop: '28px' }}><Link className="btn" to="/news">すべてのお知らせ</Link></div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="cta-strip" id="contact-cta">
        <SplitLines as="h3" lines={['前進を、取り戻す。<span class="en">Toward an Indispensable Japan.</span>']} />
        <p className="reveal">世界にとって不可欠な新産業を生み出すことで、停滞した日本を、再び前へ進める。志を共にする経営者と、ここで会いたい。</p>
        <div className="btn-row reveal"><a className="btn btn--solid en" role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>お問い合わせ（準備中）</a></div>
        <p className="cta-links reveal"><Link to="/about">なぜ、つくったのか</Link><Link to="/activities">活動内容を見る</Link></p>
      </section>

      </main>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="foot">
            <div className="foot__org">
              <a className="logo" href="#top"><img className="foot__logo" src="/mnga-horizontal.png" alt="MNGA" /></a>
              <p>一般社団法人 Make Nippon Great Again<br />〒xxx-xxxx xxx<br />平日 10:00–18:00（JST）</p>
            </div>
            <div className="foot__nav">
              <Link to="/about">ABOUT</Link>
              <Link to="/activities">ACTIVITIES</Link>
              <Link to="/report">REPORTS</Link>
              <Link to="/news">NEWS</Link>
              <Link to="/privacy">プライバシーポリシー</Link>
              <Link to="/organization">法人概要</Link>
              <a role="link" aria-disabled="true" tabIndex={-1} title="お問い合わせフォームは準備中です" onClick={(e) => e.preventDefault()}>CONTACT（準備中）</a>
            </div>
          </div>
          <p className="foot__neutral">私たちの “Again” は、復古ではなく前進です。“Great” は、規模ではなく不可欠性です。本団体は政治的・宗教的な含意を一切持たず、経団連・経済同友会が築いてきた産業共創の系譜に連なる、非政治・中立のプラットフォームです。</p>
          <p className="foot__copy en">© 2026 Make Nippon Great Again. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
