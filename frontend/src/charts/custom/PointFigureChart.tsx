import { useRef, useEffect } from 'react'

interface PointFigureColumn {
  direction: 'X' | 'O'
  count: number
  startPrice: number
  endPrice: number
}

interface Props {
  columns: PointFigureColumn[]
  boxSize?: number
  reversal?: number
  width?: number
  height?: number
}

export default function PointFigureChart({ columns, boxSize = 1, width = 400, height = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || columns.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cell = 16
    const pad = 30
    ctx.clearRect(0, 0, width, height)

    ctx.font = `${cell - 4}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    columns.forEach((col, ci) => {
      const x = pad + ci * (cell + 4)
      const isX = col.direction === 'X'

      ctx.fillStyle = isX ? '#22c55e' : '#ef4444'

      for (let i = 0; i < col.count; i++) {
        const y = height - pad - (i + 1) * cell
        ctx.fillText(col.direction, x + cell / 2, y + cell / 2)
      }
    })

    ctx.fillStyle = '#9ca3af'
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    if (columns.length > 0) {
      ctx.fillText(`${columns[0].startPrice.toFixed(1)}`, 2, height - pad + 14)
      ctx.fillText(`${columns[columns.length - 1].endPrice.toFixed(1)}`, 2, pad - 4)
    }
  }, [columns, width, height])

  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="text-market-up font-bold">X</span> Tăng
        </span>
        <span className="flex items-center gap-1">
          <span className="text-market-down font-bold">O</span> Giảm
        </span>
        <span>Box: {boxSize}%</span>
      </div>
      <canvas ref={canvasRef} width={width} height={height} className="bg-gray-900 rounded-lg" />
    </div>
  )
}
