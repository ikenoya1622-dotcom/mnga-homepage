import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReduced, loadLenis, observeSplitLines } from '../../lib/mngaMotion'
import { supabase } from '../../lib/supabase'
import { SplitLines, Preloader } from '../../components/mnga/parts'
import MobileNav from '../../components/mnga/MobileNav'
import '../../styles/mnga/top.css'

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
  { id: null, published_at: '2026-06-10', category: 'Press', title: 'MNGA 設立記者発表会を開催しました' },
  { id: null, published_at: '2026-05-28', category: 'News', title: '第1回 共創ラウンドテーブルの参加申込を開始しました' },
  { id: null, published_at: '2026-05-03', category: 'News', title: '理事体制について（第一次発表）' },
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

    function playHero() {
      if (reduce) return
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from(q('.hero__kicker'), { opacity: 0, y: 16, duration: 0.7 })
        .from(q('.hero__jp .line'), { yPercent: 70, opacity: 0, duration: 1.0, stagger: 0.12 }, '-=.2')
        .from(q('.hero__en'), { opacity: 0, y: 18, duration: 0.8 }, '-=.5')
        .from(q('.hero__meta'), { opacity: 0, y: 14, duration: 0.7 }, '-=.45')
        .from(q('.hero__rail'), { opacity: 0, duration: 1.1 }, '-=.7')
      tweens.push(tl)
    }

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
      <Preloader variant="logo" caption="Make Nippon Great Again" />
      <MobileNav current="/" />

      <header id="hdr">
        <nav className="nav">
          <a className="logo" href="#top" aria-label="MNGA">
            <img className="logo__img" src="/mnga-horizontal-white.png" alt="MNGA ロゴ" />
          </a>
          <div className="nav__links">
            <a href="#top">TOP</a>
            <Link to="/about">ABOUT</Link>
            <Link to="/activities">ACTIVITIES</Link>
            <Link to="/report">REPORTS</Link>
            <a className="nav__cta en" href={CONTACT_URL} target="_blank" rel="noopener">問い合わせ</a>
          </div>
          <button className="burger" aria-label="メニュー"><span /><span /><span /></button>
        </nav>
      </header>

      {/* 00 Hero */}
      <section className="hero" id="top">
        <div className="hero__bg" aria-hidden="true" />
        <span className="hero__rail en" aria-hidden="true">Toward an Indispensable Japan</span>
        <div className="hero__inner">
          <p className="hero__kicker">Make Nippon Great Again</p>
          <h1 className="hero__jp">
            <span className="lineMask"><span className="line">日本を、<span className="accent">再び前へ</span>。</span></span>
            <span className="lineMask"><span className="line">世界にとって<wbr />“いなくてはならない国”へ。</span></span>
          </h1>
          <p className="hero__en en">A co-creation &amp; implementation platform<br />for an Indispensable Japan.</p>
          <div className="hero__meta en" aria-hidden="true">
            <span>Tokyo, Japan</span>
            <span>Non-partisan &middot; Neutral</span>
            <span>General Incorporated Assoc.</span>
          </div>
        </div>
        <span className="hero__scroll en">SCROLL</span>
      </section>

      {/* 01 Purpose */}
      <section className="band band--a" id="purpose">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">01</span><span className="shead__kick en">Our Purpose<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['この30年を、', '「<span class="accent">失われた</span>」とは呼ばない。']} />
          <p className="lede reveal">奪われたのではありません。<strong>経営者であるわれわれ自身が、失った30年</strong>です。共通の将来像を描けず、計画を執行まで運べず、既存事業を守るために自己変革から逃げてきた。その結果、新しい産業が生まれず、停滞を招きました。</p>
          <p className="lede reveal">停滞を招いたのが経営者の責任なら、それを変えられるのも、また経営者です。MNGAは、大企業とベンチャーを<strong>接続</strong>し、新産業を案件化・検証・事業化まで前進させる実装基盤です。</p>
        </div>
      </section>

      {/* 02 Message */}
      <section className="band band--b" id="message">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">02</span><span className="shead__kick en">Message<span className="shead__rule" aria-hidden="true" /></span></div>
          <div className="speaker reveal">
            <div>
              <p className="speaker__quote">「停滞を招いたのは、政府でも、国民でもない。経営者である」</p>
              <div className="speaker__meta">
                <div className="speaker__name">櫻田 謙悟</div>
                <div className="speaker__role en">経済同友会 代表幹事 ／ MNGA 会長</div>
              </div>
              <p className="lede speaker__body">そして、自らもその一人だと語ってきました。誰かを断罪するのではなく、自分たちの責任として引き受ける。この問いが、すべての起点になりました。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 Board */}
      <section className="band band--b" id="board">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">03</span><span className="shead__kick en">Board Members<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['立ち上げ期を支える、', '各界を代表する理事体制。']} />
          <div className="board">
            <article className="dcard dcard--chair reveal">
              <div className="dcard__photo"><span className="dcard__idx en">01</span></div>
              <div className="dcard__body"><div className="dcard__name">櫻田 謙悟</div><div className="dcard__role en">会長 ／ 経済同友会 代表幹事</div></div>
            </article>
            {[
              ['弐'], ['参'], ['肆'], ['伍'], ['陸'], ['漆'],
            ].map(([mono], i) => (
              <article className="dcard reveal" key={i}>
                <div className="dcard__photo"><span className="dcard__mono">{mono}</span><span className="dcard__tba en">To be announced</span></div>
                <div className="dcard__body"><div className="dcard__name">就任予定</div><div className="dcard__role en">Director</div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 04 Disconnect */}
      <section className="band band--b" id="disconnect">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">04</span><span className="shead__kick en">The Disconnect<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['足りないのは構想ではなく、', '「<span class="accent">回路</span>」だった。']} />
          <p className="lede reveal">大企業の意思決定力・資産・顧客基盤と、ベンチャーの検証速度・技術探索力。その両者は、出会わないまま離れていました。両者を案件化・検証・事業化まで<strong>継続的に接続する</strong>——それが私たちの役割です。</p>
          <div className="nexus reveal">
            <div className="p"><div className="k">大企業</div><div className="s en">意思決定力・資産・顧客基盤</div></div>
            <div className="bridge"><i /></div>
            <div className="p" style={{ textAlign: 'right' }}><div className="k">ベンチャー</div><div className="s en">検証速度・技術探索力</div></div>
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
                <div className="fn__flag en">MNGA の核心</div>
                <div className="fn__t">実装支援 ― PoCで終わらせない</div>
                <div className="fn__d">立ち上がった案件を、論点整理から進捗管理・成果検証まで継続的に伴走する。多くの協業がPoCで止まるのは、この「回し続ける仕組み」がないから。MNGAはここを持ち、その結果としてM&amp;A・出資・提携が生まれます。</div>
              </div>
            </Link>
            <Link className="fn" to="/activities"><div className="fn__char">育</div><div><div className="fn__t">経営者育成</div><div className="fn__d">第一線の経営者による講話と対話で、覚悟と視座を磨く。</div></div></Link>
            <Link className="fn" to="/activities"><div className="fn__char">繋</div><div><div className="fn__t">協業マッチング</div><div className="fn__d">スクリーニング済みのテーマで、具体的な案件を立ち上げる。</div></div></Link>
            <Link className="fn" to="/activities"><div className="fn__char">知</div><div><div className="fn__t">ナレッジ基盤</div><div className="fn__d">評価基準・撤退ルール・規律で、場の質を担保する。</div></div></Link>
          </div>
          <div className="btn-row reveal" style={{ marginTop: '28px' }}><Link className="btn" to="/activities">活動内容をすべて見る</Link></div>
        </div>
      </section>

      {/* 06 Offer */}
      <section className="band band--a" id="offer">
        <div className="wrap">
          <div className="shead reveal"><span className="shead__no en">06</span><span className="shead__kick en">What We Offer<span className="shead__rule" aria-hidden="true" /></span></div>
          <SplitLines className="stitle" lines={['私たちが提供する価値。']} />
          <div className="bento reveal">
            <div className="bento__cell bento__cell--lead c3 r2">
              <div className="bento__k">対等な関係</div>
              <div className="bento__v">どちらかが上に立つのではなく、対等に学び合う。組織規模や知名度に依存せず、大企業とベンチャーが本気で向き合える環境をつくる。これが、すべての価値の土台になります。</div>
            </div>
            <div className="bento__cell c3"><div className="bento__k">会員の質</div><div className="bento__v">会員数ではなく、厳選された経営者の質と、関係性の深さを重視します。</div></div>
            <div className="bento__cell c3"><div className="bento__k">本質的な協業</div><div className="bento__v">名刺交換ではなく、具体的な協業プロジェクトの創出。</div></div>
            <div className="bento__cell c2"><div className="bento__k">経営スキル</div><div className="bento__v">経営者同士の相談と知見共有による、スキルの向上。</div></div>
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
                  <span className="nrow-cat en">{n.category || 'News'}</span>
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
        </div>
      </section>

      {/* Closing CTA */}
      <section className="cta-strip" id="contact-cta">
        <SplitLines as="h3" lines={['接続を、取り戻す。<span class="en">Toward an Indispensable Japan.</span>']} />
        <p className="reveal">世界にとって不可欠な新産業を生み出すことで、停滞した日本を、再び前へ進める。志を共にする経営者と、ここで会いたい。</p>
        <div className="btn-row reveal"><a className="btn btn--solid en" href={CONTACT_URL} target="_blank" rel="noopener">お問い合わせ</a></div>
        <p className="cta-links reveal"><Link to="/about">なぜ、つくったのか</Link><Link to="/activities">活動内容を見る</Link></p>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="foot">
            <div className="foot__org">
              <a className="logo" href="#top"><img className="foot__logo" src="/mnga-horizontal.png" alt="MNGA" /></a>
              <p>一般社団法人 Make Nippon Great Again<br />〒107-0052 東京都港区赤坂1丁目8-1<br />平日 10:00–18:00（JST）</p>
            </div>
            <div className="foot__nav">
              <a href="#top">TOP</a>
              <Link to="/about">ABOUT</Link>
              <Link to="/activities">ACTIVITIES</Link>
              <Link to="/report">REPORTS</Link>
              <a href="#news">NEWS</a>
              <a href={CONTACT_URL} target="_blank" rel="noopener">CONTACT（Googleフォーム）</a>
            </div>
          </div>
          <p className="foot__neutral">私たちの “Again” は、復古ではなく前進です。“Great” は、規模ではなく不可欠性です。本団体は政治的・宗教的な含意を一切持たず、非政治・中立の一般社団法人として活動します。</p>
          <p className="foot__copy en">© Make Nippon Great Again. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
