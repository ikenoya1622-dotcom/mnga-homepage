import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Home from './pages/mnga/Home'
import About from './pages/mnga/About'
import Activities from './pages/mnga/Activities'
import Reports from './pages/mnga/Reports'
import ReportDetail from './pages/mnga/ReportDetail'
import News from './pages/mnga/News'
import NewsDetail from './pages/mnga/NewsDetail'
import NotFound from './pages/mnga/NotFound'
import Admin from './pages/Admin'
import AdminNews from './pages/AdminNews'
import AdminLogin from './pages/AdminLogin'
import PrivateRoute from './components/PrivateRoute'
import './styles/mnga/mobile-nav.css'
import './styles/mnga/overrides.css' // 再生成で消えない手動オーバーライド（フッター等の曇り解消）。ページCSSの後に読み込む

gsap.registerPlugin(ScrollTrigger)

// On navigation: jump to top for new pages, or scroll to the hash target.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const tryScroll = (attempt = 0) => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
        else if (attempt < 10) setTimeout(() => tryScroll(attempt + 1), 80)
      }
      tryScroll()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/report" element={<Reports />} />
        <Route path="/report/:id" element={<ReportDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/mnga-console-7kx9a/login" element={<AdminLogin />} />
        <Route path="/mnga-console-7kx9a" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/mnga-console-7kx9a/news" element={<PrivateRoute><AdminNews /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
