import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'report-thumbnails'

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

export default function Admin() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // フォーム状態
  const [editId, setEditId] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

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

  useEffect(() => {
    fetchArticles()
  }, [])

  function resetForm() {
    setEditId(null)
    setTitle('')
    setBody('')
    setPublishedAt('')
    setFile(null)
    setPreviewUrl('')
  }

  function startEdit(article) {
    setEditId(article.id)
    setTitle(article.title || '')
    setBody(article.body || '')
    setPublishedAt(article.published_at ? article.published_at.slice(0, 10) : '')
    setPreviewUrl(article.thumbnail_url || '')
    setFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function uploadImage() {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file)
    if (error) { alert('画像アップロード失敗: ' + error.message); return null }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!supabase) { alert('Supabaseの設定が完了していません'); return }
    if (!title.trim()) { alert('タイトルを入力してください'); return }
    setSubmitting(true)

    try {
      let thumbnailUrl = previewUrl
      if (file) {
        const url = await uploadImage()
        if (url) thumbnailUrl = url
      }

      const payload = {
        title: title.trim(),
        body: body.trim(),
        published_at: publishedAt || new Date().toISOString().slice(0, 10),
        thumbnail_url: thumbnailUrl || null,
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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Zen Old Mincho, serif' }}>
      {/* ヘッダー */}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>本文</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="記事本文を入力"
                rows={8}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.8' }}
              />
            </div>

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
                  <img src={previewUrl} alt="preview" style={{ width: '200px', aspectRatio: '4/3', objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>公開日</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                style={{ ...inputStyle, width: '200px' }}
              />
            </div>

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
              {/* テーブルヘッダー */}
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
                      style={{
                        padding: '6px 16px',
                        background: 'transparent',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        letterSpacing: '0.05em',
                      }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      style={{
                        padding: '6px 16px',
                        background: 'transparent',
                        border: '1px solid #c8392b',
                        color: '#c8392b',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        letterSpacing: '0.05em',
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
      </div>
    </div>
  )
}
