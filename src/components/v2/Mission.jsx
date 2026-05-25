import { Link } from 'react-router-dom'

const BRAND_RED = '#d63b2d'

export default function Mission() {
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
            Goal
          </h2>
          <p style={{ fontSize: '13px', color: '#1a1a1a', letterSpacing: '0.3em', marginTop: '4px' }}>
            目的
          </p>
        </div>

        {/* 2カラム */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
          className="goal-grid"
        >
          {/* 左: ダイアグラム */}
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              {/* 大手企業 */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    aspectRatio: '1 / 1',
                    background: '#f5f5f5',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    marginBottom: '12px',
                  }}
                >
                  🏢
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>大手企業</p>
                <p style={{ fontSize: '11px', color: '#666', marginTop: '4px', lineHeight: 1.5 }}>
                  技術ノウハウ<br />リソース活用
                </p>
              </div>

              {/* 中央矢印 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: BRAND_RED, fontSize: '20px' }}>⇄</span>
              </div>

              {/* MNGA */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    aspectRatio: '1 / 1',
                    background: BRAND_RED,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '24px',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                  }}
                >
                  MNGA
                </div>
                <p style={{ fontSize: '11px', color: '#666', marginTop: '4px', lineHeight: 1.5 }}>
                  ビジョンを共有し、<br />業界の枠を超えた<br />本質的な協業
                </p>
              </div>
            </div>

            {/* 中央矢印（縦） */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <span style={{ color: BRAND_RED, fontSize: '20px' }}>⇅</span>
            </div>

            {/* ベンチャー企業 */}
            <div style={{ textAlign: 'center', maxWidth: '180px', margin: '0 auto' }}>
              <div
                style={{
                  aspectRatio: '1 / 1',
                  background: '#f5f5f5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '12px',
                }}
              >
                🚀
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>ベンチャー企業</p>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '4px', lineHeight: 1.5 }}>
                新規事業創出<br />スピード感
              </p>
            </div>

            <p
              style={{
                textAlign: 'center',
                marginTop: '24px',
                fontSize: '12px',
                color: BRAND_RED,
                fontWeight: 700,
                letterSpacing: '0.15em',
              }}
            >
              ─ 経営者コミュニティの構築 ─
            </p>
          </div>

          {/* 右: 説明 + ボタン */}
          <div>
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.6,
                color: '#1a1a1a',
                marginBottom: '24px',
              }}
            >
              大手企業とベンチャー企業の<br />
              <span style={{ color: BRAND_RED }}>本質的な協業</span>を加速させる。
            </h3>
            <p style={{ fontSize: '14px', color: '#444', lineHeight: 2, marginBottom: '40px' }}>
              日本を強い国にするために、大企業とベンチャー企業が協業する経営者コミュニティを構築する。
              日本を動かしていくビジョンを共有し、業界の垣根を越えた革新的な協業を促進する。
            </p>
            <Link
              to="/about"
              style={{
                display: 'inline-block',
                padding: '14px 48px',
                fontSize: '13px',
                color: BRAND_RED,
                border: `1.5px solid ${BRAND_RED}`,
                borderRadius: '999px',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = BRAND_RED
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = BRAND_RED
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
