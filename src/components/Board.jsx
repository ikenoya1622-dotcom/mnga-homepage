const members = [
  { role: '会長', name: '樋田 謙吾', title: '会長', desc: 'xxxxxxxxxxxxxxxx' },
  { role: '副会長', name: '山本 智史', title: '株式会社Re-grit Partners', desc: 'xxxxxxxxxxxxxxxx' },
  { role: '仕事', name: 'XXX XXX', title: 'XXX  XXX', desc: '仕長  xxxxxxxxxxxxxxxx' },
  { role: '仕事', name: 'XXX XXX', title: 'XXX  XXX', desc: '仕長  xxxxxxxxxxxxxxxx' },
]

export default function Board() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-500 mb-8">3. 理事体制</p>
        <div className="board-grid grid grid-cols-2 md:grid-cols-4 gap-6" style={{marginTop: '80px'}}>
          {members.map((m, i) => (
            <div key={i} className="text-center">
              <div className="bg-gray-300 w-full mb-3" style={{aspectRatio: '3/4'}} />
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
