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
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

function BodyText({ text }) {
  if (!text) return null
  const paragraphs = text.split(/\n\n+/)
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} style={{ fontSize: '18px', lineHeight: '2', letterSpacing: '0.05em', marginBottom: '32px' }}>
          {para.split('\n').map((line, j, arr) => (
            <span key={j}>{renderBold(line)}{j < arr.length - 1 && <br />}</span>
          ))}
        </p>
      ))}
    </>
  )
}

const ALLOWED_IMAGE_DOMAINS = [
  'dqbbcnlsjqxeowfsmjwl.supabase.co',
]

function isSafeImageUrl(url) {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return ALLOWED_IMAGE_DOMAINS.includes(hostname)
  } catch {
    return false
  }
}

function ContentBlock({ block }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 style={{
          fontSize: '22px',
          fontWeight: '700',
          letterSpacing: '0.1em',
          lineHeight: '1.6',
          marginTop: '64px',
          marginBottom: '16px',
        }}>
          {block.content}
        </h2>
      )
    case 'subheading':
      return (
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#666',
          letterSpacing: '0.05em',
          lineHeight: '1.6',
          marginBottom: '12px',
        }}>
          {block.content}
        </h3>
      )
    case 'text':
      return <BodyText text={block.content} />
    case 'image':
      return (
        <div
          className="report-detail-insert-image"
          style={{
            width: '65%',
            margin: '48px auto',
            aspectRatio: '4/3',
            background: '#d0d0d0',
            overflow: 'hidden',
          }}
        >
          {isSafeImageUrl(block.url) && (
            <img
              src={block.url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
      )
    default:
      return null
  }
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
        if (error || !data || data.published_at > new Date().toISOString()) { setNotFound(true) }
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

  const hasBlocks = article && Array.isArray(article.content) && article.content.length > 0

  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ paddingTop: '80px' }}>
        {loading ? (
          <div className="container" style={{ padding: '60px 80px 80px' }}>
            <div style={{ height: '40px', background: '#e8e8e8', width: '50%', marginBottom: '12px', borderRadius: '2px' }} />
            <div style={{ height: '16px', background: '#e8e8e8', width: '120px', marginBottom: '32px', marginLeft: 'auto', borderRadius: '2px' }} />
            <div style={{ aspectRatio: '16/9', background: '#e8e8e8', width: '100%', marginBottom: '60px', borderRadius: '2px' }} />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: '20px', background: '#e8e8e8', marginBottom: '16px', borderRadius: '2px', width: i % 3 === 2 ? '70%' : '100%' }} />
              ))}
            </div>
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

            {/* 記事ヘッダー */}
            <div className="container" style={{ paddingTop: '60px', paddingBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', lineHeight: '1.6', letterSpacing: '0.1em', marginBottom: '12px' }}>
                {article.title}
              </h1>
              <p style={{ fontSize: '14px', color: '#888', letterSpacing: '0.05em', textAlign: 'right' }}>
                {formatDate(article.published_at)}
              </p>
            </div>

            {/* サムネイル */}
            <div className="container" style={{ paddingBottom: '60px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#d0d0d0', overflow: 'hidden' }}>
                {article.thumbnail_url && (
                  <img
                    src={article.thumbnail_url}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>
            </div>

            {/* 本文エリア */}
            <div
              className="report-detail-body"
              style={{ maxWidth: '800px', margin: '0 auto', padding: '0 80px 80px' }}
            >
              {hasBlocks ? (
                article.content.map((block, i) => (
                  <ContentBlock key={i} block={block} />
                ))
              ) : (
                <BodyText text={article.body} />
              )}

              {/* 一覧に戻る */}
              <div style={{ marginTop: '60px' }}>
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

          </div>
        )}

        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
