# 部署指南 - Danmaku Live

## Zeabur 部署步驟

### 1. 準備工作
- 確保您有 Zeabur 帳號
- 將專案推送到 Git 儲存庫（GitHub, GitLab 等）

### 2. 建立 Zeabur 專案
1. 登入 Zeabur Dashboard
2. 點擊 "Create Project"
3. 連接您的 Git 儲存庫

### 3. 部署服務

#### 3.1 部署 MySQL 資料庫
1. 在專案中點擊 "Deploy New Service"
2. 選擇 "Deploy MySQL Service"
3. 等待部署完成

#### 3.2 部署 Redis
1. 點擊 "Deploy New Service" 
2. 選擇 "Deploy Redis Service"
3. 等待部署完成

#### 3.3 部署後端服務
1. 點擊 "Deploy New Service"
2. 選擇 "Deploy from Source Code"
3. 選擇您的 Git 儲存庫
4. 設定根目錄為 `backend`
5. 配置環境變數：
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   ALLOWLIST_USERS_JSON=[{"email":"elizabeth@yongrui.tw","name":"陳畇瑾","nickname":"莎白","role":"audience"},{"email":"admin@yongrui.tw","name":"Admin","nickname":"Admin","role":"admin"}]
   EMOJI_WHITELIST=👍,😂,😭,🎉
   RATE_LIMIT_MAX=1
   RATE_LIMIT_WINDOW=3000
   ```

#### 3.4 部署前端服務
1. 點擊 "Deploy New Service"
2. 選擇 "Deploy from Source Code" 
3. 選擇您的 Git 儲存庫
4. 設定根目錄為 `frontend`
5. Zeabur 會自動偵測並部署

### 4. 設定網域
- 在 Zeabur Dashboard 中為前端服務設定自訂網域
- 後端服務會自動獲得內部網域供前端呼叫

### 5. 初始化資料庫
後端服務首次啟動時會自動：
- 執行 `prisma generate`
- 執行 `prisma migrate deploy` 建立資料表

## 本地開發

### 後端
```bash
cd backend
npm install
cp env.example .env  # 編輯環境變數
npm run db:migrate    # 建立資料庫結構
npm run dev          # 啟動開發伺服器
```

### 前端
```bash
cd frontend
npm install
npm run dev          # 啟動開發伺服器
```

## 環境變數說明

### 後端必需變數
- `DATABASE_URL`: MySQL 連線字串（Zeabur 自動注入）
- `REDIS_URL`: Redis 連線字串（Zeabur 自動注入）
- `JWT_SECRET`: JWT 簽章密鑰
- `JWT_REFRESH_SECRET`: Refresh token 簽章密鑰
- `ALLOWLIST_USERS_JSON`: 允許登入的使用者清單（JSON 格式）

### 可選變數
- `PORT`: 伺服器埠號（預設 3001）
- `NODE_ENV`: 環境類型（development/production）
- `EMOJI_WHITELIST`: 允許的表情符號清單
- `RATE_LIMIT_MAX`: 速率限制次數
- `RATE_LIMIT_WINDOW`: 速率限制時間窗口（毫秒）