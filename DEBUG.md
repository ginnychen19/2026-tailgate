# 🚨 問題診斷與修復指南

## 快速修復步驟

### 1. 檢查並修復主要問題

我已經修復了以下問題：
- ✅ **前端驗證邏輯**：在 main.ts 加入 `authStore.initializeAuth()`
- ✅ **API URL**：改用相對路徑讓 Vite 代理處理
- ✅ **Socket.io 連線**：移除硬編碼 URL
- ✅ **錯誤處理中間件**：已正確建立

### 2. 啟動系統步驟

#### 步驟 A：啟動後端
```bash
# 1. 進入後端目錄
cd backend

# 2. 確保資料庫連線正確（檢查 .env 檔案）
# 如果使用本地 MySQL，確保服務已啟動

# 3. 初始化資料庫
npm run db:push

# 4. 初始化使用者和房間
npm run db:setup

# 5. 啟動後端
npm run dev
```

#### 步驟 B：啟動前端
```bash
# 在新的終端視窗
cd frontend
npm run dev
```

### 3. 測試登入流程

1. 打開瀏覽器到 `http://localhost:3000`
2. 系統應該自動跳轉到 `/login`
3. 嘗試登入：
   - **測試管理員**：`admin@yongrui.tw`
   - **測試使用者**：`elizabeth@yongrui.tw`

### 4. 常見問題診斷

#### 問題 A：「無法發送對話」
**可能原因**：
- 後端 API 沒有啟動
- 資料庫連線問題
- JWT token 問題

**檢查步驟**：
```bash
# 1. 檢查後端是否在運行
curl http://localhost:3001/healthz

# 2. 檢查登入 API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"elizabeth@yongrui.tw"}'

# 3. 檢查瀏覽器 Network 標籤的錯誤訊息
```

#### 問題 B：「路由跳轉問題」
**檢查**：
- 打開瀏覽器開發者工具 Console
- 看是否有 Vue Router 相關錯誤

#### 問題 C：「資料庫連線失敗」
**檢查**：
```bash
# 檢查 MySQL 是否啟動
# Windows: 檢查服務管理員中的 MySQL 服務
# 或使用 XAMPP 等工具

# 測試資料庫連線
cd backend
npm run db:push
```

### 5. 偵錯技巧

#### 前端偵錯
```javascript
// 在瀏覽器 Console 中檢查登入狀態
console.log('Auth Store:', window.localStorage.getItem('accessToken'))
console.log('User:', window.localStorage.getItem('user'))
```

#### 後端偵錯
```bash
# 檢查後端日誌
cd backend
npm run dev
# 觀察 Console 輸出的錯誤訊息
```

## 完整重新開始（如果都不行）

```bash
# 1. 清理並重新安裝
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend  
rm -rf node_modules package-lock.json
npm install

# 2. 重新初始化資料庫
cd ../backend
npm run db:push
npm run db:setup

# 3. 重新啟動
npm run dev  # 後端

# 新終端
cd ../frontend
npm run dev  # 前端
```

## 聯絡資訊
如果問題持續，請提供以下資訊：
- 瀏覽器 Console 的錯誤訊息
- 後端 Console 的錯誤訊息  
- Network 標籤中 API 請求的狀態碼