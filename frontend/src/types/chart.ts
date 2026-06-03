import type { Time } from 'lightweight-charts'

export interface CandlestickData {
  time: Time
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface LineData {
  time: Time
  value: number
}

export interface HistogramData {
  time: Time
  value: number
  color?: string
}

export interface HeatmapData {
  name: string
  value: number
  sector: string
  changePercent: number
}

export interface SectorRotation {
  sector: string
  value: number
  maxValue: number
}

export interface IndicatorResult {
  time: Time
  value: number
}

export interface MACDResult {
  time: Time
  macd: number
  signal: number
  histogram: number
}

export interface RenkoBrick {
  open: number
  high: number
  low: number
  close: number
  direction: 'up' | 'down'
}

export interface PointFigureColumn {
  direction: 'X' | 'O'
  count: number
  startPrice: number
  endPrice: number
}
