import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CtaSection from '../components/CtaSection'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: 1,
    title: '申込',
    lines: ['分科会紹介', '既存会員推薦', '直接申込'],
    tag: null,
    active: false,
  },
  {
    number: 2,
    title: '事務局\n審査',
    lines: ['書面審査'],
    tag: '即日〜3営業日',
    active: false,
  },
  {
    number: 3,
    title: '理事長\n確認',
    lines: ['書面ベース', '必要時のみ', '15分面談'],
    tag: null,
    active: false,
  },
  {
    number: 4,
    title: '入会\n手続き',
    lines: ['会費請求', 'オリエンテーション', '本会案内'],
    tag: null,
    active: false,
  },
  {
    number: 5,
    title: '入会\n完了',
    lines: [],
    tag: '最短1週間',
    active: true,
  },
]

const plans = [
  {
    label: 'CORPORATE MEMBER',
    name: '大企業会員',
    price: '150万円',
    unit: '／ 年',
  },
  {
    label: 'VENTURE MEMBER',
    name: 'ベンチャー会員',
    price: '50万円',
    unit: '／ 年',
  },
]

export default function JoinPage() {
  const titleRef = useRef(null)
  const flowRef = useRef(null)
  const feeRef = useRef(null)

  useEffect(() => {
    const targets = [titleRef.current, flowRef.current, feeRef.current]
    const anims = targets.map((el) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        }
      )
    )
    return () => {
      anims.forEach((a) => a.kill())
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ paddingTop: '80px' }}>

        {/* ページタイトル */}
        <div ref={titleRef} className="container" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', letterSpacing: '0.05em' }}>入会方法</h1>
        </div>

        {/* 1. 入会の流れ */}
        <div ref={flowRef} className="container" style={{ paddingTop: '40px', paddingBottom: '100px' }}>
          <h2 className="text-sm text-gray-500 font-bold" style={{ marginBottom: '48px', fontSize: '16px' }}>
            1. 入会の流れ
          </h2>
          <div className="join-steps">
            {steps.map((step, i) => (
              <div key={step.number} className="join-step">
                {/* 横線（最初のステップは左半分だけ、最後は右半分だけ非表示） */}
                <div className="join-step-line-wrap">
                  <div
                    className="join-step-line-left"
                    style={{ visibility: i === 0 ? 'hidden' : 'visible' }}
                  />
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: step.active ? 'none' : '1px solid #999',
                      background: step.active ? '#000' : '#fff',
                      color: step.active ? '#fff' : '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  >
                    {step.number}
                  </div>
                  <div
                    className="join-step-line-right"
                    style={{ visibility: i === steps.length - 1 ? 'hidden' : 'visible' }}
                  />
                </div>
                {/* ステップ内容 */}
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '8px' }}>
                    {step.title}
                  </p>
                  {step.lines.map((line, j) => (
                    <p key={j} style={{ fontSize: '12px', color: '#555', lineHeight: '1.8' }}>{line}</p>
                  ))}
                  {step.tag && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '11px',
                      border: '1px solid #999',
                      padding: '2px 8px',
                      color: '#555',
                    }}>
                      {step.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 入会金 */}
        <div ref={feeRef} className="container" style={{ paddingTop: '40px', paddingBottom: '100px' }}>
          <h2 className="text-sm text-gray-500 font-bold" style={{ marginBottom: '48px', fontSize: '16px' }}>
            2. 入会金
          </h2>
          <div className="join-plans">
            {plans.map((plan) => (
              <div
                key={plan.label}
                style={{
                  border: '1px solid #d0d0d0',
                  padding: '32px',
                  flex: 1,
                }}
              >
                <p style={{ fontSize: '11px', color: '#999', letterSpacing: '0.1em', marginBottom: '12px' }}>
                  {plan.label}
                </p>
                <p style={{ fontSize: '16px', marginBottom: '16px' }}>{plan.name}</p>
                <p>
                  <span style={{ fontSize: '36px', fontWeight: '500', letterSpacing: '-0.02em' }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: '#555', marginLeft: '6px' }}>{plan.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
