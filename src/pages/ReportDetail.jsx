import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CtaSection from '../components/CtaSection'
import { supabase } from '../lib/supabase'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

export default function ReportDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    async function fetchArticle() {
      if (!supabase) { setLoading(false); return }
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single()
        if (error || !data) { setNotFound(true) }
        else { setArticle(data) }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [id])

  useEffect(() => {
    if (loading || !contentRef.current) return
    const anim = gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
    return () => anim.kill()
  }, [loading])

  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ paddingTop: '80px' }}>
        {loading ? (
          <div className="container" style={{ padding: '80px 80px' }}>
            {/* スケルトン */}
            <div style={{ height: '400px', background: '#e8e8e8', marginBottom: '32px', borderRadius: '2px' }} />
            <div style={{ height: '16px', background: '#e8e8e8', width: '120px', marginBottom: '24px', borderRadius: '2px' }} />
            <div style={{ height: '36px', background: '#e8e8e8', width: '60%', marginBottom: '32px', borderRadius: '2px' }} />
            <div style={{ height: '20px', background: '#e8e8e8', marginBottom: '12px', borderRadius: '2px' }} />
            <div style={{ height: '20px', background: '#e8e8e8', marginBottom: '12px', borderRadius: '2px' }} />
            <div style={{ height: '20px', background: '#e8e8e8', width: '80%', borderRadius: '2px' }} />
          </div>
        ) : notFound ? (
          <div className="container" style={{ padding: '80px 80px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: '#888', marginBottom: '32px' }}>記事が見つかりませんでした</p>
            <Link to="/report" style={{ fontSize: '16px', color: '#000', letterSpacing: '0.1em' }}>
              ← 一覧に戻る
            </Link>
          </div>
        ) : (
          <div ref={contentRef}>
            {/* サムネイル */}
            {article.thumbnail_url && (
              <div style={{ width: '100%', maxHeight: '500px', overflow: 'hidden' }}>
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* 記事本文エリア */}
            <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
              {/* 公開日 */}
              <p style={{ fontSize: '14px', color: '#888', letterSpacing: '0.05em', marginBottom: '16px' }}>
                {formatDate(article.published_at)}
              </p>

              {/* タイトル */}
              <h1 style={{ fontSize: '28px', lineHeight: '1.8', letterSpacing: '0.1em', marginBottom: '48px' }}>
                {article.title}
              </h1>

              {/* 本文 */}
              {article.body && (
                <div
                  style={{
                    fontSize: '18px',
                    lineHeight: '2',
                    letterSpacing: '0.1em',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '80px',
                    maxWidth: '800px',
                  }}
                >
                  {article.body}
                </div>
              )}

              {/* 一覧に戻る */}
              <Link
                to="/report"
                style={{
                  display: 'inline-block',
                  fontSize: '16px',
                  color: '#000',
                  letterSpacing: '0.1em',
                  borderBottom: '1px solid #000',
                  paddingBottom: '2px',
                  textDecoration: 'none',
                }}
              >
                ← 一覧に戻る
              </Link>
            </div>
          </div>
        )}

        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
