import { useRef, useEffect } from 'react'
import { createChart, HistogramSeries, ColorType, type IChartApi } from 'lightweight-charts'

interface VolumeLevel {
  price: number
  volume: number
}

interface Props {
  data: VolumeLevel[]
  height?: number
}

export default function VolumeProfile({ data, height = 300 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

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
      timeScale: { visible: false },
      rightPriceScale: { borderColor: '#374151' },
    })

    const maxVol = Math.max(...data.map((d) => d.volume))
    const histogramSeries = chart.addSeries(HistogramSeries, {
      color: '#6366f1',
      priceFormat: { type: 'volume' },
    })

    const chartData = data.map((d) => ({
      time: (d.price * 1000) as any,
      value: d.volume,
      color: d.volume === maxVol ? '#f59e0b' : '#6366f1',
    }))

    histogramSeries.setData(chartData)
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
  }, [data, height])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
