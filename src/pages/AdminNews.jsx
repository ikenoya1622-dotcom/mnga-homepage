import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminHeader from '../components/AdminHeader'

const CATEGORIES = ['定款', '事業報告', 'お知らせ']
const BUCKET = 'news-files'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function validatePdf(f) {
  if (f.type !== 'application/pdf') {
    alert('PDF ファイルのみアップロードできます')
    return false
  }
  if (f.size > 10 * 1024 * 1024) {
    alert('ファイルサイズは 10MB 以下にしてください')
    return false
  }
  return true
}

export default function AdminNews() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const [view, setView] = useState('list')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [editId, setEditId] = useState(null)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [publishedAt, setPublishedAt] = useState(today())
  const [title, setTitle] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .order('category', { ascending: true })
      .order('published_at', { ascending: false })
      .order('sort_order', { ascending: true })
    if (error) {
      alert('一覧の取得に失敗しました: ' + error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  function resetForm() {
    setEditId(null)
    setCategory(CATEGORIES[0])
    setPublishedAt(today())
    setTitle('')
    setFileUrl('')
    setPdfFile(null)
    setSortOrder(0)
  }

  function openNew() {
    resetForm()
    setView('editor')
  }

  function openEdit(item) {
    setEditId(item.id)
    setCategory(item.category)
    setPublishedAt(item.published_at)
    setTitle(item.title)
    setFileUrl(item.file_url || '')
    setPdfFile(null)
    setSortOrder(item.sort_order || 0)
    setView('editor')
  }

  function handlePdfChange(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!validatePdf(f)) { e.target.value = ''; return }
    setPdfFile(f)
  }

  async function uploadPdf() {
    if (!pdfFile) return null
    const safeName = pdfFile.name.replace(/[^\w.\-]/g, '_')
    const fileName = `${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, pdfFile)
    if (error) {
      alert('PDF のアップロード失敗: ' + error.message)
      return null
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  }

  async function logAction(action, itemId, detail = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('admin_logs').insert([{
        action,
        report_id: null,
        user_email: user?.email || null,
        detail: { entity: 'news_items', news_item_id: itemId, ...detail },
      }])
    } catch (err) {
      console.error('admin_logs への書き込みに失敗しました:', err)
    }
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!supabase) { alert('Supabase の設定が完了していません'); return }
    if (!title.trim()) { alert('タイトルを入力してください'); return }
    if (title.length > 200) { alert('タイトルは 200 文字以内で入力してください'); return }
    if (!publishedAt) { alert('日付を入力してください'); return }

    setSubmitting(true)
    try {
      let finalFileUrl = fileUrl
      if (pdfFile) {
        const url = await uploadPdf()
        if (url) finalFileUrl = url
      }

      const payload = {
        category,
        published_at: publishedAt,
        title: title.trim(),
        file_url: finalFileUrl || null,
        sort_order: Number(sortOrder) || 0,
      }

      if (editId) {
        const { error } = await supabase.from('news_items').update(payload).eq('id', editId)
        if (error) throw new Error('更新失敗: ' + error.message)
        await logAction('update', editId, { title: payload.title })
      } else {
        const { data, error } = await supabase.from('news_items').insert([payload]).select('id').single()
        if (error) throw new Error('投稿失敗: ' + error.message)
        await logAction('create', data?.id, { title: payload.title })
      }

      resetForm()
      await fetchItems()
      setView('list')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`「${item.title}」を削除しますか？`)) return
    const { error } = await supabase.from('news_items').delete().eq('id', item.id)
    if (error) { alert('削除失敗: ' + error.message); return }
    await logAction('delete', item.id, { title: item.title })
    await fetchItems()
  }

  // ── 一覧ビュー ──
  if (view === 'list') {
    const grouped = CATEGORIES.map((c) => ({
      category: c,
      items: items.filter((x) => x.category === c),
    }))

    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Zen Old Mincho, serif' }}>
        <AdminHeader
          right={
            <button
              onClick={openNew}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
              }}
            >
              + 新規作成
            </button>
          }
        />

        <main style={{ padding: '40px' }}>
          {loading ? (
            <p style={{ color: '#888' }}>読み込み中...</p>
          ) : items.length === 0 ? (
            <p style={{ color: '#888' }}>お知らせはまだありません。「新規作成」から追加してください。</p>
          ) : (
            grouped.map((g) => (
              <section key={g.category} style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                  {g.category} <span style={{ color: '#9ca3af', fontWeight: '400', marginLeft: '8px', fontSize: '13px' }}>{g.items.length}件</span>
                </h2>
                {g.items.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>なし</p>
                ) : (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    {g.items.map((it, idx) => (
                      <div
                        key={it.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          borderBottom: idx < g.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            {it.published_at}{it.file_url && ' ・ PDF'}
                          </p>
                          <p style={{ fontSize: '14px', fontWeight: '500', wordBreak: 'break-word' }}>
                            {it.title}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                          {it.file_url && (
                            <a
                              href={it.file_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                color: '#374151',
                                textDecoration: 'none',
                                fontFamily: 'inherit',
                              }}
                            >
                              PDF
                            </a>
                          )}
                          <button
                            onClick={() => openEdit(it)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              background: '#fff',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(it)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              borderRadius: '4px',
                              background: '#fff',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </main>
      </div>
    )
  }

  // ── エディタビュー ──
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Zen Old Mincho, serif' }}>
      <AdminHeader
        right={
          <>
            <button
              onClick={() => { resetForm(); setView('list') }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                border: '1px solid #d1d5db',
                background: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                background: submitting ? '#555' : '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
              }}
            >
              {submitting ? '保存中...' : editId ? '更新' : '公開'}
            </button>
          </>
        }
      />

      <main style={{ padding: '40px', maxWidth: '720px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>日付</label>
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              maxLength={200}
              placeholder="タイトルを入力"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>PDF ファイル（任意・10MB まで）</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
              style={{ fontSize: '14px' }}
            />
            {pdfFile && (
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                選択中: {pdfFile.name}
              </p>
            )}
            {!pdfFile && fileUrl && (
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                現在の PDF: <a href={fileUrl} target="_blank" rel="noreferrer">{fileUrl}</a>
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>表示順（小さいほど上・同日付の中で効く）</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ ...inputStyle, width: '120px' }}
            />
          </div>
        </form>
      </main>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '6px',
  letterSpacing: '0.05em',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '15px',
  fontFamily: 'inherit',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}
