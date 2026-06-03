import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchStockPriceHistory, fetchFinancialRatios } from '../services/api'
import { formatPrice, formatPercent, formatVolume } from '../utils/format'
import { calcSMA, calcRSI, calcMACD, indicatorsToSeries, macdToSeries } from '../utils/indicators'
import CandlestickChart from '../charts/CandlestickChart'
import TechnicalIndicators from '../charts/TechnicalIndicators'
import type { CandlestickData } from '../types/chart'
import type { FinancialRatio } from '../types/stock'

export default function StockDetail() {
  const [searchParams] = useSearchParams()
  const symbol = searchParams.get('symbol') || 'VNM'
  const [data, setData] = useState<CandlestickData[]>([])
  const [ratios, setRatios] = useState<FinancialRatio | null>(null)
  const [range, setRange] = useState<'1M' | '3M' | '6M' | '1Y'>('1M')

  useEffect(() => {
    const to = new Date()
    const from = new Date()
    if (range === '1M') from.setMonth(from.getMonth() - 1)
    else if (range === '3M') from.setMonth(from.getMonth() - 3)
    else if (range === '6M') from.setMonth(from.getMonth() - 6)
    else from.setFullYear(from.getFullYear() - 1)

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
      })

    fetchFinancialRatios(symbol).then(setRatios)
  }, [symbol, range])

  const closes = data.map((d) => d.close)
  const times = data.map((d) => d.time)
  const volumeData = data.map((d) => ({
    time: d.time,
    value: d.volume || 0,
    color: 'rgba(99, 102, 241, 0.4)',
  }))

  const ma20 = indicatorsToSeries(times, calcSMA(closes, 20))
  const ma50 = indicatorsToSeries(times, calcSMA(closes, 50))
  const rsiValues = calcRSI(closes)
  const rsiSeries = indicatorsToSeries(times, rsiValues)
  const macd = calcMACD(closes)
  const macdSeries = macdToSeries(times, macd)

  const latest = data[data.length - 1]
  const prev = data[data.length - 2]
  const change = latest && prev ? latest.close - prev.close : 0
  const changePercent = latest && prev ? (change / prev.close) * 100 : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{symbol}</h2>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">HOSE</span>
          </div>
          {latest && (
            <div className="flex items-center gap-2 sm:gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-white">{formatPrice(latest.close)}</span>
              <span className={`text-base sm:text-lg font-medium ${change >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                {change >= 0 ? '+' : ''}{formatPrice(change)} ({formatPercent(changePercent)})
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          {(['1M', '3M', '6M', '1Y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                range === r ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <CandlestickChart data={data} volumeData={volumeData} ma20={ma20} ma50={ma50} height={450} />
        </div>
        <div className="space-y-4">
          {ratios && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Chỉ số cơ bản</h3>
              {[
                { label: 'P/E', value: ratios.pe },
                { label: 'P/B', value: ratios.pb },
                { label: 'EPS', value: ratios.eps },
                { label: 'ROE (%)', value: ratios.roe },
                { label: 'ROA (%)', value: ratios.roa },
                { label: 'Beta', value: ratios.beta },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{r.label}</span>
                  <span className="text-white font-medium">{r.value?.toFixed(2) ?? 'N/A'}</span>
                </div>
              ))}
            </div>
          )}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Khối lượng</h3>
            <div className="text-lg font-bold text-white">{formatVolume(latest?.volume || 0)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">RSI (14)</h3>
          <TechnicalIndicators
            indicators={[{ title: 'RSI', data: rsiSeries, color: '#a78bfa' }]}
            height={180}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="text-market-down">Quá bán (30)</span>
            <span className="text-market-up">Quá mua (70)</span>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">MACD (12, 26, 9)</h3>
          <TechnicalIndicators
            indicators={[
              { title: 'MACD', data: macdSeries.macd, color: '#f59e0b' },
              { title: 'Signal', data: macdSeries.signal, color: '#6366f1' },
              { title: 'Histogram', data: macdSeries.histogram.map((d) => ({ time: d.time, value: d.value })), color: '#22c55e', type: 'histogram' },
            ]}
            height={180}
          />
        </div>
      </div>
    </div>
  )
}
