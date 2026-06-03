import { useEffect, useRef, useCallback } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, ColorType, type IChartApi } from 'lightweight-charts'
import type { CandlestickData } from '../types/chart'

interface Props {
  data: CandlestickData[]
  volumeData?: { time: CandlestickData['time']; value: number; color?: string }[]
  ma20?: { time: CandlestickData['time']; value: number }[]
  ma50?: { time: CandlestickData['time']; value: number }[]
  height?: number
}

export default function CandlestickChart({ data, volumeData, ma20, ma50, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  const handleResize = useCallback(() => {
    if (containerRef.current && chartRef.current) {
      chartRef.current.resize(containerRef.current.clientWidth, height)
    }
  }, [height])

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        textColor: '#9ca3af',
        background: { type: ColorType.Solid, color: 'transparent' },
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#6366f1', width: 1, style: 2 },
        horzLine: { color: '#6366f1', width: 1, style: 2 },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: { borderColor: '#374151' },
    })

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    })
    candlestickSeries.setData(data)
    chartRef.current = chart

    if (ma20) {
      const ma20Line = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: 'MA20' })
      ma20Line.setData(ma20)
    }

    if (ma50) {
      const ma50Line = chart.addSeries(LineSeries, { color: '#6366f1', lineWidth: 1, title: 'MA50' })
      ma50Line.setData(ma50)
    }

    if (volumeData && volumeData.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      })
      volumeSeries.setData(volumeData)
    }

    chart.timeScale().fitContent()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [data, volumeData, height, handleResize])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}

export function chartTimeToDate(time: CandlestickData['time']): string {
  return String(time)
}
