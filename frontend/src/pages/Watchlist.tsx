import { useState, useEffect } from 'react'
import { fetchStockPriceHistory } from '../services/api'
import { formatPrice, formatPercent } from '../utils/format'
import { Link } from 'react-router-dom'

interface WatchItem {
  symbol: string
  price?: number
  changePercent?: number
}

export default function Watchlist() {
  const [items, setItems] = useState<WatchItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('watchlist') || '[]')
    } catch { return [] }
  })

  const [input, setInput] = useState('')

  const addSymbol = () => {
    const s = input.toUpperCase().trim()
    if (s && !items.find((i) => i.symbol === s)) {
      const updated = [...items, { symbol: s }]
      setItems(updated)
      localStorage.setItem('watchlist', JSON.stringify(updated))
    }
    setInput('')
  }

  const removeSymbol = (sym: string) => {
    const updated = items.filter((i) => i.symbol !== sym)
    setItems(updated)
    localStorage.setItem('watchlist', JSON.stringify(updated))
  }

  useEffect(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 5)

    items.forEach(async (item) => {
      try {
        const data = await fetchStockPriceHistory(item.symbol, from.toISOString().split('T')[0], to.toISOString().split('T')[0])
        const latest = data[data.length - 1]
        const prevPrice = data[data.length - 2]?.close
        if (latest) {
          setItems((current) =>
            current.map((i) =>
              i.symbol === item.symbol
                ? {
                    ...i,
                    price: latest.close,
                    changePercent: prevPrice ? ((latest.close - prevPrice) / prevPrice) * 100 : 0,
                  }
                : i
            )
          )
        }
      } catch { /* ignore */ }
    })
  }, [items.length])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Watchlist</h2>
        <p className="text-sm text-gray-400">Danh sách cổ phiếu theo dõi (lưu trên trình duyệt)</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
          className="bg-gray-800 text-white text-sm rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 w-24 min-w-0"
          placeholder="Mã CP"
        />
        <button onClick={addSymbol} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          Thêm
        </button>
      </div>

      <div className="text-[10px] text-gray-600">Nguồn: VNDirect Open API</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => (
          <div key={item.symbol} className="bg-gray-900 rounded-xl border border-gray-800 p-4 relative group">
            <button
              onClick={() => removeSymbol(item.symbol)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
            >
              &times;
            </button>
            <Link to={`/stock?symbol=${item.symbol}`}>
              <div className="text-lg font-bold text-white">{item.symbol}</div>
              {item.price && (
                <>
                  <div className="text-2xl font-bold text-white mt-1">{formatPrice(item.price)}</div>
                  <div className={`text-sm font-medium mt-1 ${(item.changePercent ?? 0) >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                    {formatPercent(item.changePercent ?? 0)}
                  </div>
                </>
              )}
              {!item.price && <div className="text-sm text-gray-500 mt-2">Đang tải...</div>}
            </Link>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Chưa có cổ phiếu nào trong watchlist</p>
          <p className="text-sm mt-2">Thêm mã cổ phiếu bằng ô tìm kiếm ở trên</p>
        </div>
      )}
    </div>
  )
}
