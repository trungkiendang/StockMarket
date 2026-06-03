import { useRef, useEffect } from 'react'

interface RenkoBrick {
  open: number
  close: number
  high: number
  low: number
  direction: 'up' | 'down'
}

interface Props {
  bricks: RenkoBrick[]
  brickSize?: number
  width?: number
  height?: number
}

export default function RenkoChart({ bricks, brickSize = 1, width = 400, height = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || bricks.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bw = 30
    const bh = 20
    const pad = 30
    ctx.clearRect(0, 0, width, height)

    bricks.forEach((brick, i) => {
      const x = pad + i * (bw + 4)
      const y = height - pad - (bricks.length - i) * bh
      const isUp = brick.direction === 'up'

      ctx.fillStyle = isUp ? '#22c55e' : '#ef4444'
      ctx.strokeStyle = isUp ? '#16a34a' : '#dc2626'
      ctx.lineWidth = 1

      ctx.fillRect(x, y, bw, bh)
      ctx.strokeRect(x, y, bw, bh)
    })

    ctx.fillStyle = '#9ca3af'
    ctx.font = '10px monospace'
    if (bricks.length > 0) {
      ctx.fillText(`${bricks[0].open.toFixed(1)}`, 2, height - pad)
      ctx.fillText(`${bricks[bricks.length - 1].close.toFixed(1)}`, 2, pad + 10)
    }
  }, [bricks, width, height])

  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-xs bg-market-up" /> Tăng
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-xs bg-market-down" /> Giảm
        </span>
        <span>Brick: {brickSize}%</span>
      </div>
      <canvas ref={canvasRef} width={width} height={height} className="bg-gray-900 rounded-lg" />
    </div>
  )
}
