const values = [
  { title: '対等な関係', desc: '大企業/ベンチャーよりも上からでもなく、対等に学び合う。' },
  { title: '会員の質', desc: '会員数でなく、厳選者の質と関係性の豊さを重視' },
  { title: '本質的な協業', desc: '名刺ネットワーキングでなく、具体的な協業プロジェクトの創出' },
  { title: '経営スキル', desc: '経営者からの相談、チャレンジの先生になる経営スキルの修得' },
  { title: '将来志向', desc: '過去の成果でなく、世界に羽ばたくための日本社会の実現' },
]

export default function Value() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-500 font-bold mb-8">5. 提供価値</p>
        <div className="membership-inner">
          <div className="membership-visual-wrap">
            <div className="bg-gray-200" style={{aspectRatio: '3/4', height: 'auto'}} />
          </div>
          <div className="space-y-6">
            {values.map((v) => (
              <div key={v.title}>
                <h3 className="font-bold text-base mb-1">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.desc}</p>
              </div>
            ))}
            <a href="#" className="block text-sm text-gray-700 hover:underline mt-4">
              view more &gt;
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
