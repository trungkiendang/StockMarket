import { useRef, useEffect } from 'react'
import * as echarts from 'echarts/core'
import { TreemapChart as EChartsTreemap } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { HeatmapData } from '../types/chart'

echarts.use([EChartsTreemap, TooltipComponent, CanvasRenderer])

interface Props {
  data: HeatmapData[]
  height?: number
}

export default function HeatmapChart({ data, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (!chartRef.current) {
      chartRef.current = echarts.init(containerRef.current, undefined, { renderer: 'canvas' })
    }

    const sectors = [...new Set(data.map((d) => d.sector))]

    const treeData = sectors.map((sector) => ({
      name: sector,
      children: data
        .filter((d) => d.sector === sector)
        .map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: d.changePercent >= 0
              ? `rgba(34, 197, 94, ${Math.min(Math.abs(d.changePercent) / 10, 1)})`
              : `rgba(239, 68, 68, ${Math.min(Math.abs(d.changePercent) / 10, 1)})`,
          },
        })),
    }))

    chartRef.current.setOption({
      tooltip: {
        formatter: (params: any) => {
          const d = params.data
          return `<strong>${d.name}</strong><br/>Vốn hóa: ${(d.value / 1e9).toFixed(2)}B<br/>Thay đổi: ${d.changePercent?.toFixed(2) ?? 'N/A'}%`
        },
      },
      series: [{
        type: 'treemap',
        data: treeData,
        roam: false,
        leafDepth: 1,
        label: {
          show: true,
          formatter: (params: any) => {
            return `${params.name}\n${((params.value ?? 0) / 1e9).toFixed(1)}B`
          },
          fontSize: 11,
          color: '#e5e7eb',
        },
        itemStyle: {
          borderColor: '#1f2937',
          borderWidth: 2,
        },
        levels: [
          {
            colorSaturation: [0.3, 0.6],
            itemStyle: {
              borderColor: '#111827',
              borderWidth: 4,
              gapWidth: 4,
            },
          },
        ],
      }],
    })

    const handleResize = () => chartRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [data])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.resize()
    }
  }, [height])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
