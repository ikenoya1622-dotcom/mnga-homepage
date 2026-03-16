import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function Header() {
  const headerRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-sm flex items-center justify-center" style={{background: '#c8392b'}}>
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-bold text-base md:text-lg tracking-wider">MNGA</span>
        </div>

        {/* PC nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {['Home', 'About', 'Report', 'Join', 'Contact'].map((item) => (
              <li key={item}>
                <a href={item === 'Report' ? '#report' : '#'} className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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
            {['Home', 'About', 'Report', 'Join', 'Contact'].map((item) => (
              <li key={item}>
                <a
                  href={item === 'Report' ? '#report' : '#'}
                  className="block px-6 py-4 text-sm text-gray-700 border-b border-gray-100 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
