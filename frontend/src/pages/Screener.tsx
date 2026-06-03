import { useState, useEffect } from 'react'
import { fetchStockPriceHistory } from '../services/api'
import { formatPrice, formatPercent, formatVolume } from '../utils/format'
import { Link } from 'react-router-dom'

const POPULAR_SYMBOLS = ['VNM', 'VCB', 'FPT', 'VIC', 'VHM', 'MWG', 'HPG', 'ACB', 'TCB', 'STB', 'MBB', 'CTG', 'BID', 'SSI', 'VND', 'GAS', 'SAB', 'MSN', 'PNJ', 'REE']

export default function Screener() {
  const [stocks, setStocks] = useState<{ symbol: string; price: number; change: number; changePercent: number; volume: number }[]>([])
  const [minPE, setMinPE] = useState('')
  const [maxPE, setMaxPE] = useState('')

  useEffect(() => {
    const to = new Date()
    const from = new Date()
    from.setMonth(from.getMonth() - 1)

    Promise.all(
      POPULAR_SYMBOLS.map(async (sym) => {
        try {
          const data = await fetchStockPriceHistory(sym, from.toISOString().split('T')[0], to.toISOString().split('T')[0])
          const latest = data[data.length - 1]
          const prev = data[data.length - 2]
          if (!latest) return null
          return {
            symbol: sym,
            price: latest.close,
            change: latest.close - (prev?.close ?? latest.close),
            changePercent: ((latest.close - (prev?.close ?? latest.close)) / (prev?.close ?? latest.close)) * 100,
            volume: latest.volume,
          }
        } catch { return null }
      })
    ).then((results) => setStocks(results.filter(Boolean) as typeof stocks))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Stock Screener</h2>
        <p className="text-sm text-gray-400">Lọc cổ phiếu theo điều kiện</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">P/E từ:</label>
          <input type="number" value={minPE} onChange={(e) => setMinPE(e.target.value)} className="w-24 sm:w-28 bg-gray-800 text-white text-xs rounded px-2 py-1.5 border border-gray-700" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">đến:</label>
          <input type="number" value={maxPE} onChange={(e) => setMaxPE(e.target.value)} className="w-24 sm:w-28 bg-gray-800 text-white text-xs rounded px-2 py-1.5 border border-gray-700" />
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800 bg-gray-900/50">
              <th className="text-left py-3 px-4 font-medium">Mã</th>
              <th className="text-right py-3 px-4 font-medium">Giá</th>
              <th className="text-right py-3 px-4 font-medium">Thay đổi</th>
              <th className="text-right py-3 px-4 font-medium">%</th>
              <th className="text-right py-3 px-4 font-medium">KL</th>
            </tr>
          </thead>
          <tbody>
            {stocks
              .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
              .map((s) => (
                <tr key={s.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 px-4">
                    <Link to={`/stock?symbol=${s.symbol}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                      {s.symbol}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right text-white">{formatPrice(s.price)}</td>
                  <td className={`py-3 px-4 text-right ${s.change >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                    {s.change >= 0 ? '+' : ''}{formatPrice(s.change)}
                  </td>
                  <td className={`py-3 px-4 text-right ${s.changePercent >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                    {formatPercent(s.changePercent)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">{formatVolume(s.volume)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
