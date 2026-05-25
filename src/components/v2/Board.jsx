const BRAND_RED = '#d63b2d'

const members = [
  { role: '会長', name: '櫻田 謙悟', company: '株式会社○○', image: '/images/board/櫻田.jpg' },
  { role: '副会長', name: '山木 智史', company: '株式会社Re-grit Partners', image: '/images/board/副会長.jpg' },
  { role: '理事', name: 'XXX XXX', company: '株式会社○○', image: '/images/board/会長.jpg' },
  { role: '理事', name: 'XXX XXX', company: '株式会社○○', image: '/images/board/副会長.jpg' },
]

export default function Board() {
  return (
    <section style={{ padding: '120px 0', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* セクションヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <h2
            style={{
              fontFamily: "'Zen Old Mincho', serif",
              fontSize: '48px',
              color: BRAND_RED,
              letterSpacing: '0.1em',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Member
          </h2>
          <p style={{ fontSize: '13px', color: '#1a1a1a', letterSpacing: '0.3em', marginTop: '4px' }}>
            理事体制
          </p>
        </div>

        <div
          className="v2-member-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
          }}
        >
          {members.map((m, i) => (
            <div key={i} style={{ textAlign: 'left' }}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  background: '#e5e5e5',
                  overflow: 'hidden',
                  marginBottom: '16px',
                }}
              >
                {m.image && (
                  <img
                    src={m.image}
                    alt={m.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.15em', margin: 0 }}>
                {m.role}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', marginTop: '4px' }}>
                {m.name}
              </p>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{m.company}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .v2-member-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  )
}
