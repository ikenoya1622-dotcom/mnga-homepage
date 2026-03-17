import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CtaSection from '../components/CtaSection'

gsap.registerPlugin(ScrollTrigger)

const articles = [
  { id: 1, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', date: '20xx 1.1' },
  { id: 2, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', date: '20xx 1.1' },
  { id: 3, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', date: '20xx 1.1' },
  { id: 4, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', date: '20xx 1.1' },
  { id: 5, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', date: '20xx 1.1' },
  { id: 6, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', date: '20xx 1.1' },
]

export default function Report() {
  const titleRef = useRef(null)
  const gridRef = useRef(null)
  const paginationRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const targets = [titleRef.current, gridRef.current, paginationRef.current]
    const anims = targets.map((el) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
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
        <div
          ref={titleRef}
          style={{ padding: '60px 60px 40px' }}
        >
          <h1 style={{ fontSize: '28px', letterSpacing: '0.1em' }}>活動レポート</h1>
        </div>

        {/* 記事グリッド */}
        <div ref={gridRef} style={{ padding: '0 60px 60px' }}>
          <div className="report-grid">
            {articles.map((article) => (
              <article key={article.id}>
                {/* サムネイル */}
                <div
                  style={{
                    background: '#d0d0d0',
                    aspectRatio: '4/3',
                    width: '100%',
                    marginBottom: '16px',
                  }}
                />
                {/* タイトル */}
                <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '8px' }}>
                  {article.title}
                  <br />
                  xxxxxxxxxxxxxxxxxx
                </p>
                {/* 日付 */}
                <p style={{ fontSize: '14px', textAlign: 'right', letterSpacing: '0.05em' }}>
                  {article.date}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ページネーション */}
        <div
          ref={paginationRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            padding: '40px 0 80px',
          }}
        >
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                fontSize: '16px',
                letterSpacing: '0.05em',
                background: page === 1 ? '#000' : 'transparent',
                color: page === 1 ? '#fff' : '#000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}
          <button
            style={{
              fontSize: '16px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#000',
            }}
          >
            ›
          </button>
        </div>

        {/* CTAセクション */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
