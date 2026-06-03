import * as admin from 'firebase-admin'
import { sendAlertNotification } from './bot'

const db = admin.firestore()

export async function checkAlerts() {
  const now = new Date()

  // Get all non-triggered alerts
  const alertsSnapshot = await db.collectionGroup('alerts')
    .where('triggered', '==', false)
    .get()

  if (alertsSnapshot.empty) return

  // Group alerts by symbol
  const alertsBySymbol = new Map<string, any[]>()
  alertsSnapshot.forEach((doc) => {
    const alert = doc.data()
    const alerts = alertsBySymbol.get(alert.symbol) || []
    alerts.push({ ...alert, ref: doc.ref })
    alertsBySymbol.set(alert.symbol, alerts)
  })

  // Check prices for each symbol
  for (const [symbol, alerts] of alertsBySymbol) {
    try {
      const res = await fetch(`https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:${symbol}&sort=date&size=2`)
      const json: any = await res.json()
      const latest = json.data?.[json.data.length - 1]

      if (!latest) continue

      const currentPrice = latest.close

      for (const alert of alerts) {
        const triggered = alert.type === 'above'
          ? currentPrice >= alert.value
          : currentPrice <= alert.value

        if (triggered) {
          // Mark as triggered
          await alert.ref.update({ triggered: true, triggeredAt: now })

          // Send notification
          const direction = alert.type === 'above' ? 'vượt trên' : 'xuống dưới'
          await sendAlertNotification(
            alert.chatId,
            `🚨 *Cảnh báo!*\n\n*${symbol}* đã ${direction} ngưỡng *${Number(alert.value).toLocaleString()}*\nGiá hiện tại: *${currentPrice.toLocaleString()}*`
          )
        }
      }
    } catch (error) {
      console.error(`Error checking alerts for ${symbol}:`, error)
    }
  }
}
