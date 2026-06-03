import { useState } from 'react'

interface Props {
  onSearch?: (query: string) => void
  onMenuClick: () => void
}

export default function Header({ onSearch, onMenuClick }: Props) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    onSearch?.(query.toUpperCase())
    setQuery('')
  }

  return (
    <header className="h-14 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center px-2 sm:px-4 md:px-6 gap-2 sm:gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <form onSubmit={handleSubmit} className="flex-1 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã cổ phiếu..."
          className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg px-3 sm:px-4 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 placeholder-gray-500"
        />
      </form>
      <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Thị trường mở
        </span>
      </div>
    </header>
  )
}
