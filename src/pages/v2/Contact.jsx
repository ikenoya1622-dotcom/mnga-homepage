import { useState } from 'react'
import Header from '../../components/v2/Header'
import Footer from '../../components/v2/Footer'

const BRAND_RED = '#d63b2d'

const INQUIRY_TYPES = ['一般お問い合わせ', '取材・メディア', '協業・パートナーシップ', 'その他']

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    type: INQUIRY_TYPES[0],
    message: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // 実際の送信は本リリース時に Google Form 等へ差し替え
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <main style={{ paddingTop: '64px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
          {/* Form Header Card */}
          <div
            style={{
              background: '#fff',
              borderTop: `8px solid ${BRAND_RED}`,
              borderRadius: '8px',
              padding: '32px 40px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <h1
              style={{
                fontFamily: "'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
                fontSize: '28px',
                color: '#1a1a1a',
                margin: 0,
                marginBottom: '12px',
                fontWeight: 500,
              }}
            >
              お問い合わせフォーム
            </h1>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.8, margin: 0 }}>
              MNGA に関するご質問・取材依頼・協業のご相談など、お気軽にお問い合わせください。
              <br />
              <span style={{ color: BRAND_RED }}>*</span> は必須項目です。
            </p>
          </div>

          {submitted ? (
            <SubmittedCard onReset={() => { setSubmitted(false); setForm({ ...form, message: '' }) }} />
          ) : (
            <form onSubmit={handleSubmit}>
              <Field label="お名前" required>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="メールアドレス" required>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="会社名・組織名">
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="お問い合わせ種別" required>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  {INQUIRY_TYPES.map((t) => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="type"
                        value={t}
                        checked={form.type === t}
                        onChange={handleChange}
                        style={{ accentColor: BRAND_RED }}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="お問い合わせ内容" required>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </Field>

              {/* Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="submit"
                  style={{
                    background: BRAND_RED,
                    color: '#fff',
                    border: 'none',
                    padding: '12px 40px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    letterSpacing: '0.1em',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  送信
                </button>
              </div>
            </form>
          )}

          <p style={{ marginTop: '24px', fontSize: '11px', color: '#999', textAlign: 'center' }}>
            ※ このフォームはサンプル表示です。リリース時に Google Form に置き換わります。
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '24px 40px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <p style={{ fontSize: '14px', color: '#1a1a1a', margin: 0, marginBottom: '14px', fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: BRAND_RED, marginLeft: '4px' }}>*</span>}
      </p>
      {children}
    </div>
  )
}

function SubmittedCard({ onReset }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <p style={{ fontSize: '40px', margin: 0, color: BRAND_RED }}>✓</p>
      <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '16px 0 8px' }}>送信が完了しました</h2>
      <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.8, margin: '0 0 24px' }}>
        お問い合わせいただきありがとうございます。<br />
        内容を確認のうえ、担当者より追ってご連絡いたします。
      </p>
      <button
        onClick={onReset}
        style={{
          background: 'transparent',
          color: BRAND_RED,
          border: `1px solid ${BRAND_RED}`,
          padding: '10px 32px',
          fontSize: '13px',
          borderRadius: '4px',
          cursor: 'pointer',
          letterSpacing: '0.1em',
        }}
      >
        別の問い合わせを送る
      </button>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontFamily: 'inherit',
  background: '#fff',
  color: '#1a1a1a',
  outline: 'none',
}
