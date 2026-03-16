import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Mission from './components/Mission'
import Message from './components/Message'
import Board from './components/Board'
import Partners from './components/Partners'
import Value from './components/Value'
import Join from './components/Join'
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

function App() {
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
        <Join />
      </main>
      <Footer />
    </div>
  )
}

export default App
