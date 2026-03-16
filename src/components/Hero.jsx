import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.55'
    )
    .fromTo(btnRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.55'
    )
    return () => tl.kill()
  }, [])

  return (
    <section
      className="pt-16 flex items-center justify-center relative"
      style={{
        height: '500px',
        paddingLeft: '80px',
        paddingRight: '80px',
        backgroundImage: 'url(/images/tokyo-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* オーバーレイ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
      }} />

      <div className="text-center relative z-10">
        <h1 ref={titleRef} className="text-3xl font-bold mb-3" style={{color: '#ffffff'}}>
          いなくてはならない日本へ
        </h1>
        <p ref={subtitleRef} className="text-lg mb-10" style={{color: '#ffffff'}}>
          -Make Nippon Great Again-
        </p>
        <button
          ref={btnRef}
          className="px-12 py-3 text-sm transition-colors"
          style={{
            color: '#ffffff',
            border: '1px solid #ffffff',
            background: 'transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          詳しく見る
        </button>
      </div>
    </section>
  )
}
