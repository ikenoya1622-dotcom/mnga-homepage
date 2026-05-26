import { useState } from 'react'
import Header from '../../components/v2/Header'
import Footer from '../../components/v2/Footer'

const BRAND_RED = '#d63b2d'

const COMPANY_SCALES = ['10名以下', '11〜50名', '51〜300名', '301〜1000名', '1001名以上']

export default function Membership() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    scale: COMPANY_SCALES[0],
    motivation: '',
    agree: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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
              入会申し込みフォーム
            </h1>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.8, margin: 0 }}>
              MNGA への入会を希望される経営者の方は、以下フォームに必要事項をご入力ください。
              <br />
              内容を確認のうえ、事務局より追ってご連絡いたします。
              <br />
              <span style={{ color: BRAND_RED }}>*</span> は必須項目です。
            </p>
          </div>

          {submitted ? (
            <SubmittedCard onReset={() => { setSubmitted(false); setForm({ ...form, motivation: '' }) }} />
          ) : (
            <form onSubmit={handleSubmit}>
              <Field label="会社名" required>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="代表者氏名" required>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="役職" required>
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  placeholder="例：代表取締役 / 取締役 など"
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

              <Field label="電話番号">
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="03-xxxx-xxxx"
                  style={inputStyle}
                />
              </Field>

              <Field label="従業員規模" required>
                <select
                  name="scale"
                  value={form.scale}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  {COMPANY_SCALES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="入会動機・MNGA に期待すること" required>
                <textarea
                  name="motivation"
                  value={form.motivation}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </Field>

              <Field label="個人情報の取り扱いについて" required>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#444', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    required
                    style={{ accentColor: BRAND_RED, transform: 'scale(1.2)' }}
                  />
                  プライバシーポリシーに同意します
                </label>
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
                  入会申し込みを送信
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
      <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '16px 0 8px' }}>申し込みを受け付けました</h2>
      <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.8, margin: '0 0 24px' }}>
        入会お申し込みありがとうございます。<br />
        内容を確認のうえ、事務局より追ってご連絡いたします。
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
        別の申し込みをする
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
