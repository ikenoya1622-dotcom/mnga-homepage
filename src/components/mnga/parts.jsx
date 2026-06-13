// Small shared building blocks for the MNGA mock-faithful pages.

// Renders the exact `.split-lines > .line > .line__i` structure that the mocks'
// inline script produced from a heading's <br>-separated lines. Each line may
// contain inline HTML (e.g. <span class="accent">…</span>).
export function SplitLines({ as: Tag = 'h2', className = '', lines, ...rest }) {
  return (
    <Tag className={`split-lines ${className}`.trim()} {...rest}>
      {lines.map((html, i) => (
        <span className="line" key={i}>
          <span className="line__i" dangerouslySetInnerHTML={{ __html: html }} />
        </span>
      ))}
    </Tag>
  )
}

// Dedicated element that carries the page vignette (inset box-shadow). The
// scoped CSS targets `.mnga-vignette::after`; see scripts/scope-mock-css.mjs.
export function Vignette() {
  return <div className="mnga-vignette" aria-hidden="true" />
}

// Read-intro preloader. `variant="logo"` = symbol + bar + caption (top/about/
// reports/news/report detail). `variant="mark"` = animated M·N·G·A letters
// (activities).
export function Preloader({ variant = 'logo', caption = 'Make Nippon Great Again' }) {
  if (variant === 'mark') {
    return (
      <div className="preloader" id="preloader" aria-hidden="true">
        <div className="preloader__mark en">
          {['M', 'N', 'G', 'A'].map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <div className="preloader__bar"><i /></div>
        <div className="preloader__cap en">{caption}</div>
      </div>
    )
  }
  return (
    <div className="preloader" id="preloader" aria-hidden="true">
      <div className="preloader__inner">
        <img className="preloader__logo" src="/mnga-symbol.png" alt="" />
        <div className="preloader__bar"><i /></div>
        <span className="preloader__txt en">{caption}</span>
      </div>
    </div>
  )
}
