import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  ['/about', 'ABOUT'],
  ['/activities', 'ACTIVITIES'],
  ['/report', 'REPORTS'],
]

// Shared smartphone navigation: a fixed hamburger (≤820px) that opens a
// full-screen drawer. The mock headers only hid their desktop links on mobile
// and never shipped a working menu, so this fills that gap on-brand.
export default function MobileNav({ current = '/' }) {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef(null)
  const burgerRef = useRef(null)
  const wasOpen = useRef(false)

  // Lock background scroll while the drawer is open. iOS Safari ignores
  // `overflow:hidden` on body, so pin the body with position:fixed and restore
  // the scroll position on close.
  useEffect(() => {
    if (!open) return
    const y = window.scrollY
    const body = document.body
    const prev = {
      position: body.style.position, top: body.style.top,
      width: body.style.width, overflow: body.style.overflow,
    }
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      window.scrollTo(0, y)
    }
  }, [open])

  // Close on route change.
  useEffect(() => { setOpen(false) }, [current])

  // C-1: when closed, mark the drawer `inert` so its links are removed from the
  // tab order, pointer, and the accessibility tree (resolves the aria-hidden +
  // focusable-children conflict / "invisible focus trap").
  useEffect(() => {
    const el = drawerRef.current
    if (el) el.inert = !open
  }, [open])

  // C-2: while open, move focus into the drawer, trap Tab/Shift+Tab within it,
  // close on Escape, and return focus to the hamburger when it closes.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current && burgerRef.current) burgerRef.current.focus()
      wasOpen.current = false
      return
    }
    wasOpen.current = true
    const el = drawerRef.current
    if (!el) return
    const focusables = () =>
      Array.from(el.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    const list = focusables()
    if (list[0]) list[0].focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={burgerRef}
        className={`mnav-burger${open ? ' is-open' : ''}`}
        aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={open}
        aria-controls="mnav-drawer"
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      <div
        id="mnav-drawer"
        ref={drawerRef}
        className={`mnav${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="モバイルナビゲーション"
      >
        <nav className="mnav__links" aria-label="モバイルナビゲーション">
          {LINKS.map(([to, label]) => (
            <Link key={to} to={to} className={current === to ? 'is-current' : undefined} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          {/* A-1: お問い合わせフォーム未確定のため準備中（押せて飛ばない死リンクを撤去） */}
          <span className="mnav__cta en" aria-disabled="true" title="お問い合わせフォームは準備中です">問い合わせ（準備中）</span>
        </nav>
      </div>
    </>
  )
}
