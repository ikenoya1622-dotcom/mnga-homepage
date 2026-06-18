export default function Footer() {
  return (
    <>
      {/* フッター本体 */}
      <footer style={{ background: '#fff', padding: '64px 0 40px' }}>
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
              paddingBottom: '40px',
            }}
          >
            {/* 左: ロゴ + 団体名 */}
            <div>
              <img
                src="/images/MNGA_ヨコ.png"
                alt="MNGA"
                style={{ height: '44px', width: 'auto', display: 'block', marginBottom: '16px' }}
              />
              <p style={{ fontSize: '12px', color: '#1a2438', fontWeight: 600, margin: 0, letterSpacing: '0.08em' }}>
                Make Nippon Great Again
              </p>
              <p style={{ fontSize: '11px', color: '#5a6478', marginTop: '6px', letterSpacing: '0.05em' }}>
                一般社団法人 日本新復活
              </p>
            </div>

            {/* 右: 住所 */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: '#5a6478', margin: 0, lineHeight: 2, letterSpacing: '0.05em' }}>
                xxx<br />
                xxx
              </p>
            </div>
          </div>

          {/* コピーライト */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '10px',
              color: '#9ca0ab',
              marginTop: '32px',
              paddingTop: '32px',
              borderTop: '1px solid #e8e8e8',
              letterSpacing: '0.15em',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
          >
            Copyright © Make Nippon Great Again. All rights reserved.
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
