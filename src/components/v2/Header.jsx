import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useDesignVersion } from '../../context/ThemeContext'

const NAV_ITEMS = [
  { label: 'トップ', href: '/' },
  { label: 'MNGAについて', href: '/about' },
  { label: '活動内容', href: '/report' },
  { label: '入会案内', href: '/join' },
]

export default function Header() {
  const headerRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { version, toggleVersion } = useDesignVersion()

  useEffect(() => {
    const anim = gsap.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
    return () => anim.kill()
  }, [])

  return (
    <header
      ref={headerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 40px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/MNGA_ヨコ.png"
            alt="MNGA"
            style={{ height: '40px', width: 'auto' }}
          />
        </a>

        {/* PC nav */}
        <nav className="hidden md:block">
          <ul style={{ display: 'flex', alignItems: 'center', gap: '40px', margin: 0, padding: 0, listStyle: 'none' }}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  style={{
                    fontSize: '14px',
                    color: '#1a1a1a',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#d63b2d')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#1a1a1a')}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* デザイン切替ボタン */}
        <button
          onClick={toggleVersion}
          className="hidden md:flex"
          style={{
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            marginLeft: '24px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          title={`現在: ${version}  クリックで${version === 'v1' ? 'v2(新)' : 'v1(現行)'}に切替`}
        >
          <span style={{ fontFamily: 'monospace', color: '#9ca3af' }}>{version === 'v1' ? 'v2' : 'v1'}</span>
          <span style={{ color: '#9ca3af' }}>↔</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#d63b2d' }}>{version}</span>
        </button>

        {/* ハンバーガー */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#111', transform: menuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none', transition: 'transform 0.2s' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#111', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#111', transform: menuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <nav className="md:hidden" style={{ background: '#fff', borderTop: '1px solid #f3f4f6' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', margin: 0, padding: 0, listStyle: 'none' }}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    borderBottom: '1px solid #f3f4f6',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => { toggleVersion(); setMenuOpen(false) }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 24px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  borderBottom: '1px solid #f3f4f6',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#d63b2d' }}>{version}</span>
                <span style={{ color: '#9ca3af' }}>→</span>
                <span style={{ fontFamily: 'monospace' }}>{version === 'v1' ? 'v2' : 'v1'}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>に切替</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
