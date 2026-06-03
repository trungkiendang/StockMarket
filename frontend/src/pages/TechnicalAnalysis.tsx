import { useState, useEffect } from 'react'
import { fetchStockPriceHistory } from '../services/api'
import { calcSMA, calcRSI, calcMACD, indicatorsToSeries, macdToSeries } from '../utils/indicators'
import CandlestickChart from '../charts/CandlestickChart'
import TechnicalIndicators from '../charts/TechnicalIndicators'
import RenkoChart from '../charts/custom/RenkoChart'
import PointFigureChart from '../charts/custom/PointFigureChart'
import type { CandlestickData } from '../types/chart'

export default function TechnicalAnalysis() {
  const [symbol, setSymbol] = useState('VNM')
  const [inputSymbol, setInputSymbol] = useState('VNM')
  const [data, setData] = useState<CandlestickData[]>([])
  const [bricks, setBricks] = useState<{ open: number; close: number; high: number; low: number; direction: 'up' | 'down' }[]>([])
  const [pfColumns, setPfColumns] = useState<{ direction: 'X' | 'O'; count: number; startPrice: number; endPrice: number }[]>([])
  const [brickSize, setBrickSize] = useState(1)

  useEffect(() => {
    const to = new Date()
    const from = new Date()
    from.setFullYear(from.getFullYear() - 1)

    fetchStockPriceHistory(symbol, from.toISOString().split('T')[0], to.toISOString().split('T')[0])
      .then((prices) => {
        const chartData: CandlestickData[] = prices.map((p) => ({
          time: p.time as any,
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
        }))
        setData(chartData)

        const closes = prices.map((p) => p.close)

        // Renko bricks
        const renkoBricks: typeof bricks = []
        let prevClose = closes[0]
        prices.slice(1).forEach((p) => {
          const move = ((p.close - prevClose) / prevClose) * 100
          if (Math.abs(move) >= brickSize) {
            renkoBricks.push({
              open: prevClose,
              close: p.close,
              high: p.high,
              low: p.low,
              direction: move > 0 ? 'up' : 'down',
            })
            prevClose = p.close
          }
        })
        setBricks(renkoBricks)

        // Point & Figure columns
        const pfCols: typeof pfColumns = []
        let currentDir: 'X' | 'O' | null = null
        let count = 0
        let startPrice = closes[0]
        prices.slice(1).forEach((p) => {
          const move = ((p.close - startPrice) / startPrice) * 100
          const dir = move >= brickSize ? 'X' : move <= -brickSize ? 'O' : null
          if (dir && dir === currentDir) {
            count++
          } else if (dir) {
            if (currentDir) {
              pfCols.push({ direction: currentDir, count, startPrice, endPrice: p.close })
            }
            currentDir = dir
            count = 1
            startPrice = p.close
          }
        })
        if (currentDir) {
          pfCols.push({ direction: currentDir, count, startPrice, endPrice: closes[closes.length - 1] })
        }
        setPfColumns(pfCols)
      })
  }, [symbol, brickSize])

  const closes = data.map((d) => d.close)
  const times = data.map((d) => d.time)

  const ma20 = indicatorsToSeries(times, calcSMA(closes, 20))
  const ma50 = indicatorsToSeries(times, calcSMA(closes, 50))
  const rsiSeries = indicatorsToSeries(times, calcRSI(closes))
  const macd = calcMACD(closes)
  const macdSeries = macdToSeries(times, macd)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSymbol(inputSymbol.toUpperCase())
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Phân tích kỹ thuật</h2>
          <p className="text-xs sm:text-sm text-gray-400">Biểu đồ đa khung + chỉ báo nâng cao</p>
        </div>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center">
          <label className="text-xs text-gray-400">Brick:</label>
          <input
            type="number"
            value={brickSize}
            onChange={(e) => setBrickSize(Number(e.target.value))}
            className="w-16 bg-gray-800 text-white text-xs rounded px-2 py-1.5 border border-gray-700"
            min={0.1}
            max={10}
            step={0.1}
          />
          <input
            type="text"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 w-24"
            placeholder="Mã CP"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Xem
          </button>
        </form>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Biểu đồ nến + MA20/MA50 + Bollinger Bands</h3>
        <div className="h-[400px]">
          <CandlestickChart data={data} ma20={ma20} ma50={ma50} height={400} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">RSI (14)</h3>
          <TechnicalIndicators
            indicators={[{ title: 'RSI', data: rsiSeries, color: '#a78bfa' }]}
            height={150}
          />
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">MACD (12, 26, 9)</h3>
          <TechnicalIndicators
            indicators={[
              { title: 'MACD', data: macdSeries.macd, color: '#f59e0b' },
              { title: 'Signal', data: macdSeries.signal, color: '#6366f1' },
              { title: 'Histogram', data: macdSeries.histogram.map((d) => ({ time: d.time, value: d.value })), color: '#22c55e', type: 'histogram' },
            ]}
            height={150}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Renko Chart (brick: {brickSize}%)</h3>
          <RenkoChart bricks={bricks} brickSize={brickSize} width={500} height={350} />
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Point & Figure (box: {brickSize}%)</h3>
          <PointFigureChart columns={pfColumns} boxSize={brickSize} width={500} height={350} />
        </div>
      </div>
    </div>
  )
}
