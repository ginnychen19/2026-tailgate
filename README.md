# 2026 尾牙即時彈幕系統

## 專案結構

```
2026-tailgate/
├── frontend/          # Vue 3 + Pinia + Tailwind CSS 前端
├── backend/           # Node.js + Express + Socket.io 後端  
├── requirements.md    # 詳細需求文件
├── need.txt          # 原始需求記錄
└── pic/              # 設計參考圖片
```

## 快速開始

### 前端 (Vue)
```bash
cd frontend
npm install
npm run dev
```

### 後端 (Node.js) 
```bash
cd backend
npm install
npm run dev
```

### Redis (本地安裝)
```bash
redis-server
```

## 技術棧
- **前端**: Vue 3 + Composition API + Pinia + Tailwind CSS
- **後端**: Node.js + Express + Socket.io
- **資料庫**: Redis
- **即時通信**: WebSocket

## 功能特色
- 🎮 即時彈幕系統
- 📱 響應式設計 (手機 + 大螢幕)
- 👤 工作帳號登入 + 自定義暱稱
- 🎨 彈幕動畫效果
- 🚀 高效能即時通信