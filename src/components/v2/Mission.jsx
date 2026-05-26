import { Link } from 'react-router-dom'

const BRAND_RED = '#d63b2d'
const HEADING_NAVY = '#1a2438'
const HEADING_MUTED = '#5a6478'

export default function Mission() {
  return (
    <section style={{ padding: '160px 0', background: '#fff' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
        {/* セクションヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '88px' }}>
          <h2
            style={{
              fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
              fontSize: '36px',
              color: HEADING_NAVY,
              letterSpacing: '0.15em',
              margin: 0,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Goal
          </h2>
          <div style={{ width: '32px', height: '1px', background: BRAND_RED, margin: '22px auto' }} />
          <p
            style={{
              fontSize: '13px',
              color: HEADING_MUTED,
              letterSpacing: '0.4em',
              margin: 0,
              fontWeight: 500,
            }}
          >
            目的
          </p>
        </div>

        {/* 2カラム */}
        <div
          className="goal-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '64px',
            alignItems: 'center',
          }}
        >
          {/* 左: 図解画像 */}
          <div>
            <img
              src="/images/goal-diagram.png"
              alt="大手企業とベンチャー企業の本質的な協業を実現する MNGA の図解"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>

          {/* 右: 説明 + ボタン */}
          <div>
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 600,
                lineHeight: 1.8,
                color: HEADING_NAVY,
                marginTop: 0,
                marginBottom: '36px',
                letterSpacing: '0.04em',
              }}
            >
              大手企業とベンチャー企業の<br />
              <span style={{ fontWeight: 700 }}>本質的な協業</span>を加速させる
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#444c5e',
                lineHeight: 2.2,
                marginBottom: '48px',
                letterSpacing: '0.04em',
              }}
            >
              日本を強い国にするために、大企業とベンチャー企業が協業する経営者コミュニティを構築する。
              日本を動かしていくビジョンを共有し、業界の垣根を越えた革新的な協業を促進する。
            </p>
            <Link
              to="/about"
              style={{
                display: 'inline-block',
                padding: '14px 56px',
                fontSize: '12px',
                color: HEADING_NAVY,
                border: `1px solid ${HEADING_NAVY}`,
                borderRadius: '2px',
                textDecoration: 'none',
                letterSpacing: '0.2em',
                fontWeight: 500,
                transition: 'all 0.2s',
                background: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = HEADING_NAVY
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.color = HEADING_NAVY
              }}
            >
              MNGAについて
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .goal-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  )
}
