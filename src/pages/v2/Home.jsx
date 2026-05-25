import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../../components/v2/Header'
import Hero from '../../components/v2/Hero'
import Mission from '../../components/v2/Mission'
import Message from '../../components/v2/Message'
import Board from '../../components/v2/Board'
import CtaSection from '../../components/v2/CtaSection'
import Footer from '../../components/v2/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  useEffect(() => {
    const sections = gsap.utils.toArray('main > section')
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
        }
      )
    })
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <main>
        <Hero />
        <Mission />
        <Message />
        <Board />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
