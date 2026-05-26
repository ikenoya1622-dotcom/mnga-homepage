import { Link } from 'react-router-dom'

const BRAND_RED = '#d63b2d'

export default function Mission() {
  return (
    <section style={{ padding: '120px 0 140px', background: '#fff' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
        {/* セクションヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <h2
            style={{
              fontFamily: "'Zen Old Mincho', serif",
              fontSize: '44px',
              color: BRAND_RED,
              letterSpacing: '0.1em',
              margin: 0,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Goal
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: '#1a1a1a',
              letterSpacing: '0.35em',
              marginTop: '12px',
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
            gridTemplateColumns: '1fr 1.5fr',
            gap: '64px',
            alignItems: 'center',
          }}
        >
          {/* 左: 説明 + ボタン */}
          <div>
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.7,
                color: BRAND_RED,
                marginBottom: '6px',
                letterSpacing: '0.03em',
              }}
            >
              大手企業とベンチャー企業の
            </h3>
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.7,
                color: BRAND_RED,
                marginTop: 0,
                marginBottom: '32px',
                letterSpacing: '0.03em',
              }}
            >
              本質的な協業を加速させる
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#444',
                lineHeight: 2.1,
                marginBottom: '40px',
                letterSpacing: '0.03em',
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
                fontSize: '13px',
                color: BRAND_RED,
                border: `1.5px solid ${BRAND_RED}`,
                borderRadius: '4px',
                textDecoration: 'none',
                letterSpacing: '0.15em',
                fontWeight: 500,
                transition: 'all 0.2s',
                background: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = BRAND_RED
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.color = BRAND_RED
              }}
            >
              MNGAについて
            </Link>
          </div>

          {/* 右: 図解画像 */}
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
