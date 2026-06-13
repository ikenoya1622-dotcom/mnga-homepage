import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const CONTACT_URL = '#' // TODO: 実Googleフォーム URL
const LINKS = [
  ['/', 'TOP'],
  ['/about', 'ABOUT'],
  ['/activities', 'ACTIVITIES'],
  ['/report', 'REPORTS'],
]

// Shared smartphone navigation: a fixed hamburger (≤820px) that opens a
// full-screen drawer. The mock headers only hid their desktop links on mobile
// and never shipped a working menu, so this fills that gap on-brand.
export default function MobileNav({ current = '/' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Close on Escape and on route change.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { setOpen(false) }, [current])

  return (
    <>
      <button
        className={`mnav-burger${open ? ' is-open' : ''}`}
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      <div className={`mnav${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open}>
        <nav className="mnav__links">
          {LINKS.map(([to, label]) => (
            <Link key={to} to={to} className={current === to ? 'is-current' : undefined} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <a className="mnav__cta en" href={CONTACT_URL} target="_blank" rel="noopener" onClick={() => setOpen(false)}>問い合わせ</a>
        </nav>
      </div>
    </>
  )
}
