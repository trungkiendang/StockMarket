import type { StockPrice, StockInfo, IndexInfo, FinancialReport, FinancialRatio } from '../types/stock'

const API_BASE = 'https://finfo-api.vndirect.com.vn/v4'

export async function fetchStockPriceHistory(
  symbol: string,
  from: string,
  to: string
): Promise<StockPrice[]> {
  const url = `${API_BASE}/stock_prices?q=code:${symbol}~date:gte:${from}~date:lte:${to}&sort=date&size=1000`
  const res = await fetch(url)
  const json = await res.json()
  return (json.data || []).map((item: any) => ({
    time: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volumeMatch || item.volume,
  }))
}

export async function fetchRealtimePrice(symbol: string): Promise<StockInfo> {
  const url = `https://api.vndirect.com.vn/v2/stocks/${symbol}`
  const res = await fetch(url)
  return res.json()
}

export async function fetchIndexes(): Promise<IndexInfo[]> {
  const symbols = ['VNINDEX', 'VN30', 'HNXINDEX', 'UPCOMINDEX']
  const results = await Promise.allSettled(
    symbols.map(async (s) => {
      const data = await fetchStockPriceHistory(s, getDateStr(-1), getDateStr(0))
      const latest = data[data.length - 1]
      const prev = data[data.length - 2]
      if (!latest) return null
      return {
        name: s === 'VNINDEX' ? 'VN-Index' : s === 'VN30' ? 'VN30' : s === 'HNXINDEX' ? 'HNX-Index' : 'UPCOM',
        symbol: s,
        value: latest.close,
        change: latest.close - (prev?.close ?? latest.close),
        changePercent: ((latest.close - (prev?.close ?? latest.close)) / (prev?.close ?? latest.close)) * 100,
      } as IndexInfo
    })
  )
  return results.filter((r) => r.status === 'fulfilled').map((r: any) => r.value).filter(Boolean)
}

export async function fetchFinancialReport(symbol: string): Promise<FinancialReport[]> {
  const url = `${API_BASE}/financial_reports?q=symbol:${symbol}&sort=period&size=20`
  const res = await fetch(url)
  const json = await res.json()
  return (json.data || []).map((item: any) => ({
    period: item.period,
    revenue: item.revenue,
    grossProfit: item.grossProfit,
    operatingProfit: item.operatingProfit,
    netProfit: item.netProfit,
    assets: item.totalAssets,
    liabilities: item.totalLiabilities,
    equity: item.equity,
  }))
}

export async function fetchFinancialRatios(symbol: string): Promise<FinancialRatio | null> {
  const url = `${API_BASE}/financial_ratios?q=symbol:${symbol}&sort=period&size=1`
  const res = await fetch(url)
  const json = await res.json()
  const item = json.data?.[0]
  if (!item) return null
  return {
    pe: item.pe,
    pb: item.pb,
    eps: item.eps,
    roe: item.roe,
    roa: item.roa,
    beta: item.beta,
    dividendYield: item.dividendYield,
  }
}

export async function fetchTopStocks(): Promise<StockInfo[]> {
  const url = `${API_BASE}/stock_prices?q=date:gte:${getDateStr(-1)}&sort=volumeMatch&size=20`
  const res = await fetch(url)
  const json = await res.json()
  return (json.data || []).map((item: any) => ({
    symbol: item.code,
    companyName: item.companyName || item.code,
    exchange: 'HOSE',
    sector: item.sector || 'N/A',
    marketCap: item.marketCap || 0,
    price: item.close,
    change: item.priceChange || 0,
    changePercent: item.priceChangePercent || 0,
    volume: item.volumeMatch || 0,
  }))
}

function getDateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}
