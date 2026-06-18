const BRAND_RED = '#d63b2d'
const HEADING_NAVY = '#1a2438'
const HEADING_MUTED = '#5a6478'

export default function Message() {
  return (
    <section style={{ padding: '160px 0', background: '#f5f5f5' }}>
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
            Message
          </h2>
          <div style={{ width: '32px', height: '1px', background: BRAND_RED, margin: '22px auto' }} />
          <p style={{ fontSize: '13px', color: HEADING_MUTED, letterSpacing: '0.4em', margin: 0, fontWeight: 500 }}>
            代表メッセージ
          </p>
        </div>

        <div
          className="v2-message-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* 左: 写真（個人写真はいったん削除） */}
          <div />

          {/* 右: 本文 */}
          <div>
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 600,
                lineHeight: 1.7,
                marginBottom: '40px',
                color: HEADING_NAVY,
                letterSpacing: '0.04em',
              }}
            >
              失ったのは、われわれだ。<br />接続を、取り戻す。
            </h3>
            <div style={{ fontSize: '14px', color: '#444', lineHeight: 2 }}>
              <p style={{ marginBottom: '14px' }}>
                この30年を「失われた30年」とは呼ばない。<br />
                失われたのではない。われわれが、失ったのだ。
              </p>
              <p style={{ marginBottom: '14px' }}>
                提言も、会議も、報告書もあった。<br />
                だが、構想を実装と結果に「接続」できなかった。<br />
                それは、経営者であるわれわれが招いた結果である。
              </p>
              <p style={{ marginBottom: '14px' }}>
                必要なのは、PoCで終わらせず事業化まで前進させる「実装基盤」だ。<br />
                大企業の意思決定力と、ベンチャーの検証速度を、<br />
                継続的な回路として接続する。それが MNGA の役割である。
              </p>
              <p style={{ marginBottom: '24px' }}>
                30年を失ったわれわれが、次の30年を取り戻す。<br />
                語ることではなく、事業を通じて結果を残す。<br />
                志を共にする経営者と、ここで会いたい。
              </p>
              <p style={{ fontWeight: 700, color: HEADING_NAVY, fontSize: '17px', letterSpacing: '0.1em' }}>
                言行一致。
              </p>
            </div>
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #d1d5db' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                Make Nippon Great Again　理事長
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .v2-message-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  )
}
