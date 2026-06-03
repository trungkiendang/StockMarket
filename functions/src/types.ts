export interface TelegramUser {
  chatId: number
  username?: string
  createdAt: Date
}

export interface WatchlistItem {
  symbol: string
  addedAt: Date
}

export interface PriceAlert {
  id: string
  symbol: string
  type: 'above' | 'below'
  value: number
  triggered: boolean
  chatId: number
  createdAt: Date
}

export interface StockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  time: string
}
