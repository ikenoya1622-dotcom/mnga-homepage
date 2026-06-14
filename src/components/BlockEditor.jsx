import { useEffect, useRef, useState } from 'react'

export const BLOCK_TYPES = [
  { type: 'heading', label: '大見出し' },
  { type: 'subheading', label: '小見出し' },
  { type: 'text', label: '本文' },
  { type: 'image', label: '画像' },
]

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function initBlock(type) {
  return { id: makeId(), type, content: '', url: '', file: null, previewUrl: '' }
}

export function hydrateBlocks(blocks) {
  return (blocks || []).map((b) => ({
    id: makeId(),
    type: b.type || 'text',
    content: b.content || '',
    url: b.url || '',
    file: null,
    previewUrl: '',
  }))
}

export function validateImageFile(f) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(f.type)) {
    alert('JPEG・PNG・WebP・GIF のみアップロードできます')
    return false
  }
  if (f.size > 5 * 1024 * 1024) {
    alert('ファイルサイズは 5MB 以下にしてください')
    return false
  }
  return true
}

export function AutoResizeTextarea({ value, onChange, placeholder, style, className = '', maxLength }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`adm-autoresize${className ? ' ' + className : ''}`}
      style={{
        width: '100%',
        border: 'none',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}

function AddBlockButton({ onAdd }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="adm-be__add">
      <div className="adm-be__add-line">
        <i />
        <button type="button" className="adm-be__add-btn" onClick={() => setOpen((v) => !v)}>＋</button>
        <i />
      </div>

      {open && (
        <>
          <div className="adm-be__overlay" onClick={() => setOpen(false)} />
          <div className="adm-be__menu">
            {BLOCK_TYPES.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                className="adm-be__menu-btn"
                onClick={() => { onAdd(type); setOpen(false) }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BlockItem({ block, isFirst, isLast, onUpdate, onRemove, onMove, onFileChange }) {
  const fileInputRef = useRef(null)
  const blockMeta = BLOCK_TYPES.find((b) => b.type === block.type) || {}

  return (
    <div className="adm-be__block">
      <div className="adm-be__ctrl">
        <span className="adm-be__tag">{blockMeta.label || block.type}</span>
        <button type="button" className="adm-be__ctrl-btn" onClick={() => onMove(block.id, 'up')} disabled={isFirst}>↑</button>
        <button type="button" className="adm-be__ctrl-btn" onClick={() => onMove(block.id, 'down')} disabled={isLast}>↓</button>
        <button type="button" className="adm-be__ctrl-btn adm-be__ctrl-btn--danger" onClick={() => onRemove(block.id)}>削除</button>
      </div>

      <div>
        {block.type === 'heading' && (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="大見出しを入力"
            className="adm-be__heading"
          />
        )}
        {block.type === 'subheading' && (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="小見出しを入力"
            className="adm-be__subheading"
          />
        )}
        {block.type === 'text' && (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="本文を入力... (**テキスト** で太字)"
            className="adm-be__text"
          />
        )}
        {block.type === 'image' && (
          <div className="adm-be__img">
            {block.previewUrl || block.url ? (
              <div className="adm-be__imgwrap">
                <img src={block.previewUrl || block.url} alt="inserted" />
                <label className="adm-thumb__change">
                  変更
                  <input type="file" accept="image/*" onChange={(e) => onFileChange(block.id, e)} style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              <div className="adm-be__dropzone" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                ＋ 画像を追加
                <input
                  ref={fileInputRef} type="file" accept="image/*"
                  onChange={(e) => onFileChange(block.id, e)} style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BlockEditor({ blocks, onChange }) {
  function updateBlock(id, changes) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...changes } : b)))
  }

  function insertBlock(type, afterIndex) {
    const newBlock = initBlock(type)
    const next = [...blocks]
    next.splice(afterIndex + 1, 0, newBlock)
    onChange(next)
  }

  function removeBlock(id) {
    onChange(blocks.filter((b) => b.id !== id))
  }

  function moveBlock(id, dir) {
    const idx = blocks.findIndex((b) => b.id === id)
    if (idx === -1) return
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === blocks.length - 1) return
    const next = [...blocks]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    onChange(next)
  }

  function handleFileChange(id, e) {
    const f = e.target.files[0]
    if (!f) return
    if (!validateImageFile(f)) { e.target.value = ''; return }
    updateBlock(id, { file: f, previewUrl: URL.createObjectURL(f) })
  }

  return (
    <div>
      <AddBlockButton onAdd={(type) => insertBlock(type, -1)} />
      {blocks.map((block, i) => (
        <div key={block.id}>
          <BlockItem
            block={block}
            isFirst={i === 0}
            isLast={i === blocks.length - 1}
            onUpdate={updateBlock}
            onRemove={removeBlock}
            onMove={moveBlock}
            onFileChange={handleFileChange}
          />
          <AddBlockButton onAdd={(type) => insertBlock(type, i)} />
        </div>
      ))}
    </div>
  )
}
