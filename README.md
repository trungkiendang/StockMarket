# StockViz - Phân Tích Chứng Khoán Việt Nam

Hệ thống phân tích thị trường chứng khoán Việt Nam với biểu đồ nâng cao và Telegram Bot.

## 🚀 Tính năng

- **8 trang chức năng**: Dashboard, StockDetail, TechnicalAnalysis, FundamentalAnalysis, Screener, Comparison, Watchlist, Alerts
- **Biểu đồ nâng cao**: Candlestick (LW), Renko, Point & Figure, Heatmap Treemap, Volume Profile, RSI, MACD, MA, Bollinger Bands
- **Telegram Bot**: 11 lệnh (giá real-time, watchlist, cảnh báo giá, top volume)
- **Dữ liệu real-time**: VNDirect Open API + WebSocket
- **Dark theme**: UI tối ưu cho phân tích

## 🛠 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Charts | lightweight-charts (TradingView), ECharts, Recharts, Canvas |
| Backend | Firebase Cloud Functions (Node.js 20) |
| Database | Firestore (NoSQL) |
| Bot | Telegraf |
| Data | VNDirect Open API (free) |

## 📦 Cài đặt

### Yêu cầu
- Node.js 20+
- npm

### Frontend
```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

### Functions (Firebase)
```bash
cd functions
npm install
npm run serve   # Local emulator
```

## 🚢 Deploy

### GitHub Pages (Frontend)
1. Push lên branch `main` → GitHub Actions tự động build & deploy
2. Vào Settings → Pages → chọn source "GitHub Actions"

### Firebase (Backend)
```bash
# Cài firebase-tools
npm install -g firebase-tools

# Login
firebase login

# Set project
firebase use stockviz-xxxxx

# Deploy
firebase deploy

# Setup Telegram webhook (sau deploy)
curl https://us-central1-stockviz-xxxxx.cloudfunctions.net/setupTelegramWebhook
```

## 🤖 Telegram Bot Commands

| Command | Mô tả |
|---------|-------|
| `/start` | Đăng ký + hướng dẫn |
| `/watch VNM` | Thêm mã vào watchlist |
| `/unwatch VNM` | Xóa khỏi watchlist |
| `/list` | Xem watchlist + giá |
| `/alert VNM 120000` | Báo khi VNM > 120,000 |
| `/price VNM` | Giá real-time |
| `/top` | Top khối lượng hôm nay |

## 📁 Cấu trúc

```
├── frontend/          # React App
│   ├── src/
│   │   ├── charts/    # Biểu đồ
│   │   ├── pages/     # 8 trang
│   │   ├── services/  # API + WebSocket
│   │   └── utils/     # Indicators + Format
│   └── dist/          # Build output
├── functions/         # Firebase Cloud Functions
│   └── src/
│       ├── index.ts   # http endpoints
│       ├── bot.ts     # Telegram bot
│       └── alerts.ts  # Alert scheduler
├── firebase.json
└── .github/workflows/ # CI/CD
```

## 🔧 Environment Variables (Functions)

| Variable | Mô tả |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Token từ @BotFather |
| `TELEGRAM_BOT_URL` | Cloud Functions URL |

## 📊 Nguồn dữ liệu

- **VNDirect Open API**: `https://finfo-api.vndirect.com.vn/v4/`
- **Push Stream**: `wss://pushstream.vndirect.com.vn/market`

## 📝 Giấy phép

MIT
