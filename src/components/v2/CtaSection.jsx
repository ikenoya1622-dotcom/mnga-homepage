import { Link } from 'react-router-dom'

const BRAND_RED = '#d63b2d'

export default function CtaSection() {
  return (
    <section
      style={{
        position: 'relative',
        background: '#1a1a1a',
        padding: '72px 0',
        overflow: 'hidden',
      }}
    >
      {/* 装飾的なメールアイコン（背景） */}
      <svg
        aria-hidden
        viewBox="0 0 200 140"
        style={{
          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '320px',
          height: 'auto',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      >
        <rect x="10" y="20" width="180" height="100" rx="6" fill="none" stroke="#fff" strokeWidth="2" />
        <path d="M 10 30 L 100 80 L 190 30" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px',
          position: 'relative',
          zIndex: 1,
        }}
        className="v2-cta-row"
      >
        <div>
          <h2
            style={{
              fontFamily: "'Zen Old Mincho', serif",
              fontSize: '32px',
              color: BRAND_RED,
              letterSpacing: '0.1em',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Membership
          </h2>
          <p style={{ fontSize: '24px', color: '#fff', marginTop: '12px', letterSpacing: '0.1em' }}>
            入会はこちらから
          </p>
        </div>

        <Link
          to="/join"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '1.5px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '20px',
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = BRAND_RED
            e.currentTarget.style.borderColor = BRAND_RED
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = '#fff'
          }}
          aria-label="入会申し込み"
        >
          →
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .v2-cta-row {
            flex-direction: column !important;
            text-align: center;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  )
}
