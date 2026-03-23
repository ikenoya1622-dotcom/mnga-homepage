import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CtaSection from '../components/CtaSection'
import { supabase } from '../lib/supabase'

gsap.registerPlugin(ScrollTrigger)

export default function Report() {
  const titleRef = useRef(null)
  const gridRef = useRef(null)
  const paginationRef = useRef(null)

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      if (!supabase) { setLoading(false); return }
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .lte('published_at', today)
        .order('published_at', { ascending: false })
      if (!error && data) setArticles(data)
      setLoading(false)
    }
    fetchArticles()
  }, [])

  useEffect(() => {
    if (loading) return
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
  }, [loading])

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ paddingTop: '80px' }}>
        {/* ページタイトル */}
        <div
          ref={titleRef}
          className="container"
          style={{ paddingTop: '60px', paddingBottom: '40px' }}
        >
          <h1 style={{ fontSize: '28px', letterSpacing: '0.1em' }}>活動レポート</h1>
        </div>

        {/* 記事グリッド */}
        <div ref={gridRef} className="container" style={{ paddingBottom: '60px' }}>
          {loading ? (
            <div className="report-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div
                    style={{
                      background: '#e8e8e8',
                      aspectRatio: '4/3',
                      width: '100%',
                      marginBottom: '16px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div style={{ height: '20px', background: '#e8e8e8', marginBottom: '8px', borderRadius: '2px' }} />
                  <div style={{ height: '20px', background: '#e8e8e8', width: '60%', marginBottom: '8px', borderRadius: '2px' }} />
                  <div style={{ height: '14px', background: '#e8e8e8', width: '30%', marginLeft: 'auto', borderRadius: '2px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="report-grid">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/report/${article.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <article>
                    {/* サムネイル */}
                    <div
                      style={{
                        background: '#d0d0d0',
                        aspectRatio: '4/3',
                        width: '100%',
                        marginBottom: '16px',
                        overflow: 'hidden',
                      }}
                    >
                      {article.thumbnail_url && (
                        <img
                          src={article.thumbnail_url}
                          alt={article.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    {/* タイトル */}
                    <p style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '8px' }}>
                      {article.title}
                    </p>
                    {/* 日付 */}
                    <p style={{ fontSize: '14px', textAlign: 'right', letterSpacing: '0.05em' }}>
                      {formatDate(article.published_at)}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ページネーション */}
        <div
          ref={paginationRef}
          className="container"
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

        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
