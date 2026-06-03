import type { StockPrice, StockInfo, IndexInfo, FinancialReport, FinancialRatio } from '../types/stock'

const API_BASE = 'https://api-finfo.vndirect.com.vn/v4'

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
    volume: item.nmVolume || item.volumeMatch || item.volume || 0,
  }))
}

export async function fetchRealtimePrice(symbol: string): Promise<StockInfo> {
  const url = `${API_BASE}/stock_prices?q=code:${symbol}~date:gte:${getDateStr(0)}~date:lte:${getDateStr(0)}&sort=date&size=500`
  const res = await fetch(url)
  const json = await res.json()
  const items = json.data || []
  const latest = items[items.length - 1]
  if (!latest) throw new Error('No data')
  return {
    symbol: latest.code,
    companyName: latest.code,
    exchange: latest.floor || 'HOSE',
    sector: 'N/A',
    marketCap: 0,
    price: latest.close,
    change: latest.change || 0,
    changePercent: latest.pctChange || 0,
    volume: latest.nmVolume || 0,
  }
}

export async function fetchIndexes(): Promise<IndexInfo[]> {
  const symbols = ['VNINDEX', 'VN30', 'HNXINDEX', 'UPCOMINDEX']
  const results = await Promise.allSettled(
    symbols.map(async (s) => {
      const data = await fetchStockPriceHistory(s, getDateStr(-5), getDateStr(0))
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
  try {
    const url = `${API_BASE}/stock_prices?q=code:${symbol}~date:gte:${getDateStr(-365)}&sort=date&size=2`
    const res = await fetch(url)
    const json = await res.json()
    const prices = json.data || []
    if (prices.length < 2) return generateMockReports()
    const latestClose = prices[prices.length - 1]?.close || 50000
    return generateMockReports(latestClose)
  } catch {
    return generateMockReports()
  }
}

function generateMockReports(price: number = 50000): FinancialReport[] {
  const baseRevenue = price * 1000000
  return [
    { period: '2026Q1', revenue: baseRevenue * 1.12, grossProfit: baseRevenue * 0.48, operatingProfit: baseRevenue * 0.32, netProfit: baseRevenue * 0.25, assets: baseRevenue * 8.5, liabilities: baseRevenue * 5.2, equity: baseRevenue * 3.3 },
    { period: '2025Q4', revenue: baseRevenue * 1.08, grossProfit: baseRevenue * 0.45, operatingProfit: baseRevenue * 0.30, netProfit: baseRevenue * 0.23, assets: baseRevenue * 8.2, liabilities: baseRevenue * 5.0, equity: baseRevenue * 3.2 },
    { period: '2025Q3', revenue: baseRevenue * 1.05, grossProfit: baseRevenue * 0.44, operatingProfit: baseRevenue * 0.29, netProfit: baseRevenue * 0.22, assets: baseRevenue * 8.0, liabilities: baseRevenue * 4.9, equity: baseRevenue * 3.1 },
    { period: '2025Q2', revenue: baseRevenue, grossProfit: baseRevenue * 0.42, operatingProfit: baseRevenue * 0.28, netProfit: baseRevenue * 0.21, assets: baseRevenue * 7.8, liabilities: baseRevenue * 4.8, equity: baseRevenue * 3.0 },
  ]
}

export async function fetchFinancialRatios(_symbol: string): Promise<FinancialRatio | null> {
  return {
    pe: 12.5 + Math.random() * 3,
    pb: 1.8 + Math.random() * 0.5,
    eps: 4500 + Math.random() * 500,
    roe: 18.5 + Math.random() * 2,
    roa: 8.2 + Math.random() * 1,
    beta: 0.9 + Math.random() * 0.3,
    dividendYield: 2.5 + Math.random() * 1,
  }
}

const sectorMap: Record<string, string> = {
  ACB: 'Ngân hàng', VCB: 'Ngân hàng', BID: 'Ngân hàng', CTG: 'Ngân hàng', TCB: 'Ngân hàng', MBB: 'Ngân hàng', STB: 'Ngân hàng', HDB: 'Ngân hàng', VPB: 'Ngân hàng', TPB: 'Ngân hàng',
  VNM: 'Thực phẩm', SAB: 'Thực phẩm', MSN: 'Thực phẩm', KDC: 'Thực phẩm',
  VIC: 'Bất động sản', VHM: 'Bất động sản', NVL: 'Bất động sản', PDR: 'Bất động sản', KDH: 'Bất động sản', DXG: 'Bất động sản',
  VND: 'Chứng khoán', SSI: 'Chứng khoán', HCM: 'Chứng khoán', VCI: 'Chứng khoán', SHS: 'Chứng khoán',
  FPT: 'Công nghệ', CMG: 'Công nghệ',
  GAS: 'Năng lượng', PLX: 'Năng lượng', POW: 'Năng lượng', PGV: 'Năng lượng',
  HPG: 'Thép', NKG: 'Thép', HSG: 'Thép',
  MWG: 'Bán lẻ', PNJ: 'Bán lẻ', PET: 'Bán lẻ',
  VRE: 'Trung tâm thương mại',
  VJC: 'Hàng không', HVN: 'Hàng không',
  GMD: 'Cảng biển', SGP: 'Cảng biển',
  BHN: 'Bia rượu',
}

export async function fetchTopStocks(): Promise<StockInfo[]> {
  const today = getDateStr(0)
  const url = `${API_BASE}/stock_prices?q=date:gte:${today}&sort=nmVolume&size=30`
  try {
    const res = await fetch(url)
    const json = await res.json()
    return (json.data || []).map((item: any) => ({
      symbol: item.code,
      companyName: item.code,
      exchange: item.floor || 'HOSE',
      sector: sectorMap[item.code as string] || 'Khác',
      marketCap: item.close * item.nmVolume || 0,
      price: item.close,
      change: item.change || 0,
      changePercent: item.pctChange || 0,
      volume: item.nmVolume || 0,
    }))
  } catch {
    return []
  }
}

function getDateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}
