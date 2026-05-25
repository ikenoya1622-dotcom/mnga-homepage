const LOGOS = [
  { text: 'sansan', color: '#e60012', weight: 700, size: 22 },
  { text: 'LOTTE', color: '#c8102e', weight: 800, size: 22 },
  { text: 'glico', color: '#e60012', weight: 700, size: 22, italic: true },
  { text: 'meiji', color: '#c8102e', weight: 700, size: 22 },
  { text: 'sansan', color: '#e60012', weight: 700, size: 22 },
  { text: 'LOTTE', color: '#c8102e', weight: 800, size: 22 },
  { text: 'glico', color: '#e60012', weight: 700, size: 22, italic: true },
]

export default function About() {
  const items = [...LOGOS, ...LOGOS]

  return (
    <section
      style={{
        padding: '40px 0',
        background: '#fff',
        borderTop: '1px solid #f1f1f1',
        borderBottom: '1px solid #f1f1f1',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '80px',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          animation: 'v2-marquee 28s linear infinite',
          width: 'max-content',
        }}
      >
        {items.map((logo, i) => (
          <span
            key={i}
            style={{
              fontSize: `${logo.size}px`,
              fontWeight: logo.weight,
              color: logo.color,
              letterSpacing: '0.02em',
              fontStyle: logo.italic ? 'italic' : 'normal',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              flexShrink: 0,
            }}
          >
            {logo.text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes v2-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
