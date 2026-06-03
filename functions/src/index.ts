import * as admin from 'firebase-admin'
import { onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as express from 'express'
import { handleTelegramWebhook, setWebhook } from './bot'
import { checkAlerts } from './alerts'

admin.initializeApp()

// VNDirect API Proxy - avoid CORS
export const stockProxy = onRequest(async (req: express.Request, res: express.Response) => {
  const path = req.path.replace('/api/', '')
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''
  const targetUrl = `https://api-finfo.vndirect.com.vn/v4/${path}${queryString}`

  try {
    const response = await fetch(targetUrl)
    const data: any = await response.json()
    res.set('Access-Control-Allow-Origin', '*')
    res.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

// Telegram Bot Webhook
export const telegramBot = onRequest(async (req: express.Request, res: express.Response) => {
  await handleTelegramWebhook(req, res)
})

// Setup Telegram webhook (run once after deploy)
export const setupTelegramWebhook = onRequest(async (req: express.Request, res: express.Response) => {
  const botUrl = process.env.TELEGRAM_BOT_URL || ''
  if (!botUrl) {
    res.status(400).json({ error: 'TELEGRAM_BOT_URL not set' })
    return
  }
  await setWebhook(`${botUrl}/telegramBot`)
  res.json({ success: true, url: `${botUrl}/telegramBot` })
})

// Scheduled alert checker (every 5 minutes during market hours)
export const scheduledAlertCheck = onSchedule('*/5 9-15 * * 1-5', async () => {
  await checkAlerts()
})
