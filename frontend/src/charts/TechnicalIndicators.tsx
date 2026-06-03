import { useEffect, useRef } from 'react'
import { createChart, LineSeries, HistogramSeries, ColorType, type IChartApi } from 'lightweight-charts'
import type { IndicatorResult } from '../types/chart'

interface Props {
  indicators: {
    title: string
    data: IndicatorResult[]
    color?: string
    fillColor?: string
    type?: 'line' | 'histogram'
  }[]
  height?: number
}

export default function TechnicalIndicators({ indicators, height = 200 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

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
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
      },
      rightPriceScale: { borderColor: '#374151' },
      crosshair: {
        mode: 0,
        vertLine: { color: '#6366f1', width: 1, style: 2 },
        horzLine: { color: '#6366f1', width: 1, style: 2 },
      },
    })

    indicators.forEach((ind) => {
      if (ind.type === 'histogram') {
        const series = chart.addSeries(HistogramSeries, {
          color: ind.color || '#6366f1',
          priceFormat: { type: 'volume' },
        })
        series.setData(
          ind.data.map((d) => ({
            time: d.time,
            value: d.value,
            color: d.value >= 0 ? '#22c55e' : '#ef4444',
          }))
        )
      } else {
        const series = chart.addSeries(LineSeries, {
          color: ind.color || '#6366f1',
          lineWidth: 2,
        })
        series.setData(ind.data)
      }
    })

    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current) chart.resize(containerRef.current.clientWidth, height)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [indicators, height])

  return (
    <div className="space-y-1">
      <div className="flex gap-4 text-xs text-gray-400">
        {indicators.map((ind) => (
          <span key={ind.title} className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: ind.color || '#6366f1' }} />
            {ind.title}
          </span>
        ))}
      </div>
      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  )
}
