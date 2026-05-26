const BRAND_RED = '#d63b2d'

const COMPANIES = new Array(10).fill(null)

export default function Partners() {
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
            Participants
          </h2>
          <p style={{ fontSize: '13px', color: '#1a1a1a', letterSpacing: '0.3em', marginTop: '4px' }}>
            参加企業
          </p>
        </div>

        <div
          className="v2-participants-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '20px',
          }}
        >
          {COMPANIES.map((_, i) => (
            <div
              key={i}
              style={{
                height: '90px',
                background: '#e5e5e5',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .v2-participants-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .v2-participants-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </section>
  )
}
