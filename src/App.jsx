import { Routes, Route } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useDesignVersion } from './context/ThemeContext'
import HomeV1 from './pages/Home'
import HomeV2 from './pages/v2/Home'
import AboutPageV1 from './pages/About'
import AboutPageV2 from './pages/v2/About'
import ContactV2 from './pages/v2/Contact'
import MembershipV2 from './pages/v2/Membership'
import Report from './pages/Report'
import JoinPage from './pages/Join'
import Admin from './pages/Admin'
import AdminNews from './pages/AdminNews'
import AdminLogin from './pages/AdminLogin'
import ReportDetail from './pages/ReportDetail'
import NewsDetail from './pages/NewsDetail'
import PrivateRoute from './components/PrivateRoute'

gsap.registerPlugin(ScrollTrigger)

function VersionedHome() {
  const { version } = useDesignVersion()
  return version === 'v2' ? <HomeV2 /> : <HomeV1 />
}

function VersionedAbout() {
  const { version } = useDesignVersion()
  return version === 'v2' ? <AboutPageV2 /> : <AboutPageV1 />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<VersionedHome />} />
      <Route path="/about" element={<VersionedAbout />} />
      <Route path="/contact" element={<ContactV2 />} />
      <Route path="/membership" element={<MembershipV2 />} />
      <Route path="/report" element={<Report />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/report/:id" element={<ReportDetail />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/mnga-console-7kx9a/login" element={<AdminLogin />} />
      <Route path="/mnga-console-7kx9a" element={<PrivateRoute><Admin /></PrivateRoute>} />
      <Route path="/mnga-console-7kx9a/news" element={<PrivateRoute><AdminNews /></PrivateRoute>} />
    </Routes>
  )
}

export default App
