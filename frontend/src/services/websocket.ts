type MessageHandler = (data: any) => void

export class StockWebSocket {
  private ws: WebSocket | null = null
  private handlers = new Map<string, MessageHandler[]>()
  private url = 'wss://pushstream.vndirect.com.vn/market'

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => console.log('[WS] Connected')
    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const type = msg.type || 'message'
        const handlers = this.handlers.get(type) || []
        handlers.forEach((h) => h(msg))
      } catch { /* ignore parse errors */ }
    }

    this.ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 5s')
      setTimeout(() => this.connect(), 5000)
    }

    this.ws.onerror = (err) => console.error('[WS] Error', err)
  }

  subscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'SP', symbol }))
    }
  }

  unsubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'UNSUBSCRIBE', symbol }))
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, [])
    this.handlers.get(type)!.push(handler)
    return () => {
      const hs = this.handlers.get(type)
      if (hs) this.handlers.set(type, hs.filter((h) => h !== handler))
    }
  }

  disconnect(): void {
    this.ws?.close()
    this.ws = null
  }
}

export const stockWs = new StockWebSocket()
