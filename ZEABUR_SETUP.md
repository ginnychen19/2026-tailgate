# Zeabur 設定指南

## 🚀 使用 Zeabur 資料庫服務

### 1. 在 Zeabur 創建服務

#### MySQL 資料庫
1. 登入 [Zeabur](https://zeabur.com)
2. 點擊 "New Service"
3. 選擇 "MySQL"
4. 等待服務創建完成
5. 複製連線資訊

#### Redis 快取
1. 點擊 "New Service"
2. 選擇 "Redis"
3. 等待服務創建完成
4. 複製連線資訊

### 2. 設定環境變數

在 `backend/.env` 檔案中設定：

```env
# 資料庫配置 (Zeabur)
DATABASE_URL="mysql://username:password@your-zeabur-mysql-host:3306/danmaku_live"

# Redis 配置 (Zeabur)
REDIS_URL="redis://your-zeabur-redis-host:6379"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# 應用程式配置
NODE_ENV="development"
PORT=3001

# 用戶管理
# 使用 backend/config/users.json 檔案來管理用戶

# 表情符號白名單
EMOJI_WHITELIST="👍,😂,😭,🎉"

# 速率限制配置
RATE_LIMIT_MAX=1
RATE_LIMIT_WINDOW=3000

# 日誌配置
LOG_LEVEL="info"
```

### 3. 初始化資料庫

```bash
cd backend
npm run db:init
```

### 4. 啟動後端

```bash
npm run dev
```

## 🎯 優點

- ✅ 不需要本地 Docker
- ✅ 展示更方便
- ✅ 資料庫穩定可靠
- ✅ 可以從任何地方連線
- ✅ 自動備份

## 📊 連線資訊範例

### MySQL 連線字串格式
```
mysql://username:password@host:port/database
```

### Redis 連線字串格式
```
redis://host:port
```

## 🔧 故障排除

### 連線失敗
1. 檢查連線字串是否正確
2. 確認 Zeabur 服務是否運行
3. 檢查防火牆設定

### 資料庫初始化失敗
1. 確認 DATABASE_URL 格式正確
2. 檢查資料庫權限
3. 確認資料庫名稱存在
