import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'report-thumbnails'

const BLOCK_TYPE_LABELS = {
  heading: '大見出し',
  subheading: '小見出し',
  text: '本文',
  image: '挿入画像',
}

const BLOCK_BORDER_COLORS = {
  heading: '#7c3aed',
  subheading: '#2563eb',
  text: '#374151',
  image: '#d97706',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '16px',
  fontFamily: 'inherit',
  border: '1px solid #ccc',
  borderRadius: '4px',
  letterSpacing: '0.05em',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  color: '#555',
  marginBottom: '6px',
  letterSpacing: '0.05em',
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function initBlock(type) {
  return { id: makeId(), type, content: '', url: '', file: null, previewUrl: '' }
}

function hydrateBlocks(blocks) {
  return (blocks || []).map((b) => ({
    id: makeId(),
    type: b.type || 'text',
    content: b.content || '',
    url: b.url || '',
    file: null,
    previewUrl: '',
  }))
}

export default function Admin() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [editId, setEditId] = useState(null)
  const [title, setTitle] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [blocks, setBlocks] = useState([])

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
  }

  function startEdit(article) {
    setEditId(article.id)
    setTitle(article.title || '')
    setPublishedAt(article.published_at ? article.published_at.slice(0, 10) : '')
    setPreviewUrl(article.thumbnail_url || '')
    setFile(null)
    setBlocks(hydrateBlocks(article.content))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── ブロック操作 ──────────────────────────
  function addBlock(type) {
    setBlocks((prev) => [...prev, initBlock(type)])
  }

  function updateBlock(id, updates) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  function removeBlock(id) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  function moveBlock(id, dir) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
  }

  function handleBlockFileChange(id, e) {
    const f = e.target.files[0]
    if (!f) return
    updateBlock(id, { file: f, previewUrl: URL.createObjectURL(f) })
  }

  // ── アップロード ─────────────────────────
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

  // ── 送信 ────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) { alert('Supabaseの設定が完了していません'); return }
    if (!title.trim()) { alert('タイトルを入力してください'); return }
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
        published_at: publishedAt || new Date().toISOString().slice(0, 10),
        thumbnail_url: thumbnailUrl || null,
        content: processedBlocks,
      }

      if (editId) {
        const { error } = await supabase.from('reports').update(payload).eq('id', editId)
        if (error) throw new Error('更新失敗: ' + error.message)
      } else {
        const { error } = await supabase.from('reports').insert([payload])
        if (error) throw new Error('投稿失敗: ' + error.message)
      }

      resetForm()
      await fetchArticles()
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
    if (error) alert('削除失敗: ' + error.message)
    else await fetchArticles()
  }

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  // ── ブロックエディタUI ────────────────────
  function BlockEditor() {
    return (
      <div>
        {/* ブロック一覧 */}
        {blocks.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '16px' }}>
            ブロックがありません。下のボタンで追加してください。
          </p>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${BLOCK_BORDER_COLORS[block.type] || '#ccc'}`,
                  borderRadius: '4px',
                  marginBottom: '8px',
                  background: '#fff',
                }}
              >
                {/* ブロックヘッダー */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    background: '#fafafa',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: BLOCK_BORDER_COLORS[block.type] || '#555',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {BLOCK_TYPE_LABELS[block.type]}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => moveBlock(block.id, 'up')}
                      disabled={idx === 0}
                      style={arrowBtnStyle(idx === 0)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(block.id, 'down')}
                      disabled={idx === blocks.length - 1}
                      style={arrowBtnStyle(idx === blocks.length - 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '13px',
                        background: 'transparent',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* ブロックコンテンツ */}
                <div style={{ padding: '12px' }}>
                  {block.type === 'image' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBlockFileChange(block.id, e)}
                        style={{ fontSize: '14px', fontFamily: 'inherit', marginBottom: '8px' }}
                      />
                      {(block.previewUrl || block.url) && (
                        <img
                          src={block.previewUrl || block.url}
                          alt="preview"
                          style={{
                            width: '200px',
                            aspectRatio: '4/3',
                            objectFit: 'cover',
                            border: '1px solid #e5e7eb',
                            display: 'block',
                            marginTop: '8px',
                          }}
                        />
                      )}
                    </div>
                  ) : block.type === 'heading' || block.type === 'subheading' ? (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder={`${BLOCK_TYPE_LABELS[block.type]}を入力`}
                      style={{ ...inputStyle }}
                    />
                  ) : (
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder="本文を入力"
                      rows={5}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.8' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ブロック追加ボタン */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(BLOCK_TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontFamily: 'inherit',
                background: 'transparent',
                border: `1px solid ${BLOCK_BORDER_COLORS[type]}`,
                color: BLOCK_BORDER_COLORS[type],
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              + {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  function arrowBtnStyle(disabled) {
    return {
      padding: '4px 8px',
      fontSize: '13px',
      background: 'transparent',
      border: '1px solid #d1d5db',
      color: disabled ? '#d1d5db' : '#374151',
      borderRadius: '4px',
      cursor: disabled ? 'default' : 'pointer',
      fontFamily: 'inherit',
    }
  }

  // ── レンダー ─────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Zen Old Mincho, serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 60px', height: '64px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.1em' }}>MNGA 管理画面</span>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>

        {/* 投稿・編集フォーム */}
        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '40px', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '32px', letterSpacing: '0.1em' }}>
            {editId ? '記事を編集' : '新規投稿'}
          </h2>
          <form onSubmit={handleSubmit}>

            {/* タイトル */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>タイトル *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="記事タイトルを入力"
                style={inputStyle}
              />
            </div>

            {/* サムネイル */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>サムネイル画像</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ fontSize: '14px', fontFamily: 'inherit' }}
              />
              {previewUrl && (
                <div style={{ marginTop: '12px' }}>
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{ width: '200px', aspectRatio: '4/3', objectFit: 'cover', border: '1px solid #e5e7eb' }}
                  />
                </div>
              )}
            </div>

            {/* 公開日 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>公開日</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                style={{ ...inputStyle, width: '200px' }}
              />
            </div>

            {/* コンテンツブロック */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ ...labelStyle, marginBottom: '12px', fontSize: '16px', color: '#000', fontWeight: '700' }}>
                本文コンテンツ
              </label>
              <BlockEditor />
            </div>

            {/* 送信ボタン */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 32px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  letterSpacing: '0.1em',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? '送信中...' : editId ? '更新する' : '投稿する'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </section>

        {/* 記事一覧 */}
        <section>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.1em' }}>記事一覧</h2>
          {loading ? (
            <p style={{ color: '#888' }}>読み込み中...</p>
          ) : articles.length === 0 ? (
            <p style={{ color: '#888' }}>記事がありません</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px', gap: '16px', padding: '12px 20px', background: '#f3f4f6', borderRadius: '4px', fontSize: '13px', color: '#666', letterSpacing: '0.05em' }}>
                <span>タイトル</span>
                <span>公開日</span>
                <span>操作</span>
              </div>
              {articles.map((article) => (
                <div
                  key={article.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px', gap: '16px', padding: '16px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {article.title}
                  </span>
                  <span style={{ fontSize: '14px', color: '#555' }}>
                    {article.published_at ? article.published_at.slice(0, 10) : '—'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(article)}
                      style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #000', borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.05em' }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #c8392b', color: '#c8392b', borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.05em' }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
