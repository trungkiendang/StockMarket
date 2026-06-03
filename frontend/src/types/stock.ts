export interface StockPrice {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockInfo {
  symbol: string
  companyName: string
  exchange: 'HOSE' | 'HNX' | 'UPCOM'
  sector: string
  marketCap: number
  price: number
  change: number
  changePercent: number
  volume: number
}

export interface IndexInfo {
  name: string
  symbol: string
  value: number
  change: number
  changePercent: number
}

export interface FinancialRatio {
  pe: number
  pb: number
  eps: number
  roe: number
  roa: number
  beta: number
  dividendYield: number
}

export interface FinancialReport {
  period: string
  revenue: number
  grossProfit: number
  operatingProfit: number
  netProfit: number
  assets: number
  liabilities: number
  equity: number
}

export interface Alert {
  id: string
  symbol: string
  type: 'above' | 'below'
  value: number
  triggered: boolean
  createdAt: string
}

export interface WatchlistItem {
  symbol: string
  addedAt: string
}
