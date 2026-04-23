import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CtaSection from '../components/CtaSection'
import { supabase } from '../lib/supabase'
import { ContentBlock } from '../components/BlockRenderer'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y}/${m}/${d}`
}

export default function NewsDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) { setLoading(false); return }
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('id', id)
        .single()
      if (cancelled) return
      if (error || !data) {
        setNotFound(true)
      } else {
        setItem(data)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!item || !contentRef.current) return
    const anim = gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
    return () => anim.kill()
  }, [item])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main style={{ paddingTop: '120px', textAlign: 'center', color: '#888' }}>読み込み中...</main>
        <Footer />
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen">
        <Header />
        <main style={{ paddingTop: '120px', textAlign: 'center', color: '#888' }}>
          <p>お知らせが見つかりませんでした</p>
          <Link to="/about" style={{ color: '#374151', textDecoration: 'underline', display: 'inline-block', marginTop: '16px' }}>
            ← About に戻る
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const hasBlocks = Array.isArray(item.content) && item.content.length > 0

  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ paddingTop: '80px' }}>
        <article ref={contentRef}>
          <div className="container" style={{ paddingTop: '60px', paddingBottom: '32px' }}>
            <p style={{ fontSize: '13px', color: '#888', letterSpacing: '0.08em', marginBottom: '12px' }}>
              {item.category}
            </p>
            <h1 style={{ fontSize: '28px', lineHeight: '1.6', letterSpacing: '0.1em', marginBottom: '12px' }}>
              {item.title}
            </h1>
            <p style={{ fontSize: '14px', color: '#888', letterSpacing: '0.05em', textAlign: 'right' }}>
              {formatDate(item.published_at)}
            </p>
          </div>

          {item.file_url && (
            <div className="container" style={{ paddingBottom: '24px' }}>
              <a
                href={item.file_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#374151',
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                }}
              >
                添付 PDF を開く ↗
              </a>
            </div>
          )}

          <div
            className="report-detail-body"
            style={{ maxWidth: '800px', margin: '0 auto', padding: '0 80px 80px' }}
          >
            {hasBlocks ? (
              item.content.map((block, i) => <ContentBlock key={i} block={block} />)
            ) : !item.file_url ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
                このお知らせには本文がまだありません。
              </p>
            ) : null}

            <div style={{ marginTop: '60px' }}>
              <Link
                to="/about"
                style={{
                  display: 'inline-block',
                  fontSize: '14px',
                  color: '#374151',
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                }}
              >
                ← About に戻る
              </Link>
            </div>
          </div>
        </article>

        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
