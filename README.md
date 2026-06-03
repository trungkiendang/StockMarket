# StockViz - Phân Tích Chứng Khoán Việt Nam

Hệ thống phân tích thị trường chứng khoán Việt Nam với biểu đồ nâng cao và Telegram Bot.  
**Demo:** https://trungkiendang.github.io/StockMarket/

## Tính năng

- **8 trang chức năng**: Dashboard, StockDetail, TechnicalAnalysis, FundamentalAnalysis, Screener, Comparison, Watchlist, Alerts
- **Biểu đồ nâng cao**: Candlestick (LW), Renko, Point & Figure, Heatmap Treemap, Volume Profile, RSI, MACD, MA, Bollinger Bands
- **Telegram Bot**: 11 lệnh (giá real-time, watchlist, cảnh báo giá, top volume)
- **Dữ liệu real-time**: VNDirect Open API (`api-finfo.vndirect.com.vn`)
- **Dark theme**: UI tối ưu cho phân tích
- **Responsive**: Hỗ trợ mobile và desktop

## Tech Stack

| Layer | Cong nghe |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Charts | lightweight-charts (TradingView), ECharts, Recharts, Canvas |
| Backend | Firebase Cloud Functions (Node.js 20) |
| Database | Firestore (NoSQL) |
| Bot | Telegraf |
| Data | VNDirect Open API (free) |

## Cai dat

### Yeu cau
- Node.js 20+
- npm

### Frontend
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # Build vao dist/
```

### Functions (Firebase)
```bash
cd functions
npm install
npm run serve     # Local emulator
```

## Deploy

### GitHub Pages (Frontend)
Push len branch `main` -> GitHub Actions tu dong build & deploy.  
URL: `https://trungkiendang.github.io/StockMarket/`

### Firebase (Backend)
```bash
npm install -g firebase-tools
firebase login
firebase use stockviz-xxxxx
firebase deploy
```

## Telegram Bot Commands

| Command | Mo ta |
|---------|-------|
| `/start` | Dang ky + huong dan |
| `/watch VNM` | Them ma vao watchlist |
| `/unwatch VNM` | Xoa khoi watchlist |
| `/list` | Xem watchlist + gia |
| `/alert VNM 120000` | Bao khi VNM > 120,000 |
| `/price VNM` | Gia real-time |
| `/top` | Top khoi luong hom nay |

## Cau truc

```
├── frontend/          # React App
│   ├── src/
│   │   ├── charts/    # Bieu do
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

## Environment Variables (Functions)

| Variable | Mo ta |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Token tu @BotFather |
| `TELEGRAM_BOT_URL` | Cloud Functions URL |

## Nguon du lieu

- **VNDirect Open API**: `https://api-finfo.vndirect.com.vn/v4/`

## Giay phep

MIT
