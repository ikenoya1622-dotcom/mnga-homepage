import { Link } from 'react-router-dom'

const BRAND_RED = '#d63b2d'
const SUBTLE_GRAY = '#9ca3af'

/* ------------ Icons ------------ */

function PeopleIcon() {
  // 大手企業: 4人並び + 後ろにビル群
  return (
    <svg viewBox="0 0 140 90" style={{ width: '100%', maxWidth: '140px', height: 'auto' }}>
      {/* Buildings background */}
      <g fill="#cbd5e1" opacity="0.8">
        <rect x="6" y="20" width="22" height="55" />
        <rect x="32" y="10" width="26" height="65" />
        <rect x="62" y="18" width="22" height="57" />
        <rect x="88" y="8" width="26" height="67" />
        <rect x="118" y="22" width="18" height="53" />
      </g>
      {/* Building windows */}
      <g fill="#fff" opacity="0.6">
        {[26, 38, 50].map((y) => (
          <g key={y}>
            <rect x="10" y={y} width="3" height="3" />
            <rect x="16" y={y} width="3" height="3" />
            <rect x="22" y={y} width="3" height="3" />
            <rect x="36" y={y} width="3" height="3" />
            <rect x="42" y={y} width="3" height="3" />
            <rect x="48" y={y} width="3" height="3" />
            <rect x="66" y={y} width="3" height="3" />
            <rect x="72" y={y} width="3" height="3" />
            <rect x="78" y={y} width="3" height="3" />
            <rect x="92" y={y} width="3" height="3" />
            <rect x="98" y={y} width="3" height="3" />
            <rect x="104" y={y} width="3" height="3" />
          </g>
        ))}
      </g>
      {/* People silhouettes */}
      <g fill="#374151">
        {[22, 50, 78, 106].map((x) => (
          <g key={x}>
            <circle cx={x} cy="55" r="5" />
            <path d={`M ${x - 7} 78 Q ${x - 7} 62 ${x} 62 Q ${x + 7} 62 ${x + 7} 78 Z`} />
          </g>
        ))}
      </g>
    </svg>
  )
}

function StartupIcon() {
  // ベンチャー企業: ビル数棟 + 上に伸びる矢印
  return (
    <svg viewBox="0 0 140 90" style={{ width: '100%', maxWidth: '140px', height: 'auto' }}>
      {/* Small buildings */}
      <g fill="#374151">
        <rect x="20" y="40" width="22" height="38" />
        <rect x="48" y="28" width="22" height="50" />
        <rect x="76" y="36" width="22" height="42" />
        <rect x="104" y="48" width="16" height="30" />
      </g>
      {/* Windows */}
      <g fill="#fff">
        <rect x="24" y="46" width="3" height="3" />
        <rect x="30" y="46" width="3" height="3" />
        <rect x="36" y="46" width="3" height="3" />
        <rect x="24" y="54" width="3" height="3" />
        <rect x="30" y="54" width="3" height="3" />
        <rect x="36" y="54" width="3" height="3" />
        <rect x="24" y="62" width="3" height="3" />
        <rect x="30" y="62" width="3" height="3" />
        <rect x="36" y="62" width="3" height="3" />

        <rect x="52" y="34" width="3" height="3" />
        <rect x="58" y="34" width="3" height="3" />
        <rect x="64" y="34" width="3" height="3" />
        <rect x="52" y="42" width="3" height="3" />
        <rect x="58" y="42" width="3" height="3" />
        <rect x="64" y="42" width="3" height="3" />
        <rect x="52" y="50" width="3" height="3" />
        <rect x="58" y="50" width="3" height="3" />
        <rect x="64" y="50" width="3" height="3" />
        <rect x="52" y="58" width="3" height="3" />
        <rect x="58" y="58" width="3" height="3" />
        <rect x="64" y="58" width="3" height="3" />

        <rect x="80" y="42" width="3" height="3" />
        <rect x="86" y="42" width="3" height="3" />
        <rect x="92" y="42" width="3" height="3" />
        <rect x="80" y="50" width="3" height="3" />
        <rect x="86" y="50" width="3" height="3" />
        <rect x="92" y="50" width="3" height="3" />
        <rect x="80" y="58" width="3" height="3" />
        <rect x="86" y="58" width="3" height="3" />
        <rect x="92" y="58" width="3" height="3" />
      </g>
      {/* Arrow up */}
      <g stroke={BRAND_RED} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="60" y1="22" x2="60" y2="6" />
        <polyline points="53,12 60,5 67,12" />
      </g>
    </svg>
  )
}

function MNGAIcon() {
  return (
    <svg viewBox="0 0 80 80" style={{ width: '60px', height: '60px' }}>
      <circle cx="40" cy="40" r="36" fill={BRAND_RED} />
      <text
        x="40"
        y="46"
        textAnchor="middle"
        fill="#fff"
        fontSize="16"
        fontWeight="700"
        fontFamily="'Helvetica Neue', sans-serif"
        letterSpacing="0.5"
      >
        MNGA
      </text>
    </svg>
  )
}

/* ------------ Diagram boxes ------------ */

function TopLabel({ children }) {
  return (
    <div
      style={{
        border: `1px solid ${BRAND_RED}`,
        borderRadius: '4px',
        padding: '8px 4px',
        textAlign: 'center',
        fontSize: '11px',
        color: BRAND_RED,
        lineHeight: 1.4,
        letterSpacing: '0.05em',
        background: '#fff',
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  )
}

function CompanyBox({ label, icon }) {
  return (
    <div
      style={{
        border: `1px solid #d1d5db`,
        borderRadius: '4px',
        padding: '20px 12px 16px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        minHeight: '160px',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '0.08em',
          margin: 0,
          textAlign: 'center',
        }}
      >
        {label}
      </p>
    </div>
  )
}

function MNGABox() {
  return (
    <div
      style={{
        border: `2px solid ${BRAND_RED}`,
        borderRadius: '4px',
        padding: '20px 12px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        minHeight: '160px',
      }}
    >
      <MNGAIcon />
      <p
        style={{
          fontSize: '11px',
          color: '#1a1a1a',
          textAlign: 'center',
          lineHeight: 1.7,
          margin: 0,
          letterSpacing: '0.03em',
          fontWeight: 500,
        }}
      >
        ビジョンを共有し、<br />
        業界の枠を超えた<br />
        <span style={{ color: BRAND_RED, fontWeight: 700 }}>本質的な協業</span>
      </p>
    </div>
  )
}

/* ------------ Main ------------ */

export default function Mission() {
  return (
    <section style={{ padding: '120px 0 140px', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
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
            gridTemplateColumns: '1.05fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* 左: ダイアグラム */}
          <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
            {/* Top labels row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              <TopLabel>
                技術ノウハウ<br />リソース活用
              </TopLabel>
              <div />
              <TopLabel>
                新規事業創出<br />スピード感
              </TopLabel>
            </div>

            {/* Main 3 columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                position: 'relative',
              }}
            >
              <CompanyBox label="大手企業" icon={<PeopleIcon />} />
              <MNGABox />
              <CompanyBox label="ベンチャー企業" icon={<StartupIcon />} />
            </div>

            {/* Bottom bracket */}
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '14px',
                  borderLeft: `2px solid ${BRAND_RED}`,
                  borderTop: `2px solid ${BRAND_RED}`,
                  borderBottom: `2px solid ${BRAND_RED}`,
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1a1a1a',
                  letterSpacing: '0.12em',
                }}
              >
                経営者コミュニティの構築
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '14px',
                  borderRight: `2px solid ${BRAND_RED}`,
                  borderTop: `2px solid ${BRAND_RED}`,
                  borderBottom: `2px solid ${BRAND_RED}`,
                }}
              />
            </div>
          </div>

          {/* 右: 説明 + ボタン */}
          <div>
            <h3
              style={{
                fontSize: '20px',
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
                fontSize: '20px',
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
                fontSize: '13px',
                color: '#444',
                lineHeight: 2.1,
                marginBottom: '40px',
                letterSpacing: '0.03em',
              }}
            >
              日本を強い国にするために、大企業とベンチャー企業が協業する経営者コミュニティを構築する。
              日本を動かしていくビジョンを共有し、業界の垣根を越えた革新的な協業を促進する。
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link
                to="/about"
                style={{
                  display: 'inline-block',
                  padding: '14px 64px',
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
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .goal-grid {
            grid-template-columns: 1fr !important;
            gap: 56px !important;
          }
        }
      `}</style>
    </section>
  )
}
