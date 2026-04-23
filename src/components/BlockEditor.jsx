import { useEffect, useRef, useState } from 'react'

export const BLOCK_TYPES = [
  { type: 'heading', label: '大見出し', color: '#7c3aed' },
  { type: 'subheading', label: '小見出し', color: '#2563eb' },
  { type: 'text', label: '本文', color: '#374151' },
  { type: 'image', label: '画像', color: '#d97706' },
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

export function AutoResizeTextarea({ value, onChange, placeholder, style, maxLength }) {
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
      style={{
        width: '100%',
        border: 'none',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        fontFamily: 'Zen Old Mincho, serif',
        boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}

function AddBlockButton({ onAdd }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', margin: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '24px', height: '24px', borderRadius: '50%',
            border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer',
            fontSize: '16px', color: '#9ca3af',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, padding: 0, fontFamily: 'Zen Old Mincho, serif',
          }}
        >
          ＋
        </button>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
      </div>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: '30px', background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 201, display: 'flex', gap: '8px', padding: '10px 14px', whiteSpace: 'nowrap',
          }}>
            {BLOCK_TYPES.map(({ type, label, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => { onAdd(type); setOpen(false) }}
                style={{
                  padding: '6px 14px', fontSize: '13px',
                  fontFamily: 'Zen Old Mincho, serif',
                  background: 'transparent', border: `1px solid ${color}`, color,
                  borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.04em',
                }}
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
  const [hovered, setHovered] = useState(false)
  const fileInputRef = useRef(null)
  const blockMeta = BLOCK_TYPES.find((b) => b.type === block.type) || {}

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', marginBottom: '4px' }}
    >
      <div style={{
        opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', height: '28px',
      }}>
        <span style={{
          fontSize: '11px', fontWeight: '700', color: blockMeta.color || '#555',
          letterSpacing: '0.04em', padding: '2px 8px',
          border: `1px solid ${blockMeta.color || '#ccc'}`, borderRadius: '3px',
        }}>
          {blockMeta.label || block.type}
        </span>
        <button
          type="button" onClick={() => onMove(block.id, 'up')} disabled={isFirst}
          style={{
            padding: '2px 8px', fontSize: '12px', background: 'transparent',
            border: '1px solid #d1d5db', borderRadius: '3px',
            cursor: isFirst ? 'default' : 'pointer',
            color: isFirst ? '#d1d5db' : '#374151',
            fontFamily: 'Zen Old Mincho, serif',
          }}
        >
          ↑
        </button>
        <button
          type="button" onClick={() => onMove(block.id, 'down')} disabled={isLast}
          style={{
            padding: '2px 8px', fontSize: '12px', background: 'transparent',
            border: '1px solid #d1d5db', borderRadius: '3px',
            cursor: isLast ? 'default' : 'pointer',
            color: isLast ? '#d1d5db' : '#374151',
            fontFamily: 'Zen Old Mincho, serif',
          }}
        >
          ↓
        </button>
        <button
          type="button" onClick={() => onRemove(block.id)}
          style={{
            padding: '2px 8px', fontSize: '12px', background: 'transparent',
            border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '3px',
            cursor: 'pointer', fontFamily: 'Zen Old Mincho, serif',
          }}
        >
          削除
        </button>
      </div>

      <div>
        {block.type === 'heading' && (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="大見出しを入力"
            style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '0.05em', lineHeight: '1.4', padding: '4px 0', background: 'transparent' }}
          />
        )}
        {block.type === 'subheading' && (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="小見出しを入力"
            style={{ fontSize: '20px', fontWeight: '700', color: '#444', letterSpacing: '0.05em', lineHeight: '1.5', padding: '4px 0', background: 'transparent' }}
          />
        )}
        {block.type === 'text' && (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="本文を入力... (**テキスト** で太字)"
            style={{ fontSize: '18px', lineHeight: '2', letterSpacing: '0.04em', background: 'transparent', padding: '4px 0' }}
          />
        )}
        {block.type === 'image' && (
          <div style={{ marginBottom: '8px' }}>
            {block.previewUrl || block.url ? (
              <div style={{ position: 'relative' }}>
                <img src={block.previewUrl || block.url} alt="inserted" style={{ width: '100%', display: 'block', borderRadius: '4px' }} />
                <label style={{
                  position: 'absolute', bottom: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.55)', color: '#fff',
                  padding: '4px 12px', fontSize: '12px', borderRadius: '3px',
                  cursor: 'pointer', fontFamily: 'Zen Old Mincho, serif',
                }}>
                  変更
                  <input type="file" accept="image/*" onChange={(e) => onFileChange(block.id, e)} style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  width: '100%', aspectRatio: '16 / 9', border: '2px dashed #d1d5db',
                  borderRadius: '6px', background: '#f9fafb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#9ca3af', fontSize: '15px',
                  fontFamily: 'Zen Old Mincho, serif',
                }}
              >
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
