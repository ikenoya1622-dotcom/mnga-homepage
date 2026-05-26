import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }
    ).fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.5'
    )
    return () => tl.kill()
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        height: '92vh',
        minHeight: '620px',
        backgroundImage: 'url(/images/tokyo-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.40) 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 80px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            ref={titleRef}
            style={{
              color: '#fff',
              fontSize: 'clamp(48px, 7vw, 96px)',
              fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span>Make</span>
              <span
                aria-hidden
                style={{
                  width: 'clamp(22px, 2.6vw, 38px)',
                  height: 'clamp(22px, 2.6vw, 38px)',
                  borderRadius: '50%',
                  background: '#d63b2d',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
            </span>
            <span style={{ display: 'block' }}>Nippon</span>
            <span style={{ display: 'block' }}>Great Again</span>
          </h1>
          <p
            ref={subtitleRef}
            style={{
              color: '#f5f1e8',
              fontSize: 'clamp(13px, 1.2vw, 16px)',
              letterSpacing: '0.3em',
              marginTop: '40px',
              fontWeight: 400,
            }}
          >
            いなくてはならない日本へ
          </p>
        </div>
      </div>
    </section>
  )
}
