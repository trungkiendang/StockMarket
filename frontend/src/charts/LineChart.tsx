import { useEffect, useRef } from 'react'
import { createChart, LineSeries, AreaSeries, ColorType, type IChartApi } from 'lightweight-charts'
import type { LineData } from '../types/chart'

interface Props {
  data: LineData[]
  color?: string
  fillColor?: string
  height?: number
  title?: string
}

export default function LineChart({ data, color = '#6366f1', fillColor, height = 200, title }: Props) {
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
        visible: false,
      },
      rightPriceScale: { borderColor: '#374151', visible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
    })

    if (fillColor) {
      const series = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: fillColor,
        bottomColor: 'transparent',
        lineWidth: 2,
        title,
      })
      series.setData(data)
    } else {
      const series = chart.addSeries(LineSeries, { color, lineWidth: 2, title })
      series.setData(data)
    }

    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current) {
        chart.resize(containerRef.current.clientWidth, height)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [data, color, fillColor, height, title])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
