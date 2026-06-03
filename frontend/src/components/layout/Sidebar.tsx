import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Tổng quan', icon: '📊' },
  { to: '/stock', label: 'Cổ phiếu', icon: '📈' },
  { to: '/technical', label: 'Kỹ thuật', icon: '🔬' },
  { to: '/fundamental', label: 'Cơ bản', icon: '📋' },
  { to: '/screener', label: 'Screener', icon: '🔍' },
  { to: '/comparison', label: 'So sánh', icon: '⚖️' },
  { to: '/watchlist', label: 'Watchlist', icon: '⭐' },
  { to: '/alerts', label: 'Cảnh báo', icon: '🔔' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen
        w-48 sm:w-56 lg:w-64 bg-gray-900 border-r border-gray-800 flex flex-col
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white tracking-tight">StockViz</h1>
          <p className="text-xs text-gray-500">Phân tích chứng khoán</p>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 text-xs text-gray-600">
          Dữ liệu từ VNDirect • Real-time
        </div>
      </aside>
    </>
  )
}
