import { useState, useEffect } from 'react'
import { fetchFinancialReport, fetchFinancialRatios } from '../services/api'
import { formatPrice, formatMarketCap } from '../utils/format'
import type { FinancialReport, FinancialRatio } from '../types/stock'

interface Props {
  symbol?: string
}

export default function FundamentalAnalysis({ symbol: propSymbol }: Props) {
  const [symbol, setSymbol] = useState(propSymbol || 'VNM')
  const [inputSymbol, setInputSymbol] = useState(symbol)
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [ratios, setRatios] = useState<FinancialRatio | null>(null)

  useEffect(() => {
    fetchFinancialReport(symbol).then(setReports)
    fetchFinancialRatios(symbol).then(setRatios)
  }, [symbol])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSymbol(inputSymbol.toUpperCase())
  }

  const latest = reports[reports.length - 1]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Phân tích cơ bản</h2>
          <p className="text-sm text-gray-400">Báo cáo tài chính và chỉ số doanh nghiệp</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 w-24 sm:w-28 min-w-0"
            placeholder="Mã CP"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Xem
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'P/E', value: ratios?.pe, color: ratios && ratios.pe < 15 ? 'text-market-up' : ratios && ratios.pe > 30 ? 'text-market-down' : 'text-yellow-400' },
          { label: 'P/B', value: ratios?.pb },
          { label: 'ROE', value: ratios?.roe ? `${(ratios.roe * 100).toFixed(2)}%` : 'N/A', color: ratios && ratios.roe > 0.15 ? 'text-market-up' : 'text-market-down' },
          { label: 'ROA', value: ratios?.roa ? `${(ratios.roa * 100).toFixed(2)}%` : 'N/A' },
          { label: 'EPS', value: ratios?.eps ? formatPrice(ratios.eps) : 'N/A' },
          { label: 'Beta', value: ratios?.beta?.toFixed(2) ?? 'N/A' },
          { label: 'Cổ tức', value: ratios?.dividendYield ? `${(ratios.dividendYield * 100).toFixed(2)}%` : 'N/A' },
        ].map((r) => (
          <div key={r.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-xs text-gray-400">{r.label}</div>
            <div className={`text-lg font-bold ${r.color || 'text-white'} mt-1`}>{r.value ?? 'N/A'}</div>
          </div>
        ))}
      </div>

      {latest && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Báo cáo tài chính gần nhất ({latest.period})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {[
              { label: 'Doanh thu', value: formatMarketCap(latest.revenue) },
              { label: 'Lợi nhuận gộp', value: formatMarketCap(latest.grossProfit) },
              { label: 'Lợi nhuận HĐKD', value: formatMarketCap(latest.operatingProfit) },
              { label: 'Lợi nhuận ròng', value: formatMarketCap(latest.netProfit) },
              { label: 'Tổng tài sản', value: formatMarketCap(latest.assets) },
              { label: 'Vốn CSH', value: formatMarketCap(latest.equity) },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">{r.label}</span>
                <span className="text-sm font-medium text-white">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reports.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Lịch sử báo cáo tài chính</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2 px-3">Kỳ</th>
                  <th className="text-right py-2 px-3">Doanh thu</th>
                  <th className="text-right py-2 px-3">LN gộp</th>
                  <th className="text-right py-2 px-3">LN ròng</th>
                  <th className="text-right py-2 px-3">Tài sản</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice().reverse().map((r, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-300">{r.period}</td>
                    <td className="py-2 px-3 text-right text-white">{formatMarketCap(r.revenue)}</td>
                    <td className="py-2 px-3 text-right text-market-up">{formatMarketCap(r.grossProfit)}</td>
                    <td className="py-2 px-3 text-right text-white">{formatMarketCap(r.netProfit)}</td>
                    <td className="py-2 px-3 text-right text-white">{formatMarketCap(r.assets)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
