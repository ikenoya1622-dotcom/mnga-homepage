import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import CtaSection from './components/CtaSection'
import Footer from './components/Footer'
import Report from './pages/Report'
import AboutPage from './pages/About'
import JoinPage from './pages/Join'
import Admin from './pages/Admin'

gsap.registerPlugin(ScrollTrigger)

function Home() {
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/report" element={<Report />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App
