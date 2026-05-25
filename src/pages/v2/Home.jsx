import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../../components/v2/Header'
import Hero from '../../components/v2/Hero'
import About from '../../components/v2/About'
import Mission from '../../components/v2/Mission'
import Message from '../../components/v2/Message'
import Board from '../../components/v2/Board'
import Partners from '../../components/v2/Partners'
import Value from '../../components/v2/Value'
import CtaSection from '../../components/v2/CtaSection'
import Footer from '../../components/v2/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  useEffect(() => {
    const sections = gsap.utils.toArray('main > section')
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
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
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Mission />
        <Message />
        <Board />
        <Partners />
        <Value />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
