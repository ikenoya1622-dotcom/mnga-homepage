import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useDesignVersion } from '../../context/ThemeContext'

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
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="h-16 md:h-20 flex items-center justify-between px-5 md:px-[60px]">
        <a href="/" className="flex items-center">
          <img
            src="/images/MNGA_ヨコ.png"
            alt="MNGA"
            className="h-10 md:h-12 w-auto"
          />
        </a>

        {/* PC nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'Report', href: '/report' },
              { label: 'Join', href: '/join' },
              { label: 'Contact', href: '#' },
            ].map((item) => (
              <li key={item.label}>
                <a href={item.href} className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* デザイン切替ボタン（v1↔v2） */}
        <button
          onClick={toggleVersion}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 ml-4 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          aria-label="デザイン切替"
          title={`現在: ${version}  クリックで${version === 'v1' ? 'v2(新)' : 'v1(現行)'}に切替`}
        >
          <span className="font-mono text-gray-400">{version === 'v1' ? 'v2' : 'v1'}</span>
          <span className="text-gray-400">↔</span>
          <span className="font-mono font-bold" style={{ color: '#c8392b' }}>{version}</span>
        </button>

        {/* ハンバーガーボタン */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100">
          <ul className="flex flex-col">
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'Report', href: '/report' },
              { label: 'Join', href: '/join' },
              { label: 'Contact', href: '#' },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="block px-6 py-4 text-sm text-gray-700 border-b border-gray-100 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => { toggleVersion(); setMenuOpen(false) }}
                className="w-full text-left px-6 py-4 text-sm text-gray-700 border-b border-gray-100 hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="font-mono font-bold" style={{ color: '#c8392b' }}>{version}</span>
                <span className="text-gray-400">→</span>
                <span className="font-mono">{version === 'v1' ? 'v2' : 'v1'}</span>
                <span className="text-xs text-gray-500 ml-2">に切替</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
