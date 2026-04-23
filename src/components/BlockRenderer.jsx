const ALLOWED_IMAGE_DOMAINS = [
  'dqbbcnlsjqxeowfsmjwl.supabase.co',
]

export function isSafeImageUrl(url) {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return ALLOWED_IMAGE_DOMAINS.includes(hostname)
  } catch {
    return false
  }
}

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

export function BodyText({ text }) {
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

export function ContentBlock({ block }) {
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

export function ContentBlocksView({ blocks }) {
  if (!blocks || blocks.length === 0) return null
  return (
    <>
      {blocks.map((block, i) => (
        <ContentBlock key={block.id || i} block={block} />
      ))}
    </>
  )
}
