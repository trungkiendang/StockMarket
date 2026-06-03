import type { IndicatorResult } from '../types/chart'
import type { Time } from 'lightweight-charts'

export function calcSMA(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) sum += data[j]
      result.push(sum / period)
    }
  }
  return result
}

export function calcEMA(data: number[], period: number): number[] {
  const result: number[] = []
  const k = 2 / (period + 1)
  result.push(data[0])
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k))
  }
  return result
}

export function calcRSI(data: number[], period = 14): number[] {
  const result: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1]
    gains.push(diff > 0 ? diff : 0)
    losses.push(diff < 0 ? -diff : 0)
  }

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN)
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      result.push(100 - 100 / (1 + rs))
    }
  }
  return result
}

export function calcMACD(data: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calcEMA(data, 12)
  const ema26 = calcEMA(data, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signal = calcEMA(macdLine, 9)
  const histogram = macdLine.map((v, i) => v - signal[i])
  return { macd: macdLine, signal, histogram }
}

export function calcBollingerBands(data: number[], period = 20, multiplier = 2) {
  const sma = calcSMA(data, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
    } else {
    const slice = data.slice(i - period + 1, i + 1)
    const mean = sma[i]
    const variance = slice.reduce((sum: number, v: number) => sum + (v - mean) ** 2, 0) / period
    const std = Math.sqrt(variance)
      upper.push(mean + multiplier * std)
      lower.push(mean - multiplier * std)
    }
  }
  return { middle: sma, upper, lower }
}

export function indicatorsToSeries(
  times: Time[],
  values: number[]
): IndicatorResult[] {
  return times.map((time, i) => ({ time, value: values[i] })).filter((v) => !isNaN(v.value))
}

export function macdToSeries(times: Time[], macdData: { macd: number[]; signal: number[]; histogram: number[] }) {
  return {
    macd: times.map((t, i) => ({ time: t, value: macdData.macd[i] })).filter((v) => !isNaN(v.value)),
    signal: times.map((t, i) => ({ time: t, value: macdData.signal[i] })).filter((v) => !isNaN(v.value)),
    histogram: times.map((t, i) => ({ time: t, value: macdData.histogram[i], color: macdData.histogram[i] >= 0 ? '#22c55e' : '#ef4444' })),
  }
}
