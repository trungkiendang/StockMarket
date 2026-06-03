import { useState, useEffect, useCallback } from 'react'
import type { IndexInfo, StockInfo } from '../types/stock'
import type { HeatmapData } from '../types/chart'
import { fetchIndexes, fetchTopStocks } from '../services/api'
import { formatPrice, formatPercent, formatVolume } from '../utils/format'
import HeatmapChart from '../charts/HeatmapChart'
import { Link } from 'react-router-dom'

function useInterval(cb: () => void, ms: number) {
  useEffect(() => {
    const id = setInterval(cb, ms)
    return () => clearInterval(id)
  }, [cb, ms])
}

export default function Dashboard() {
  const [indexes, setIndexes] = useState<IndexInfo[]>([])
  const [stocks, setStocks] = useState<StockInfo[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [idx, top] = await Promise.all([fetchIndexes(), fetchTopStocks()])
      setIndexes(idx)
      setStocks(top)
      setHeatmapData(
        top.map((s) => ({
          name: s.symbol,
          value: s.marketCap,
          sector: s.sector,
          changePercent: s.changePercent,
        }))
      )
      setLastUpdated(new Date().toLocaleTimeString('vi-VN'))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useInterval(load, 30000)

  const advancers = stocks.filter((s) => s.changePercent > 0).length
  const decliners = stocks.filter((s) => s.changePercent < 0).length
  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">Tổng quan thị trường</h2>
          <p className="text-sm text-gray-400">
            {lastUpdated
              ? `Cập nhật ${lastUpdated} • Tự động làm mới 30s`
              : 'Đang tải...'}
          </p>
        </div>
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {indexes.map((idx) => (
          <div key={idx.symbol} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-sm text-gray-400">{idx.name}</div>
            <div className="text-2xl font-bold text-white mt-1">{formatPrice(idx.value, 1)}</div>
            <div className={`text-sm font-medium mt-1 ${idx.change >= 0 ? 'text-market-up' : 'text-market-down'}`}>
              {formatPercent(idx.changePercent)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4">
          <div className="text-xs text-gray-500">Mã tăng</div>
          <div className="text-lg font-bold text-market-up">{advancers}</div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4">
          <div className="text-xs text-gray-500">Mã giảm</div>
          <div className="text-lg font-bold text-market-down">{decliners}</div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4">
          <div className="text-xs text-gray-500">Mã đứng giá</div>
          <div className="text-lg font-bold text-gray-300">{stocks.length - advancers - decliners}</div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4">
          <div className="text-xs text-gray-500">Tổng KL</div>
          <div className="text-lg font-bold text-white">{formatVolume(stocks.reduce((s, v) => s + v.volume, 0))}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Heatmap vốn hóa theo ngành</h3>
          <HeatmapChart data={heatmapData} height={400} />
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Top khối lượng</h3>
          <div className="space-y-2">
            {stocks.slice(0, 10).map((s, i) => (
              <Link
                key={s.symbol}
                to={`/stock?symbol=${s.symbol}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{s.symbol}</div>
                  <div className="text-xs text-gray-500">{formatPrice(s.price)}</div>
                </div>
                <div className={`text-xs font-medium ${s.changePercent >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                  {formatPercent(s.changePercent)}
                </div>
                <div className="text-xs text-gray-400 w-16 text-right">{formatVolume(s.volume)}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-green-400 mb-3">Tăng mạnh nhất</h3>
          <div className="space-y-2">
            {gainers.map((s) => (
              <Link
                key={s.symbol}
                to={`/stock?symbol=${s.symbol}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-white truncate">{s.symbol}</span>
                  <span className="text-xs text-gray-500">{formatPrice(s.price)}</span>
                </div>
                <span className="text-xs font-medium text-market-up">{formatPercent(s.changePercent)}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-red-400 mb-3">Giảm mạnh nhất</h3>
          <div className="space-y-2">
            {losers.map((s) => (
              <Link
                key={s.symbol}
                to={`/stock?symbol=${s.symbol}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-white truncate">{s.symbol}</span>
                  <span className="text-xs text-gray-500">{formatPrice(s.price)}</span>
                </div>
                <span className="text-xs font-medium text-market-down">{formatPercent(s.changePercent)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
