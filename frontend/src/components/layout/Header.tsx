import { useState } from 'react'

interface Props {
  onSearch?: (query: string) => void
}

export default function Header({ onSearch }: Props) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query.toUpperCase())
  }

  return (
    <header className="h-14 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center px-6 gap-4 sticky top-0 z-40">
      <form onSubmit={handleSubmit} className="flex-1 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã cổ phiếu (VD: VNM, VCB, FPT)..."
          className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 placeholder-gray-500"
        />
      </form>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Thị trường mở
        </span>
      </div>
    </header>
  )
}
