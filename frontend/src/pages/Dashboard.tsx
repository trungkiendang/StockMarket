import { useState, useEffect } from 'react'
import type { IndexInfo, StockInfo } from '../types/stock'
import type { HeatmapData } from '../types/chart'
import { fetchIndexes, fetchTopStocks } from '../services/api'
import { formatPrice, formatPercent, formatVolume } from '../utils/format'
import HeatmapChart from '../charts/HeatmapChart'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [indexes, setIndexes] = useState<IndexInfo[]>([])
  const [stocks, setStocks] = useState<StockInfo[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])

  useEffect(() => {
    fetchIndexes().then(setIndexes)
    fetchTopStocks().then((data) => {
      setStocks(data)
      setHeatmapData(
        data.map((s) => ({
          name: s.symbol,
          value: s.marketCap,
          sector: s.sector,
          changePercent: s.changePercent,
        }))
      )
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Tổng quan thị trường</h2>
        <p className="text-sm text-gray-400">Cập nhật dữ liệu từ VNDirect</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-4">
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
    </div>
  )
}
