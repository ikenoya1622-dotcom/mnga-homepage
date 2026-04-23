export default function Message() {
  return (
    <section style={{padding: '80px 0', backgroundColor: '#f9fafb'}}>
      <div style={{maxWidth: '1100px', margin: '0 auto', padding: '0 24px'}}>
        <div className="message-inner">
          <div className="message-photo-wrap">
            <img
              src="/images/board/会長.jpg"
              alt="MNGA 会長 樋田謙吾"
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
              いなくてはならない日本を<br />作るために。
            </h2>
            <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '16px'}}>
              Make Nippon Great Again 会長<br />
              <span style={{fontWeight: 'bold', color: '#374151'}}>樋田謙吾</span>
            </p>
            <p style={{fontSize: '14px', color: '#4b5563', lineHeight: '1.8'}}>
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
