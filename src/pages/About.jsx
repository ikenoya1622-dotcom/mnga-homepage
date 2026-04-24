import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CtaSection from '../components/CtaSection'
import { supabase } from '../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

const NEWS_CATEGORIES = ['定款', '事業報告', 'お知らせ']

const values = [
  { title: '対等な関係', desc: '大企業にベンチャーがぶら下がるのではなく、相互に学びあう。' },
  { title: '会員の質', desc: '会員数ではなく、参加者の質と関係性の深さを重視' },
  { title: '本質的な協業', desc: '単なるネットワーキングではなく、具体的な協業プロジェクトの創出' },
  { title: '経営スキル', desc: '経営者からの相談、ナレッジの共有による経営スキルの育成' },
  { title: '将来志向', desc: '過去の復活ではなく、世界の役に立つ日本の実現' },
]

function formatNewsDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${y}.${m}.${d}`
}

export default function AboutPage() {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]
  const [news, setNews] = useState([])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('news_items')
      .select('*')
      .order('published_at', { ascending: false })
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.error('news_items の取得に失敗:', error); return }
        const grouped = NEWS_CATEGORIES
          .map((cat) => ({
            category: cat,
            items: (data || []).filter((x) => x.category === cat),
          }))
          .filter((g) => g.items.length > 0)
        setNews(grouped)
      })
  }, [])

  useEffect(() => {
    const anims = refs.map((ref) =>
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            once: true,
          },
        }
      )
    )
    return () => {
      anims.forEach((a) => a.kill())
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ paddingTop: '80px' }}>

        {/* ページタイトル */}
        <div ref={refs[0]} className="container" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', letterSpacing: '0.05em' }}>About MNGA</h1>
        </div>

        {/* 1. Mission */}
        <div ref={refs[1]} className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <p className="text-sm text-gray-500 font-bold" style={{ marginBottom: '24px' }}>1. Mission</p>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.6' }}>
            「いなくてはならない日本」の実現
          </h2>
          <div style={{ fontSize: '16px', lineHeight: '2', color: '#333' }}>
            <p>「いてほしい国」ではなく「いなくてはならない国・日本」</p>
            <p>世界にとって価値のある、世界の役に立つ日本を目指す</p>
            <p>軍国主義的な復活ではなく、将来志向の日本復活</p>
          </div>
        </div>

        {/* 2. Core Value */}
        <div ref={refs[2]} className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <p className="text-sm text-gray-500 font-bold" style={{ marginBottom: '24px' }}>2. Core Value</p>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.6' }}>
            Make Nippon Great Again（日本新復活）
          </h2>
          <div style={{ fontSize: '16px', lineHeight: '2', color: '#333' }}>
            <p>日本をより強い国にするために、大企業とベンチャー企業が協業する</p>
            <p>コミュニティを構築する。日本を動かしていくビジョンを共有</p>
            <p>し、業界の垣根を越えた革新的な協業を促進する。</p>
          </div>
        </div>

        {/* 3. 提供価値 */}
        <div ref={refs[3]} className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <p className="text-sm text-gray-500 font-bold" style={{ marginBottom: '24px' }}>3. 提供価値</p>
          <div className="membership-inner">
            <div className="membership-visual-wrap">
              <div
                style={{
                  background: '#f3f4f6',
                  aspectRatio: '3/4',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/images/mnga-logo.png"
                  alt="MNGA"
                  style={{ width: '70%', height: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div>
              {values.map((v) => (
                <div key={v.title} style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.desc}</p>
                </div>
              ))}
              <a
                href="#"
                className="text-sm text-gray-700 hover:underline"
                style={{ display: 'block', textAlign: 'right', marginTop: '16px' }}
              >
                view more &gt;
              </a>
            </div>
          </div>
        </div>

        {/* 4. -News */}
        <div ref={refs[4]} style={{ background: '#f5f5f5', padding: '60px 0' }}>
          <div className="container">
            <p className="text-sm text-gray-500 font-bold" style={{ marginBottom: '40px' }}>4. -News</p>
            <div className="about-news-inner">
              {news.length === 0 ? (
                <p style={{ color: '#888', fontSize: '14px' }}>お知らせはまだありません</p>
              ) : (
                news.map((group) => (
                  <div key={group.category} style={{ marginBottom: '48px' }}>
                    <div className="about-news-row">
                      <div className="about-news-category">
                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{group.category}</p>
                      </div>
                      <div className="about-news-articles">
                        {group.items.map((item) => {
                          const body = (
                            <>
                              <p className="text-sm text-gray-500" style={{ marginBottom: '4px' }}>
                                {formatNewsDate(item.published_at)}
                              </p>
                              <p style={{ fontSize: '14px' }}>{item.title}</p>
                            </>
                          )

                          const hasBlocks = Array.isArray(item.content) && item.content.length > 0
                          // お知らせ: 本文ブロックがあれば詳細ページへ、なければ PDF or プレーン
                          // 定款・事業報告: PDF があれば PDF へ、なければプレーン
                          const internalHref =
                            item.category === 'お知らせ' && hasBlocks
                              ? `/news/${item.id}`
                              : null
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
                              <a href={externalHref} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                {body}
                              </a>
                            )
                          }

                          return (
                            <div
                              key={item.id}
                              style={{
                                borderBottom: '1px solid #ccc',
                                paddingBottom: '12px',
                                marginBottom: '12px',
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
          </div>
        </div>

        {/* CTA */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
