import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminHeader from '../components/AdminHeader'
import BlockEditor, {
  AutoResizeTextarea,
  hydrateBlocks,
  validateImageFile,
} from '../components/BlockEditor'
import '../styles/mnga/admin.css'

const BUCKET = 'report-thumbnails'
// Reports（活動レポート）のカテゴリ＝一覧フィルタ／カードのタグ（mock準拠）
const REPORT_CATEGORIES = [
  { key: 'Meetup', ja: '会合' },
  { key: 'Project', ja: '協業案件' },
  { key: 'Talk', ja: '登壇・寄稿' },
  { key: 'Press', ja: 'プレス' },
]

// ── プレビュー用ヘルパー ────────────────────────────────────
function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

function PreviewBodyText({ text }) {
  if (!text) return null
  const paragraphs = text.split(/\n\n+/)
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} style={{ fontSize: '18px', lineHeight: '2', letterSpacing: '0.05em', marginBottom: '32px', margin: '0 0 32px' }}>
          {para.split('\n').map((line, j, arr) => (
            <span key={j}>{renderBold(line)}{j < arr.length - 1 && <br />}</span>
          ))}
        </p>
      ))}
    </>
  )
}

// ReportDetail.jsx の ContentBlock と完全に同じスタイル
// image のみ previewUrl にも対応
function PreviewContentBlock({ block }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '0.1em', lineHeight: '1.6', marginTop: '64px', marginBottom: '16px' }}>
          {block.content}
        </h2>
      )
    case 'subheading':
      return (
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#666', letterSpacing: '0.05em', lineHeight: '1.6', marginBottom: '12px' }}>
          {block.content}
        </h3>
      )
    case 'text':
      return <PreviewBodyText text={block.content} />
    case 'image': {
      const src = block.previewUrl || block.url
      return (
        <div style={{ width: '65%', margin: '48px auto', aspectRatio: '4/3', background: '#d0d0d0', overflow: 'hidden' }}>
          {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
      )
    }
    default:
      return null
  }
}

// ReportDetail.jsx のレイアウトを忠実に再現
function PreviewModal({ title, publishedAt, thumbnailSrc, blocks, onClose }) {
  function formatDate(str) {
    if (!str) return ''
    const d = new Date(str)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 500, overflowY: 'auto', fontFamily: 'Zen Old Mincho, serif' }}>

      {/* プレビューバー */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '48px',
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', zIndex: 501,
      }}>
        <span style={{ fontSize: '13px', color: '#888', letterSpacing: '0.08em' }}>プレビュー（公開後の表示イメージ）</span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: '1px solid #d1d5db',
            borderRadius: '4px', padding: '4px 16px',
            fontSize: '13px', fontFamily: 'Zen Old Mincho, serif',
            cursor: 'pointer', color: '#374151', letterSpacing: '0.05em',
          }}
        >
          ✕ 閉じる
        </button>
      </div>

      {/* 記事コンテンツ（ReportDetail と同じ構造） */}
      <div style={{ paddingTop: '48px' }}>

        {/* 記事ヘッダー: container相当 (padding 0 80px) */}
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '60px 80px 32px' }}>
          <h1 style={{ fontSize: '28px', lineHeight: '1.6', letterSpacing: '0.1em', marginBottom: '12px' }}>
            {title || 'タイトルなし'}
          </h1>
          <p style={{ fontSize: '14px', color: '#888', letterSpacing: '0.05em', textAlign: 'right' }}>
            {formatDate(publishedAt) || '----/--/--'}
          </p>
        </div>

        {/* サムネイル: container相当 */}
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 80px 60px' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#d0d0d0', overflow: 'hidden' }}>
            {thumbnailSrc && (
              <img src={thumbnailSrc} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
          </div>
        </div>

        {/* 本文エリア: maxWidth 800px, padding 0 80px */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 80px 80px' }}>
          {blocks.map((block, i) => (
            <PreviewContentBlock key={block.id || i} block={block} />
          ))}
        </div>

      </div>
    </div>
  )
}

// ── Admin ──────────────────────────────────────────────────
export default function Admin() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const [view, setView] = useState('list')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [editId, setEditId] = useState(null)
  const [title, setTitle] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [blocks, setBlocks] = useState([])
  const [category, setCategory] = useState(REPORT_CATEGORIES[0].key)
  const [excerpt, setExcerpt] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const thumbnailInputRef = useRef(null)

  async function fetchArticles() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('published_at', { ascending: false })
      if (error) throw error
      setArticles(data || [])
    } catch (err) {
      alert('記事の取得に失敗しました: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchArticles() }, [])

  function resetForm() {
    setEditId(null)
    setTitle('')
    setPublishedAt('')
    setFile(null)
    setPreviewUrl('')
    setBlocks([])
    setCategory(REPORT_CATEGORIES[0].key)
    setExcerpt('')
  }

  function goToList() {
    resetForm()
    setView('list')
  }

  function goToNewEditor() {
    resetForm()
    setView('editor')
  }

  function startEdit(article) {
    setEditId(article.id)
    setTitle(article.title || '')
    setPublishedAt(article.published_at ? article.published_at.slice(0, 16) : '')
    setPreviewUrl(article.thumbnail_url || '')
    setFile(null)
    setBlocks(hydrateBlocks(article.content))
    setCategory(article.category || REPORT_CATEGORIES[0].key)
    setExcerpt(article.excerpt || '')
    setView('editor')
  }

  function handleThumbnailChange(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!validateImageFile(f)) { e.target.value = ''; return }
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function uploadThumbnail() {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file)
    if (error) { alert('サムネイルのアップロード失敗: ' + error.message); return null }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  }

  async function uploadBlockImages(blocksArr) {
    const result = []
    for (const block of blocksArr) {
      if (block.type === 'image' && block.file) {
        const ext = block.file.name.split('.').pop()
        const fileName = `block-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from(BUCKET).upload(fileName, block.file)
        if (error) {
          alert('挿入画像のアップロード失敗: ' + error.message)
          result.push({ type: block.type, content: block.content, url: block.url })
        } else {
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
          result.push({ type: block.type, content: block.content, url: data.publicUrl })
        }
      } else {
        result.push({ type: block.type, content: block.content, url: block.url })
      }
    }
    return result
  }

  async function logAction(action, reportId, detail = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('admin_logs').insert([{
        action,
        report_id: reportId || null,
        user_email: user?.email || null,
        detail,
      }])
    } catch (err) {
      console.error('admin_logs への書き込みに失敗しました:', err)
    }
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!supabase) { alert('Supabaseの設定が完了していません'); return }
    if (!title.trim()) { alert('タイトルを入力してください'); return }
    if (title.length > 200) { alert('タイトルは 200 文字以内で入力してください'); return }
    for (const b of blocks) {
      if (b.content && b.content.length > 10000) {
        alert('本文は 1 ブロックあたり 10,000 文字以内で入力してください')
        return
      }
    }
    setSubmitting(true)

    try {
      let thumbnailUrl = previewUrl
      if (file) {
        const url = await uploadThumbnail()
        if (url) thumbnailUrl = url
      }

      const processedBlocks = await uploadBlockImages(blocks)

      const payload = {
        title: title.trim(),
        published_at: publishedAt || new Date().toISOString().slice(0, 16),
        thumbnail_url: thumbnailUrl || null,
        content: processedBlocks,
        category,
        excerpt: excerpt.trim() || null,
      }

      if (editId) {
        const { error } = await supabase.from('reports').update(payload).eq('id', editId)
        if (error) throw new Error('更新失敗: ' + error.message)
        await logAction('update', editId, { title: payload.title })
      } else {
        const { data, error } = await supabase.from('reports').insert([payload]).select('id').single()
        if (error) throw new Error('投稿失敗: ' + error.message)
        await logAction('create', data?.id, { title: payload.title })
      }

      resetForm()
      await fetchArticles()
      setView('list')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!supabase) { alert('Supabaseの設定が完了していません'); return }
    if (!window.confirm('この記事を削除しますか？')) return
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) { alert('削除失敗: ' + error.message); return }
    await logAction('delete', id)
    await fetchArticles()
  }

  // ── 一覧ビュー ─────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="mnga-admin">
        <AdminHeader
          right={
            <button type="button" onClick={goToNewEditor} className="adm-btn adm-btn--solid">
              新規投稿 ＋
            </button>
          }
        />

        <div className="adm-container">
          {loading ? (
            <p className="adm-muted">読み込み中...</p>
          ) : articles.length === 0 ? (
            <p className="adm-muted">記事がありません</p>
          ) : (
            <div className="adm-list">
              <div className="adm-list__head">
                <span>タイトル</span>
                <span>公開日</span>
                <span>操作</span>
              </div>
              {articles.map((article) => (
                <div key={article.id} className="adm-row">
                  <span className="adm-row__title">
                    <span>{article.title}</span>
                    {article.published_at > new Date().toISOString() && (
                      <span className="adm-pill adm-pill--reserved">予約中</span>
                    )}
                  </span>
                  <span className="adm-row__date">
                    {article.published_at ? article.published_at.slice(0, 16).replace('T', ' ') : '—'}
                  </span>
                  <div className="adm-row__actions">
                    <button onClick={() => startEdit(article)} className="adm-btn adm-btn--sm">
                      編集
                    </button>
                    <button onClick={() => handleDelete(article.id)} className="adm-btn adm-btn--sm adm-btn--danger">
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── エディタビュー ─────────────────────────────────────────
  return (
    <div className="mnga-admin adm-editor">
      {/* 固定ヘッダー */}
      <header className="adm-editbar">
        <button type="button" onClick={goToList} className="adm-btn adm-btn--ghost">
          ← 一覧に戻る
        </button>
        <div className="adm-editbar__actions">
          <button type="button" onClick={() => setShowPreview(true)} className="adm-btn">
            プレビュー
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting} className="adm-btn adm-btn--solid">
            {submitting ? '保存中...' : '保存する'}
          </button>
        </div>
      </header>

      {showPreview && (
        <PreviewModal
          title={title}
          publishedAt={publishedAt}
          thumbnailSrc={previewUrl}
          blocks={blocks}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* スクロールエリア */}
      <div className="adm-editbody">
        <div className="adm-editinner">

          {/* 公開日 */}
          <div className="adm-field">
            <input
              type="datetime-local"
              className="adm-input adm-input--inline"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>

          {/* カテゴリ（一覧フィルタ／カードのタグ） */}
          <div className="adm-field">
            <label className="adm-label">カテゴリ</label>
            <select
              className="adm-select"
              style={{ width: 'auto' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {REPORT_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}（{c.ja}）</option>)}
            </select>
          </div>

          {/* 抜粋（リード文・任意） */}
          <div className="adm-field">
            <label className="adm-label">抜粋（カード／詳細のリード文・任意）</label>
            <textarea
              className="adm-textarea"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
              placeholder="一覧カードと記事冒頭に表示される短い要約（未入力なら本文から自動生成）"
              rows={2}
            />
          </div>

          {/* サムネイル */}
          <div
            className={`adm-thumb${previewUrl ? ' adm-thumb--filled' : ''}`}
            onClick={() => !previewUrl && thumbnailInputRef.current && thumbnailInputRef.current.click()}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="thumbnail" />
                <label className="adm-thumb__change">
                  変更
                  <input type="file" accept="image/*" onChange={handleThumbnailChange} style={{ display: 'none' }} />
                </label>
              </>
            ) : (
              <span className="adm-thumb__hint">＋ サムネイル画像を追加</span>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* タイトル */}
          <AutoResizeTextarea
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
            placeholder="タイトルを入力"
            maxLength={200}
            className="adm-title-input"
            style={{ marginBottom: '24px' }}
          />

          <hr className="adm-divider" />

          {/* ブロックエディタ */}
          <BlockEditor blocks={blocks} onChange={setBlocks} />

        </div>
      </div>
    </div>
  )
}
