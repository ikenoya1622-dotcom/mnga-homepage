import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../../components/v2/Header'
import Footer from '../../components/v2/Footer'
import CtaSection from '../../components/v2/CtaSection'
import { supabase } from '../../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

const BRAND_RED = '#d63b2d'

const NEWS_CATEGORIES = ['定款', '事業報告', 'お知らせ']

const ACTIVITIES = [
  {
    no: '01',
    en: 'Forum',
    jp: 'フォーラム',
    desc:
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    no: '02',
    en: 'Chapter Meetup',
    jp: 'チャプターミートアップ',
    desc:
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    no: '03',
    en: 'Mentor Ship',
    jp: 'メンターシップ',
    desc:
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    no: '04',
    en: 'My EO',
    jp: 'My EO',
    desc:
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
  {
    no: '05',
    en: 'Strategic Alliance',
    jp: 'ストラテジックアライアンス',
    desc:
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  },
]

function formatNewsDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${y}.${m}.${d}`
}

function ActivityItem({ activity, refEl }) {
  return (
    <div
      ref={refEl}
      className="v2-activity-item"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.05fr',
        gap: '56px',
        alignItems: 'center',
        padding: '40px 0',
      }}
    >
      {/* 画像プレースホルダー */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          background: '#e5e5e5',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.2em' }}>
          画像準備中
        </span>
      </div>

      {/* テキスト */}
      <div>
        <p
          style={{
            fontSize: '11px',
            color: '#888',
            letterSpacing: '0.2em',
            margin: 0,
            marginBottom: '12px',
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {activity.no}　─　{activity.en}
        </p>
        <h3
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: 0,
            marginBottom: '20px',
            letterSpacing: '0.05em',
          }}
        >
          {activity.jp}
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: '#444',
            lineHeight: 2,
            margin: 0,
            letterSpacing: '0.03em',
            wordBreak: 'break-all',
          }}
        >
          {activity.desc}
        </p>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const headerRef = useRef(null)
  const newsRef = useRef(null)
  const activityRefs = useRef(ACTIVITIES.map(() => null))
  const [news, setNews] = useState([])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('news_items')
      .select('*')
      .order('published_at', { ascending: false })
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('news_items の取得に失敗:', error)
          return
        }
        const grouped = NEWS_CATEGORIES.map((cat) => ({
          category: cat,
          items: (data || []).filter((x) => x.category === cat),
        })).filter((g) => g.items.length > 0)
        setNews(grouped)
      })
  }, [])

  useEffect(() => {
    const targets = [headerRef.current, ...activityRefs.current, newsRef.current].filter(Boolean)
    const anims = targets.map((el) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      )
    )
    return () => {
      anims.forEach((a) => a.kill())
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <main style={{ paddingTop: '64px' }}>
        {/* ページヘッダー */}
        <section style={{ padding: '100px 0 60px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }} ref={headerRef}>
            <h1
              style={{
                fontFamily: "'Zen Old Mincho', serif",
                fontSize: '44px',
                color: BRAND_RED,
                letterSpacing: '0.1em',
                margin: 0,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              Activities
            </h1>
            <p
              style={{
                fontSize: '12px',
                color: '#1a1a1a',
                letterSpacing: '0.35em',
                marginTop: '12px',
                fontWeight: 500,
              }}
            >
              活動内容
            </p>
          </div>
        </section>

        {/* 活動一覧 */}
        <section style={{ padding: '20px 0 100px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
            {ACTIVITIES.map((a, i) => (
              <ActivityItem
                key={a.no}
                activity={a}
                refEl={(el) => (activityRefs.current[i] = el)}
              />
            ))}
          </div>
        </section>

        {/* News */}
        <section ref={newsRef} style={{ background: '#f5f5f5', padding: '100px 0' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2
                style={{
                  fontFamily: "'Zen Old Mincho', serif",
                  fontSize: '44px',
                  color: BRAND_RED,
                  letterSpacing: '0.1em',
                  margin: 0,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                News
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: '#1a1a1a',
                  letterSpacing: '0.35em',
                  marginTop: '12px',
                  fontWeight: 500,
                }}
              >
                お知らせ
              </p>
            </div>

            {news.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px', textAlign: 'center' }}>
                お知らせはまだありません
              </p>
            ) : (
              news.map((group) => (
                <div key={group.category} style={{ marginBottom: '48px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr',
                      gap: '40px',
                      alignItems: 'start',
                    }}
                    className="v2-news-row"
                  >
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: BRAND_RED, letterSpacing: '0.1em' }}>
                        {group.category}
                      </p>
                    </div>
                    <div>
                      {group.items.map((item) => {
                        const body = (
                          <>
                            <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                              {formatNewsDate(item.published_at)}
                            </p>
                            <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{item.title}</p>
                          </>
                        )

                        const hasBlocks = Array.isArray(item.content) && item.content.length > 0
                        const internalHref =
                          item.category === 'お知らせ' && hasBlocks ? `/news/${item.id}` : null
                        const externalHref = !internalHref && item.file_url ? item.file_url : null

                        let wrapped = body
                        if (internalHref) {
                          wrapped = (
                            <Link to={internalHref} style={{ color: 'inherit', textDecoration: 'none' }}>
                              {body}
                            </Link>
                          )
                        } else if (externalHref) {
                          wrapped = (
                            <a
                              href={externalHref}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                              {body}
                            </a>
                          )
                        }

                        return (
                          <div
                            key={item.id}
                            style={{
                              borderBottom: '1px solid #d1d5db',
                              paddingBottom: '14px',
                              marginBottom: '14px',
                            }}
                          >
                            {wrapped}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <CtaSection />
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .v2-activity-item {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 28px 0 !important;
          }
          .v2-news-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}
