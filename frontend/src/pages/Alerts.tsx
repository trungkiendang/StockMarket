import { useState } from 'react'
import type { Alert } from '../types/stock'

export default function Alerts() {
  const [symbol, setSymbol] = useState('')
  const [type, setType] = useState<'above' | 'below'>('above')
  const [value, setValue] = useState('')
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('alerts') || '[]')
    } catch { return [] }
  })

  const addAlert = () => {
    if (!symbol || !value) return
    const newAlert: Alert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      type,
      value: Number(value),
      triggered: false,
      createdAt: new Date().toISOString(),
    }
    const updated = [...alerts, newAlert]
    setAlerts(updated)
    localStorage.setItem('alerts', JSON.stringify(updated))
    setSymbol('')
    setValue('')
  }

  const removeAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id)
    setAlerts(updated)
    localStorage.setItem('alerts', JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Cảnh báo giá</h2>
        <p className="text-sm text-gray-400">Thiết lập cảnh báo khi giá chạm ngưỡng</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Tạo cảnh báo mới</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Mã CP</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 w-24 min-w-0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'above' | 'below')}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="above">Cao hơn</option>
              <option value="below">Thấp hơn</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Giá</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 w-28"
            />
          </div>
          <button
            onClick={addAlert}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 h-[38px]"
          >
            Thêm
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Danh sách cảnh báo</h3>
          <span className="text-[10px] text-gray-600">Dữ liệu lưu trên trình duyệt</span>
        </div>
        {alerts.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-sm">Chưa có cảnh báo nào</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  alert.triggered ? 'bg-gray-800/50 opacity-50' : 'bg-gray-800/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-white font-medium">{alert.symbol}</span>
                  <span className={`text-sm ${alert.type === 'above' ? 'text-market-up' : 'text-market-down'}`}>
                    {alert.type === 'above' ? '>' : '<'} {alert.value.toLocaleString('vi-VN')}
                  </span>
                  {alert.triggered && (
                    <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded">Đã kích hoạt</span>
                  )}
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-gray-500 hover:text-red-400 text-sm"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
