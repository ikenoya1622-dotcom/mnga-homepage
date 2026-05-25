export default function Message() {
  return (
    <section style={{padding: '80px 0', backgroundColor: '#f9fafb'}}>
      <div style={{maxWidth: '1100px', margin: '0 auto', padding: '0 24px'}}>
        <div className="message-inner">
          <div className="message-photo-wrap">
            <img
              src="/images/board/櫻田.jpg"
              alt="MNGA 理事長 櫻田謙悟"
              style={{
                maxWidth: '300px',
                width: '100%',
                aspectRatio: '3/4',
                objectFit: 'cover',
                marginLeft: '15%',
              }}
            />
          </div>
          <div>
            <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '12px'}}>2. 代表メッセージ</p>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', lineHeight: '1.5', marginBottom: '16px'}}>
              失ったのは、われわれだ。<br />接続を、取り戻す。
            </h2>
            <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '16px'}}>
              Make Nippon Great Again 理事長<br />
              <span style={{fontWeight: 'bold', color: '#374151'}}>櫻田 謙悟</span>
            </p>
            <div style={{fontSize: '14px', color: '#4b5563', lineHeight: '1.9'}}>
              <p style={{marginBottom: '14px'}}>
                この30年を「失われた30年」とは呼ばない。<br />
                失われたのではない。われわれが、失ったのだ。
              </p>
              <p style={{marginBottom: '14px'}}>
                提言も、会議も、報告書もあった。<br />
                だが、構想を実装と結果に「接続」できなかった。<br />
                それは、経営者であるわれわれが招いた結果である。
              </p>
              <p style={{marginBottom: '14px'}}>
                必要なのは、PoCで終わらせず事業化まで前進させる「実装基盤」だ。<br />
                大企業の意思決定力と、ベンチャーの検証速度を、<br />
                継続的な回路として接続する。それが MNGA の役割である。
              </p>
              <p style={{marginBottom: '14px'}}>
                30年を失ったわれわれが、次の30年を取り戻す。<br />
                語ることではなく、事業を通じて結果を残す。<br />
                志を共にする経営者と、ここで会いたい。
              </p>
              <p style={{fontWeight: 'bold', color: '#111827', marginTop: '20px', fontSize: '15px'}}>
                言行一致。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
