import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Header() {
  const headerRef = useRef(null)

  useEffect(() => {
    const anim = gsap.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
    return () => anim.kill()
  }, [])

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="h-20 flex items-center justify-between" style={{padding: '0 60px'}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{background: '#c8392b'}}>
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-bold text-lg tracking-wider">MNGA</span>
        </div>
        <nav>
          <ul className="flex items-center gap-8">
            {['Home', 'About', 'Join', 'Contact'].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
