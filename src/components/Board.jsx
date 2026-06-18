// 個人名・人物写真はいったん削除（理事体制は順次発表）
const members = [
  { role: '理事', name: '準備中', title: '', desc: '', image: null },
]

export default function Board() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-500 font-bold mb-8">3. 理事体制</p>
        <div className="board-grid grid grid-cols-2 md:grid-cols-4 gap-6" style={{marginTop: '80px'}}>
          {members.map((m, i) => (
            <div key={i} className="text-center">
              <div className="bg-gray-300 w-full mb-3 overflow-hidden" style={{aspectRatio: '3/4'}}>
                {m.image && (
                  <img
                    src={m.image}
                    alt={m.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500">{m.role}</p>
              <p className="font-bold text-sm">{m.name}</p>
              <p className="text-xs text-gray-500 mt-1">{m.title}</p>
              <p className="text-xs text-gray-400">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
