const BRAND_RED = '#d63b2d'
const HEADING_NAVY = '#1a2438'
const HEADING_MUTED = '#5a6478'

// 個人名・人物写真はいったん削除（理事体制は順次発表）
const members = [
  { role: '理事', name: '準備中', company: '', image: null },
]

export default function Board() {
  return (
    <section style={{ padding: '160px 0', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* セクションヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '88px' }}>
          <h2
            style={{
              fontFamily: "'Zen Old Mincho', serif",
              fontSize: '36px',
              color: HEADING_NAVY,
              letterSpacing: '0.15em',
              margin: 0,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Member
          </h2>
          <div style={{ width: '32px', height: '1px', background: BRAND_RED, margin: '22px auto' }} />
          <p style={{ fontSize: '13px', color: HEADING_MUTED, letterSpacing: '0.4em', margin: 0, fontWeight: 500 }}>
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
              <p style={{ fontSize: '11px', color: HEADING_MUTED, letterSpacing: '0.2em', margin: 0 }}>
                {m.role}
              </p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: HEADING_NAVY, marginTop: '6px', letterSpacing: '0.05em' }}>
                {m.name}
              </p>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{m.company}</p>
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
