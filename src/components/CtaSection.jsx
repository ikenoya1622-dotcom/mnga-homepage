import { Link } from 'react-router-dom'

export default function CtaSection() {
  return (
    <section
      className="py-20 px-6"
      style={{
        position: 'relative',
        backgroundImage: "url('/images/東京タワー背景.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 可読性確保のための暗幕オーバーレイ */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65))',
        }}
      />

      <div className="max-w-4xl mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
        <h2
          className="text-2xl font-bold mb-8"
          style={{ color: '#fff', letterSpacing: '0.1em', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        >
          入会のご案内
        </h2>
        <Link
          to="/join"
          className="inline-block text-sm px-10 py-3 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.92)',
            color: '#1a1a1a',
            letterSpacing: '0.05em',
            borderRadius: '2px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          入会申し込みページ
        </Link>
      </div>
    </section>
  )
}
