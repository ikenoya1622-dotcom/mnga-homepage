import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'mnga-design-version'
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [version, setVersion] = useState(() => {
    if (typeof window === 'undefined') return 'v1'
    return window.localStorage.getItem(STORAGE_KEY) === 'v2' ? 'v2' : 'v1'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, version)
    document.documentElement.setAttribute('data-design-version', version)
  }, [version])

  const toggleVersion = () => setVersion((v) => (v === 'v1' ? 'v2' : 'v1'))

  return (
    <ThemeContext.Provider value={{ version, setVersion, toggleVersion }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useDesignVersion() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useDesignVersion must be used within ThemeProvider')
  return ctx
}
