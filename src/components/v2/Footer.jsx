export default function Footer() {
  return (
    <>
      {/* 都市背景バナー */}
      <div
        style={{
          width: '100%',
          height: '280px',
          backgroundImage: "url('/images/tokyo-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden
      />

      {/* フッター本体 */}
      <footer style={{ background: '#fff', padding: '48px 0 32px' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 40px',
          }}
        >
          <div
            className="v2-footer-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '40px',
              paddingBottom: '32px',
            }}
          >
            {/* 左: ロゴ + 団体名 */}
            <div>
              <img
                src="/images/MNGA_ヨコ.png"
                alt="MNGA"
                style={{ height: '48px', width: 'auto', display: 'block', marginBottom: '12px' }}
              />
              <p style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 700, margin: 0 }}>
                Make Nippon Great Again
              </p>
              <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                一般社団法人 日本新復活
              </p>
            </div>

            {/* 右: 住所 */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.8 }}>
                東京都港区赤坂1丁目8番1号<br />
                赤坂インターシティAIR 4階
              </p>
            </div>
          </div>

          {/* コピーライト */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#999',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #eee',
              letterSpacing: '0.05em',
            }}
          >
            Copyright(C) Make Nippon Great Again. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .v2-footer-row {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .v2-footer-row > div:last-child {
            text-align: left !important;
          }
        }
      `}</style>
    </>
  )
}
