# 🚀 彈幕直播系統 - 快速啟動指南

## 📋 系統需求
- Node.js 18+ 
- MySQL 8.0+
- Redis (可選，用於快取)

## ⚡ 快速啟動

### 方法一：使用批處理文件（推薦）
```bash
# 雙擊執行
start-dev.bat
```

### 方法二：手動啟動

#### 1. 配置環境變數
```bash
# 複製環境變數範例文件
cd backend
copy env.example .env
```

編輯 `backend/.env` 文件，設定以下必要變數：
```env
# 資料庫配置
DATABASE_URL="mysql://username:password@localhost:3306/danmaku_live"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# 允許登入的使用者清單
ALLOWLIST_USERS_JSON='[{"email":"admin@yongrui.tw","name":"Admin","nickname":"Admin","role":"admin"}]'
```

#### 2. 初始化資料庫
```bash
cd backend
npm run db:migrate
```

#### 3. 啟動後端服務
```bash
cd backend
npm run dev
```

#### 4. 啟動前端服務
```bash
cd frontend
npm run dev
```

## 🌐 訪問地址

- **前端首頁**: http://localhost:3000
- **後端 API**: http://localhost:3001
- **健康檢查**: http://localhost:3001/healthz

## 👥 預設管理員帳號

根據 `env.example` 中的設定：
- **Email**: admin@yongrui.tw
- **角色**: 管理員
- **權限**: 完整管理權限

## 🎯 功能測試

### 1. 基本功能測試
1. 訪問 http://localhost:3000
2. 點擊「管理後台」登入
3. 創建一個房間
4. 新增測試用戶到白名單

### 2. 彈幕功能測試
1. 用測試用戶登入
2. 進入觀眾頁面
3. 發送彈幕和表情反應
4. 開啟大螢幕查看效果

### 3. 管理功能測試
1. 在管理後台審核彈幕
2. 管理房間設定
3. 匯出資料

## 🔧 故障排除

### 常見問題

#### 1. 資料庫連線失敗
- 確認 MySQL 服務正在運行
- 檢查 `DATABASE_URL` 設定
- 確認資料庫已創建

#### 2. 前端無法連接到後端
- 確認後端服務在 3001 埠運行
- 檢查 CORS 設定
- 確認防火牆設定

#### 3. Socket.io 連線失敗
- 確認後端 Socket.io 服務正常
- 檢查瀏覽器控制台錯誤訊息

### 日誌查看
- 後端日誌：查看終端機輸出
- 前端日誌：瀏覽器開發者工具 Console

## 📚 更多資訊

- 詳細部署指南：`DEPLOY.md`
- API 文檔：查看 `backend/src/routes/` 目錄
- 資料庫結構：`backend/prisma/schema.prisma`

## 🆘 需要幫助？

如果遇到問題，請檢查：
1. 環境變數配置是否正確
2. 資料庫是否正常運行
3. 所有依賴套件是否已安裝
4. 埠號是否被其他程式佔用
