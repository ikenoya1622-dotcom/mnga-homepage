import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminHeader from '../components/AdminHeader'
import BlockEditor, { hydrateBlocks } from '../components/BlockEditor'
import '../styles/mnga/admin.css'

// News（お知らせ）の両立型タグ：編集系（お知らせ/プレス/イベント）＋情報公開（定款・事業報告のPDF）
const CATEGORIES = ['お知らせ', 'プレス', 'イベント', '情報公開']
// 本文ブロック（見出し・本文・画像）を編集できる＝編集系カテゴリ。情報公開はPDF添付のみ
const RICH_CATEGORIES = ['お知らせ', 'プレス', 'イベント']
const PDF_BUCKET = 'news-files'
const IMAGE_BUCKET = 'report-thumbnails'

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
  const [blocks, setBlocks] = useState([])

  // 編集系カテゴリは本文ブロックを扱える（情報公開はPDFのみ）。既存ロジック互換のため変数名は維持
  const isAnnouncement = RICH_CATEGORIES.includes(category)

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
    setBlocks([])
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
    setBlocks(hydrateBlocks(item.content))
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
    const { error } = await supabase.storage.from(PDF_BUCKET).upload(fileName, pdfFile)
    if (error) {
      alert('PDF のアップロード失敗: ' + error.message)
      return null
    }
    const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  }

  async function uploadBlockImages(blocksArr) {
    const result = []
    for (const block of blocksArr) {
      if (block.type === 'image' && block.file) {
        const ext = block.file.name.split('.').pop()
        const fileName = `news-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(fileName, block.file)
        if (error) {
          alert('挿入画像のアップロード失敗: ' + error.message)
          result.push({ type: block.type, content: block.content, url: block.url })
        } else {
          const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(fileName)
          result.push({ type: block.type, content: block.content, url: data.publicUrl })
        }
      } else {
        result.push({ type: block.type, content: block.content, url: block.url })
      }
    }
    return result
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
    for (const b of blocks) {
      if (b.content && b.content.length > 10000) {
        alert('本文は 1 ブロックあたり 10,000 文字以内で入力してください')
        return
      }
    }

    setSubmitting(true)
    try {
      let finalFileUrl = fileUrl
      if (pdfFile) {
        const url = await uploadPdf()
        if (url) finalFileUrl = url
      }

      const processedBlocks = isAnnouncement ? await uploadBlockImages(blocks) : []

      const payload = {
        category,
        published_at: publishedAt,
        title: title.trim(),
        file_url: finalFileUrl || null,
        sort_order: Number(sortOrder) || 0,
        content: processedBlocks,
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
    // 既知カテゴリに無い旧カテゴリ（定款/事業報告 等・正規化前）も必ず表示する
    const extraCats = [...new Set(items.map((x) => x.category).filter((c) => c && !CATEGORIES.includes(c)))]
    const grouped = [...CATEGORIES, ...extraCats]
      .map((c) => ({ category: c, items: items.filter((x) => x.category === c) }))
      .filter((g) => g.items.length > 0 || CATEGORIES.includes(g.category))

    return (
      <div className="mnga-admin">
        <AdminHeader
          right={
            <button onClick={openNew} className="adm-btn adm-btn--solid">
              + 新規作成
            </button>
          }
        />

        <main className="adm-container adm-container--pad40">
          {loading ? (
            <p className="adm-muted">読み込み中...</p>
          ) : items.length === 0 ? (
            <p className="adm-muted">お知らせはまだありません。「新規作成」から追加してください。</p>
          ) : (
            grouped.map((g) => (
              <section key={g.category} className="adm-group">
                <h2 className="adm-group__head">
                  <span className="adm-group__name">{g.category}</span>
                  <span className="adm-group__count en">{g.items.length}件</span>
                </h2>
                {g.items.length === 0 ? (
                  <p className="adm-empty">なし</p>
                ) : (
                  <div className="adm-card">
                    {g.items.map((it) => {
                      const hasBlocks = Array.isArray(it.content) && it.content.length > 0
                      return (
                        <div key={it.id} className="adm-item">
                          <div className="adm-item__main">
                            <p className="adm-item__meta">
                              {it.published_at}
                              {it.file_url && ' ・ PDF'}
                              {hasBlocks && ' ・ 本文あり'}
                            </p>
                            <p className="adm-item__title">{it.title}</p>
                          </div>
                          <div className="adm-item__actions">
                            {it.file_url && (
                              <a href={it.file_url} target="_blank" rel="noreferrer" className="adm-btn adm-btn--sm">
                                PDF
                              </a>
                            )}
                            {hasBlocks && (
                              <a href={`/news/${it.id}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn--sm">
                                プレビュー
                              </a>
                            )}
                            <button onClick={() => openEdit(it)} className="adm-btn adm-btn--sm">
                              編集
                            </button>
                            <button onClick={() => handleDelete(it)} className="adm-btn adm-btn--sm adm-btn--danger">
                              削除
                            </button>
                          </div>
                        </div>
                      )
                    })}
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
    <div className="mnga-admin">
      <AdminHeader
        right={
          <>
            <button onClick={() => { resetForm(); setView('list') }} className="adm-btn adm-btn--sm">
              戻る
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="adm-btn adm-btn--solid adm-btn--sm">
              {submitting ? '保存中...' : editId ? '更新' : '公開'}
            </button>
          </>
        }
      />

      <main className="adm-container adm-container--narrow adm-container--pad40">
        <form onSubmit={handleSubmit}>
          <div className="adm-field">
            <label className="adm-label">カテゴリ</label>
            <select
              className="adm-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="adm-hint">
              {isAnnouncement
                ? '編集系カテゴリ（お知らせ／プレス／イベント）は本文ブロック（見出し・本文・画像）を編集できます。'
                : '「情報公開」は定款・事業報告などのPDFを添付して公開します（本文ブロックは不要）。'}
            </p>
          </div>

          <div className="adm-field">
            <label className="adm-label">日付</label>
            <input
              type="date"
              className="adm-input"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">タイトル</label>
            <input
              type="text"
              className="adm-input"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              maxLength={200}
              placeholder="タイトルを入力"
              required
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">
              PDF ファイル（任意・10MB まで{isAnnouncement ? '・本文と併用可' : ''}）
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
            />
            {pdfFile && (
              <p className="adm-hint">選択中: {pdfFile.name}</p>
            )}
            {!pdfFile && fileUrl && (
              <p className="adm-hint">
                現在の PDF: <a href={fileUrl} target="_blank" rel="noreferrer">{fileUrl}</a>
              </p>
            )}
          </div>

          <div className="adm-field">
            <label className="adm-label">表示順（小さいほど上・同日付の中で効く）</label>
            <input
              type="number"
              className="adm-input adm-input--num"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </form>

        {isAnnouncement && (
          <div style={{ marginTop: '32px' }}>
            <label className="adm-label">本文</label>
            <div className="adm-card adm-card--pad">
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
