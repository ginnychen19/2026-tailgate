# 用戶管理說明

## 📁 用戶資料檔案
用戶資料存儲在 `backend/config/users.json` 檔案中。

## 🛠️ 管理工具

### 查看所有用戶
```bash
node scripts/manage-users.js list
```

### 添加用戶
```bash
node scripts/manage-users.js add "email@example.com" "用戶名" "暱稱" "audience"
```

### 刪除用戶
```bash
node scripts/manage-users.js remove "email@example.com"
```

## 📝 直接編輯 JSON 檔案
您也可以直接編輯 `backend/config/users.json` 檔案：

```json
[
  {
    "email": "user@example.com",
    "name": "用戶名",
    "nickname": "暱稱",
    "role": "audience"
  },
  {
    "email": "admin@example.com",
    "name": "管理員",
    "nickname": "Admin",
    "role": "admin"
  }
]
```

編輯完成後，運行以下命令同步到資料庫：
```bash
node scripts/init-users-from-json.js
```

## 🔄 初始化資料庫
```bash
npm run db:init
```

## 📊 角色說明
- `audience`: 一般觀眾，可以發送彈幕和表情
- `admin`: 管理員，可以管理房間、用戶和訊息
