# 2026 尾牙即時彈幕系統

## 專案結構

```
2026-tailgate/
├── frontend/            # 前端：Vue 3 + Pinia + Tailwind + Vite
├── backend/             # 後端：Node.js + Express/Fastify + Socket.io
├── spec_doct/           # 需求/技術規格/使用者故事
├── pic/                 # 設計參考圖片
└── README.md
```

## 本地開發（Local Dev）

### 先決條件
- Node.js 18+（建議 20+）
- Redis（本機或 Docker）

安裝 Redis（Windows 可用 Docker）：
```bash
docker run --name redis -p 6379:6379 -d redis:7
```

### 後端（backend）
```bash
cd backend
npm install
# 建立 .env（範例見下方）
npm run dev
```

後端 .env 範例（放在 backend/.env）：
```env
DB_PROVIDER=sqlite # sqlite|postgres|mysql
DATABASE_URL=file:./dev.db
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret
ALLOWLIST_USERS_JSON=[{"email":"elizabeth@yongrui.tw","name":"陳畇瑾","nickname":"莎白","role":"audience"}]
EMOJI_WHITELIST=👍,😂,😭,🎉
RATE_LIMIT_MAX=1
RATE_LIMIT_WINDOW=3s
```

### 前端（frontend，使用 Vite 開發/打包）
```bash
cd frontend
npm install
# 建立 .env.local（範例見下方）
npm run dev      # 由 Vite 啟動開發伺服器
```

前端環境變數（frontend/.env.local）：
```env
VITE_API_BASE=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
```

> 本專案前端使用 Vite 作為開發伺服器與打包工具（更快的 HMR 與精簡產出）。

### 同時啟動
- 開兩個 Terminal：一個跑 `backend`，一個跑 `frontend`。
- 確保 Redis 正在運行（本機或 Docker）。

## 建置與預覽（Frontend with Vite）
```bash
cd frontend
npm run build     # Vite 打包
npm run preview   # 本地預覽產出
```

## 主要技術
- 前端：Vue 3 + Pinia + Tailwind CSS + Vite
- 後端：Node.js + Express/Fastify + Socket.io
- 儲存：Dev=SQLite；Prod=PostgreSQL 或 MySQL（以 ORM 隔離）
- 快取/佇列：Redis（RateLimit、Pub/Sub、Job）

## 常見問題（FAQ）
- 前端無法連到後端：請確認 `VITE_API_BASE`、`VITE_WS_URL` 與實際服務埠一致。
- 429 被節流：等候 `Retry-After` 秒數再重試；或降低送訊頻率。
- Redis 未啟動：請先啟動 Redis，或調整 `REDIS_URL` 指向可用的 Redis 服務。