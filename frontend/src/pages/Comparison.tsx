import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { fetchStockPriceHistory } from '../services/api'

interface StockData {
  symbol: string
  data: { date: string; price: number }[]
}

const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#a78bfa', '#06b6d4']

export default function Comparison() {
  const [symbols, setSymbols] = useState<string[]>(['VNM', 'VCB'])
  const [input, setInput] = useState('')
  const [stocks, setStocks] = useState<StockData[]>([])

  const addSymbol = () => {
    const s = input.toUpperCase().trim()
    if (s && !symbols.includes(s) && symbols.length < 6) {
      setSymbols([...symbols, s])
    }
    setInput('')
  }

  const removeSymbol = (sym: string) => {
    setSymbols(symbols.filter((s) => s !== sym))
  }

  useEffect(() => {
    const to = new Date()
    const from = new Date()
    from.setMonth(from.getMonth() - 6)

    Promise.all(
      symbols.map(async (sym) => {
        try {
          const prices = await fetchStockPriceHistory(sym, from.toISOString().split('T')[0], to.toISOString().split('T')[0])
          const basePrice = prices[0]?.close || 1
          return {
            symbol: sym,
            data: prices.map((p) => ({
              date: p.time,
              price: (p.close / basePrice) * 100,
            })),
          }
        } catch {
          return { symbol: sym, data: [] }
        }
      })
    ).then(setStocks)
  }, [symbols])

  const chartData = stocks.length > 0
    ? stocks[0].data.map((d, i) => {
        const entry: any = { date: d.date }
        stocks.forEach((s) => {
          if (s.data[i]) entry[s.symbol] = s.data[i].price
        })
        return entry
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">So sánh cổ phiếu</h2>
        <p className="text-sm text-gray-400">So sánh hiệu suất giữa các mã (chuẩn hóa về 100%)</p>
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

      <div className="flex flex-wrap gap-2">
        {symbols.map((sym, i) => (
          <span key={sym} className="flex items-center gap-2 bg-gray-800 text-gray-200 text-sm px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            {sym}
            <button onClick={() => removeSymbol(sym)} className="text-gray-500 hover:text-red-400 ml-1">&times;</button>
          </span>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Hiệu suất (chuẩn hóa 100%)</h3>
          <div className="w-full overflow-x-auto">
            <LineChart
              width={Math.max(600, chartData.length * 3)}
              height={400}
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Legend />
              {stocks.map((s, i) => (
                <Line key={s.symbol} type="monotone" dataKey={s.symbol} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {stocks.map((s, i) => {
          const perf = s.data.length > 0 ? ((s.data[s.data.length - 1]?.price || 100) - 100) : 0
          return (
            <div key={s.symbol} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-white font-medium">{s.symbol}</span>
              </div>
              <div className={`text-2xl font-bold mt-2 ${perf >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                {perf >= 0 ? '+' : ''}{perf.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Hiệu suất 6 tháng</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
