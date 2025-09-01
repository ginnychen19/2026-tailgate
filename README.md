# 2026 尾牙即時彈幕系統

一個含管理後台、觀眾互動與大螢幕顯示的即時彈幕系統。

## 專案結構

```
2026-tailgate/
├── backend/             # 後端：Node.js + Express + Socket.io + Prisma(MySQL)
├── frontend/            # 前端：Vue 3 + Pinia + Tailwind + Vite
├── spec_doct/           # 需求/技術規格/使用者故事
├── zeabur.yaml          # Zeabur 部署設定
├── QUICK_START.md       # 快速啟動指南（詳細）
└── ZEABUR_SETUP.md      # Zeabur 設定指南
```

## 快速開始（最常用）

> 推薦使用 Zeabur 資料庫服務；第一次或調整 schema 時需同步資料庫。

### 每次啟動（本地開發）
1) 啟動後端
```bash
cd backend
npm run dev
```
2) 啟動前端（新終端機）
```bash
cd frontend
npm run dev
```
3) 開啟瀏覽器
- 前端：http://localhost:3000
- 健康檢查：http://localhost:3001/healthz

### 首次初始化（或 schema 有調整時）
1) 建立環境變數檔（在 backend）
```bash
cd backend
copy env.example .env
```
2) 設定 Zeabur 資料庫連線資訊
3) 初始化資料庫
```bash
npm run db:init
```

詳細設定請參考 [ZEABUR_SETUP.md](ZEABUR_SETUP.md)

## 環境變數（後端）
請參考 `backend/env.example`，重點為：
- `DATABASE_URL`：MySQL 連線字串（Zeabur 格式：`mysql://username:password@host:3306/danmaku_live`）
- `REDIS_URL`：Redis 連線字串（Zeabur 格式：`redis://host:6379`）
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- 用戶管理：使用 `backend/config/users.json` 檔案
- `EMOJI_WHITELIST`、`RATE_LIMIT_*`

## 生產部署（Zeabur）
- 依 `zeabur.yaml` 建立：MySQL、Redis、backend、frontend
- `DATABASE_URL` 由 Zeabur MySQL 自動注入
- 後端建置步驟已包含 `prisma migrate deploy`
- 詳見 `DEPLOY.md`

## 常見問題（FAQ）
- Prisma P1001：連不上 DB → 確認 Zeabur 服務是否運行、`DATABASE_URL` 是否正確
- Prisma P3014：shadow DB 權限不足 → 改用 `npm run db:push`
- 前端無法連線：確認後端 3001 埠、CORS、或防火牆設定

## 主要技術
- 前端：Vue 3、Pinia、Tailwind CSS、Vite
- 後端：Express、Socket.io、Prisma（MySQL）
- 快取：Redis

更多內容：請見 `QUICK_START.md`（詳）與 `ZEABUR_SETUP.md`（Zeabur 設定指南）。