// Shared motion helpers for the MNGA mock-faithful pages.
// Uses the project's installed GSAP + ScrollTrigger, and loads Lenis (smooth
// scroll) from the same CDN the mocks used — so no new npm dependency is added.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenisPromise = null
export function loadLenis() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.Lenis) return Promise.resolve(window.Lenis)
  if (lenisPromise) return lenisPromise
  lenisPromise = new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js'
    s.async = true
    s.onload = () => resolve(window.Lenis || null)
    s.onerror = () => resolve(null)
    document.head.appendChild(s)
  })
  return lenisPromise
}

// Adds `is-in` to every `.split-lines` heading inside `root` as it scrolls into
// view — mirrors the IntersectionObserver in every mock's split-lines script.
export function observeSplitLines(root, reduce) {
  const heads = Array.from(root.querySelectorAll('.split-lines'))
  if (reduce || !('IntersectionObserver' in window)) {
    heads.forEach((el) => el.classList.add('is-in'))
    return () => {}
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.25, rootMargin: '0px 0px -8% 0px' },
  )
  heads.forEach((el) => io.observe(el))
  return () => io.disconnect()
}
