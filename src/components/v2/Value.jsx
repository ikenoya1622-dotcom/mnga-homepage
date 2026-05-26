const BRAND_RED = '#d63b2d'

const values = [
  { title: '対等な関係', desc: '大企業にベンチャーがぶら下がるのではなく、相互に学び合う。', icon: '🤝' },
  { title: '会員の質', desc: '会員数ではなく、参加者の質と関係性の深さを重視', icon: '✦' },
  { title: '本質的な協業', desc: '単なるネットワーキングではなく、具体的な協業プロジェクトの創出', icon: '⚙' },
  { title: '経営スキル', desc: '経営者からの相談、ナレッジの共有による経営スキルの育成', icon: '◇' },
  { title: '将来志向', desc: '過去の復活ではなく、世界の役に立つ日本の実現', icon: '↗' },
]

export default function Value() {
  const radius = 130
  const cx = 180
  const cy = 180
  const step = (2 * Math.PI) / values.length
  const offset = -Math.PI / 2

  return (
    <section style={{ padding: '120px 0', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* セクションヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <h2
            style={{
              fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
              fontSize: '48px',
              color: BRAND_RED,
              letterSpacing: '0.1em',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Our Value
          </h2>
          <p style={{ fontSize: '13px', color: '#1a1a1a', letterSpacing: '0.3em', marginTop: '4px' }}>
            提供価値
          </p>
        </div>

        <div
          className="v2-value-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* 左: 円形ダイアグラム */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg
              viewBox="0 0 360 360"
              style={{ width: '100%', maxWidth: '360px', height: 'auto' }}
            >
              {/* 中心円（MNGA） */}
              <circle cx={cx} cy={cy} r="42" fill={BRAND_RED} />
              <text
                x={cx}
                y={cy + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="15"
                fontWeight="700"
                letterSpacing="1"
              >
                MNGA
              </text>

              {/* 5つの周辺ノード */}
              {values.map((v, i) => {
                const angle = offset + step * i
                const x = cx + radius * Math.cos(angle)
                const y = cy + radius * Math.sin(angle)
                return (
                  <g key={v.title}>
                    {/* 接続線 */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke={BRAND_RED}
                      strokeWidth="1"
                      opacity="0.4"
                    />
                    {/* 周辺円 */}
                    <circle cx={x} cy={y} r="34" fill="#fff" stroke={BRAND_RED} strokeWidth="1.5" />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="#1a1a1a"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {v.title.length > 5 ? v.title.slice(0, 4) : v.title}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* 右: リスト */}
          <div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {values.map((v) => (
                <li
                  key={v.title}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    gap: '20px',
                    padding: '16px 0',
                    borderBottom: '1px solid #e5e5e5',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: BRAND_RED,
                      letterSpacing: '0.05em',
                    }}
                  >
                    ● {v.title}
                  </span>
                  <span style={{ fontSize: '13px', color: '#444', lineHeight: 1.8 }}>{v.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .v2-value-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  )
}
