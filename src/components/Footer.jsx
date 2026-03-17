export default function Footer() {
  return (
    <footer className="py-10 bg-white border-t border-gray-200">
      <div style={{padding: '0 60px'}}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{background: '#c8392b'}}>
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-bold">MNGA</span>
            </div>
            <p className="text-xs text-gray-500">Make Nippon Great Again</p>
            <p className="text-xs text-gray-400 mt-2">
              東京都港区赤坂1丁目8-1（最寄り駅）/ info@4-live.co　03-xxx-xxxx
            </p>
          </div>
          <nav>
            <ul className="flex flex-wrap gap-4">
              {[
                { label: 'About', href: '/about' },
                { label: 'Report', href: '/report' },
                { label: 'Join', href: '/join' },
                { label: 'Contact', href: '#' },
                { label: 'プライバシーポリシー', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-xs text-gray-600 hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
