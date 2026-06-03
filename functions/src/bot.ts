import { Telegraf, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import * as admin from 'firebase-admin'
import * as express from 'express'

const db = admin.firestore()
const botToken = process.env.TELEGRAM_BOT_TOKEN || ''
const bot = new Telegraf(botToken)

// /start - Register user + help
bot.start(async (ctx: Context) => {
  const chatId = ctx.chat?.id
  const username = ctx.from?.username
  if (chatId) {
    await db.collection('telegram_users').doc(String(chatId)).set({
      chatId,
      username: username || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  await ctx.reply(
    `📈 *StockViz Bot - Cảnh báo chứng khoán*\n\n` +
    `Chào mừng bạn! Dùng các lệnh sau:\n\n` +
    `📌 */watch VNM* - Thêm mã vào watchlist\n` +
    `🗑️ */unwatch VNM* - Xóa khỏi watchlist\n` +
    `📋 */list* - Xem watchlist\n\n` +
    `🔔 */alert VNM 120000* - Báo khi VNM > 120,000\n` +
    `🔔 */alert VNM below 100000* - Báo khi VNM < 100,000\n` +
    `📋 */alerts* - DS cảnh báo\n\n` +
    `💰 */price VNM* - Giá real-time\n` +
    `🔥 */top* - Top tăng/giảm`,
    { parse_mode: 'Markdown' }
  )
})

// /watch <symbol> - Add to watchlist
bot.command('watch', async (ctx: Context) => {
  const chatId = ctx.chat?.id
  const symbol = ctx.message && 'text' in ctx.message
    ? ctx.message.text.split(' ')[1]?.toUpperCase()
    : null

  if (!chatId || !symbol) {
    return ctx.reply('Vui lòng nhập mã cổ phiếu. VD: /watch VNM')
  }

  await db.collection('telegram_users').doc(String(chatId))
    .collection('watchlist').doc(symbol).set({
      symbol,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

  await ctx.reply(`✅ Đã thêm *${symbol}* vào watchlist!`, { parse_mode: 'Markdown' })
})

// /unwatch <symbol> - Remove from watchlist
bot.command('unwatch', async (ctx: Context) => {
  const chatId = ctx.chat?.id
  const symbol = ctx.message && 'text' in ctx.message
    ? ctx.message.text.split(' ')[1]?.toUpperCase()
    : null

  if (!chatId || !symbol) {
    return ctx.reply('Vui lòng nhập mã cổ phiếu. VD: /unwatch VNM')
  }

  await db.collection('telegram_users').doc(String(chatId))
    .collection('watchlist').doc(symbol).delete()

  await ctx.reply(`🗑️ Đã xóa *${symbol}* khỏi watchlist!`, { parse_mode: 'Markdown' })
})

// /list - Show watchlist
bot.command('list', async (ctx: Context) => {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const snapshot = await db.collection('telegram_users').doc(String(chatId))
    .collection('watchlist').get()

  if (snapshot.empty) {
    return ctx.reply('📭 Watchlist trống. Thêm mã bằng /watch VNM')
  }

  const symbols = snapshot.docs.map((doc) => doc.data().symbol)
  const pricePromises = symbols.map(async (s) => {
    try {
      const res = await fetch(`https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:${s}&sort=date&size=2`)
      const json: any = await res.json()
      const latest = json.data?.[json.data.length - 1]
      const prev = json.data?.[json.data.length - 2]
      if (latest) {
        const change = latest.close - (prev?.close ?? latest.close)
        const pct = ((change) / (prev?.close ?? latest.close) * 100)
        const arrow = change >= 0 ? '🟢' : '🔴'
        return `${arrow} *${s}*: ${latest.close.toLocaleString()} (${change >= 0 ? '+' : ''}${change.toFixed(0)} / ${pct.toFixed(2)}%)`
      }
      return `⚪ *${s}*: đang tải...`
    } catch {
      return `⚪ *${s}*: lỗi dữ liệu`
    }
  })

  const lines = await Promise.all(pricePromises)
  await ctx.reply(`📋 *Watchlist của bạn:*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' })
})

// /alert <symbol> <value> - Set price alert
bot.command('alert', async (ctx: Context) => {
  const chatId = ctx.chat?.id
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : ''
  const parts = text.split(' ')
  const symbol = parts[1]?.toUpperCase()
  const type = parts[2] === 'below' ? 'below' : 'above'
  const valueStr = type === 'below' ? parts[3] : parts[2]
  const value = Number(valueStr)

  if (!chatId || !symbol || !value) {
    return ctx.reply('VD: /alert VNM 120000 hoặc /alert VNM below 100000')
  }

  const alertRef = db.collection('telegram_users').doc(String(chatId))
    .collection('alerts').doc()

  await alertRef.set({
    id: alertRef.id,
    symbol,
    type,
    value,
    triggered: false,
    chatId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  await ctx.reply(
    `🔔 Đã tạo cảnh báo: *${symbol}* ${type === 'above' ? '>' : '<'} *${value.toLocaleString()}*`,
    { parse_mode: 'Markdown' }
  )
})

// /alerts - List alerts
bot.command('alerts', async (ctx: Context) => {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const snapshot = await db.collection('telegram_users').doc(String(chatId))
    .collection('alerts').where('triggered', '==', false).get()

  if (snapshot.empty) {
    return ctx.reply('🔔 Không có cảnh báo nào đang hoạt động.')
  }

  const alerts = snapshot.docs.map((doc) => doc.data())
  const lines = alerts.map((a) =>
    `${a.symbol} ${a.type === 'above' ? '>' : '<'} ${Number(a.value).toLocaleString()}`
  )
  await ctx.reply(`🔔 *Cảnh báo đang hoạt động:*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' })
})

// /price <symbol> - Get real-time price
bot.command('price', async (ctx: Context) => {
  const symbol = ctx.message && 'text' in ctx.message
    ? ctx.message.text.split(' ')[1]?.toUpperCase()
    : null

  if (!symbol) return ctx.reply('VD: /price VNM')

  try {
    const res = await fetch(`https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:${symbol}&sort=date&size=2`)
    const json: any = await res.json()
    const latest = json.data?.[json.data.length - 1]
    const prev = json.data?.[json.data.length - 2]

    if (!latest) return ctx.reply(`Không tìm thấy dữ liệu cho ${symbol}`)

    const change = latest.close - (prev?.close ?? latest.close)
    const pct = (change / (prev?.close ?? latest.close) * 100)
    const emoji = change >= 0 ? '🟢' : '🔴'

    await ctx.reply(
      `${emoji} *${symbol}*\n` +
      `Giá: *${latest.close.toLocaleString()}*\n` +
      `Thay đổi: ${change >= 0 ? '+' : ''}${change.toFixed(0)} (${pct.toFixed(2)}%)\n` +
      `KL: ${(latest.volumeMatch || 0).toLocaleString()}`,
      { parse_mode: 'Markdown' }
    )
  } catch {
    await ctx.reply(`❌ Lỗi khi lấy dữ liệu ${symbol}`)
  }
})

// /top - Top stocks
bot.command('top', async (ctx: Context) => {
  try {
    const res = await fetch(`https://finfo-api.vndirect.com.vn/v4/stock_prices?q=date:gte:${getDateStr(-1)}&sort=volumeMatch&size=10`)
    const json: any = await res.json()
    const top = (json.data || []).slice(0, 5)

    const lines = top.map((s: any, i: number) => {
      const emoji = s.priceChangePercent >= 0 ? '🟢' : '🔴'
      return `${i + 1}. ${emoji} *${s.code}*: ${s.close.toLocaleString()} (${s.priceChangePercent?.toFixed(2)}%)`
    })

    await ctx.reply(`🔥 *Top khối lượng hôm nay:*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' })
  } catch {
    await ctx.reply('❌ Lỗi lấy dữ liệu')
  }
})

// Help command
bot.help((ctx: Context) => ctx.reply(
  'Dùng /start để xem hướng dẫn chi tiết'
))

// Webhook handler for Firebase Functions
export async function handleTelegramWebhook(req: express.Request, res: express.Response) {
  try {
    await bot.handleUpdate(req.body)
    res.status(200).send('OK')
  } catch (error) {
    console.error('Bot webhook error:', error)
    res.status(200).send('OK')
  }
}

export async function sendAlertNotification(chatId: number, message: string) {
  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error(`Failed to send alert to ${chatId}:`, error)
  }
}

export async function setWebhook(url: string) {
  await bot.telegram.setWebhook(url)
}

function getDateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}
