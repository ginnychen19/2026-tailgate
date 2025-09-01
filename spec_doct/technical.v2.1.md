# Danmaku Live – Technical Specs (MVP)

## 1. 架構與技術
- 前端：Vue 3 + Pinia + Tailwind；大螢幕「雙 Canvas」渲染。
- 後端：Node.js (Express/Fastify) API、Socket.io Gateway。
- 儲存：MySQL 8.0（開發和生產統一）；快取/佇列：Redis（Pub/Sub、RateLimit、Job）。
- ORM：Prisma（可在 SQLite/MySQL/MySQL 8.0 間切換）。
- 部署：Zeabur（服務：web/api/realtime/redis/db），前置 Cloudflare WAF/CDN。

## 2. 認證與授權
### 2.1 名單式免密碼登入（Allowlist Login）
- 流程：輸入 Email → 伺服器查找名單（Email/Name/Nickname/Role）→ 命中則簽發 Access JWT（15m）+ Refresh（7d），並回傳使用者資訊；未命中則 403。
- 名單來源：部署時匯入（CSV/JSON）或環境變數；支援熱更新（Admin API）。
- 不使用：發信/Magic Link、SSO、IP 白名單。

### 2.2 RBAC
- 角色：audience / host / moderator / admin；權限代碼例如 `message:create`、`reaction:send`、`message:approve`、`room:clear`、`rule:update` 等。
- 每次保護操作前，API 以 `hasPermission(user, code)` 檢查；拒絕回 403。

## 3. API 設計（REST）
 - `POST /api/auth/login` { email } → { accessToken, refreshToken, user:{email,name,nickname,role} }
 - `PATCH /api/rooms/:id/theme` { textColor?, speed?, lanes?, fontFamily?, reactionSpawnRate? } （Host/Admin）
- `GET  /api/rooms` （Admin）
- `POST /api/rooms` （Admin）
- `POST /api/rooms/:id/messages`  { content, anonymous }
- `POST /api/rooms/:id/reactions` { emoji, burst? }
- `GET  /api/rooms/:id/messages?status=pending` （Mod）
- `POST /api/messages/:id/approve` （Mod）
- `POST /api/messages/:id/reject`  （Mod）
- `POST /api/rooms/:id/clear` / `pause` / `resume` （Host/Mod）
- `GET  /api/rooms/:id/stats?from=ISO8601&to=ISO8601` （Host/Mod/Admin）
 - `POST /api/export` { roomId, from, to, format:"csv"|"json" } （Admin）
 - `GET  /api/allowlist` （Admin）
 - `POST /api/allowlist` { email, name, nickname, role } （Admin）
 - `DELETE /api/allowlist/:email` （Admin）

### 3.1 輸入驗證（片段）
- content：必須為字串、長度 1–100、移除 HTML、過濾控制字元。
- anonymous：boolean；true 時不覆蓋追蹤欄位。
- emoji：必須屬於白名單 `["👍","😂","😭","🎉"]`。

- theme 變更：
  - textColor：HEX 或 CSS 顏色字串（長度 ≤ 20），建議 `#RRGGBB`。
  - lanes：整數 1–8。
  - speed：數值 0.5–3.0。
  - fontFamily：字串（長度 ≤ 100）。
  - reactionSpawnRate：整數 0–100（每秒最大生成數）。
- allowlist：
  - email：RFC5322 基本格式。
  - name/nickname：字串（長度 ≤ 50）。
  - role：`audience|host|moderator|admin`。

## 4. WebSocket 事件（Socket.io）
- Client→Server：`message.create`、`reaction.send`、`room.join`
- Server→Client（Screen/Host/Mod）：`message.approved`、`message.rejected`、`reaction.push`、`room.cleared`、`room.paused`、`theme.updated`
- 負載：
  - `message.approved` { id, roomId, content, at }
  - `reaction.push` { roomId, emoji, n, mode: "rain"|"burst", at }
  - `theme.updated` { roomId, delta: { textColor?, speed?, lanes?, fontFamily?, reactionSpawnRate? }, at }
  - （可選）給 Audience：`rate.limited` { reason:"device|account", retryAt }

## 5. Rate Limit 與防刷
- Token Bucket（Redis）：key=`rl:{roomId}:{device}`，window=3s，tokens=1。
- 依 `device_hash`（UA+IP+鹽）＋帳號 Email 做雙鍵限制。
- 黑名單：IP / device_hash；白名單：主持端/內網。
 - 觸發節流之 API 回應：HTTP 429；headers：`Retry-After`（秒）、`X-RateLimit-Reset`（epoch ms）；body：{ code:"RATE_LIMITED", message, retryAt }。

## 6. 資料模型（MySQL 8.0）
```sql
-- rooms
id uuid pk, name text, status text, theme JSON, created_at timestamp
-- users
id uuid pk, email text unique, nickname text, role text, device_hash text, created_at timestamp
-- allowlist_users
email text pk, name text, nickname text, role text, created_at timestamp
-- messages
id uuid pk, room_id uuid fk, user_id uuid fk, content text, anonymous boolean, status text, created_at timestamp
-- moderation_rules
id uuid pk, scope text, type text, pattern text, action text, created_at timestamp
-- reactions
id uuid pk, room_id uuid fk, user_id uuid fk, emoji text, mode text, created_at timestamp
-- audit_logs
id uuid pk, actor_id uuid, action text, meta JSON, created_at timestamp
```

- 索引：`messages(room_id, created_at)`、`messages(status)`、`reactions(room_id, created_at)`、`users(email)`、`allowlist_users(email)`。

## 7. 前端渲染（雙 Canvas）

- `DanmakuLayer`：水平滾動、車道避撞、動態速度；DPR 縮放；文字顏色依 room.theme.textColor 即時更新。
- `ReactionLayer`：rain/burst 模式、物件池、採樣降載；spawn rate 依 theme.reactionSpawnRate 動態調整。
- 兩層各自 rAF；或單 rAF 順序繪製兩 canvas。

## 8. Observability

- 日誌：結構化（JSON），含 `trace_id`、`room_id`、`user_id`、`action`。
- 指標：`p95_latency_ms`、`ws_connected`、`msg_qps`、`mod_queue_len`、`errors_total`、`throttled_total`、`export_requests_total`、`theme_updates_total`、`ws_reconnects_total`、`message_dedup_hits_total`。
- 健康檢查：`/healthz`（API：DB/Redis 探針；Realtime：WS 連線/訂閱）。

## 9. 安全

- XSS：服務端過濾、字元白名單；前端 `textContent` 渲染。
- CSP：`default-src 'self'; connect-src 'self' wss://...; img-src 'self' data:`。
- CSRF：僅使用 Bearer JWT；重要操作要求 `origin` 檢查。
- Secrets：Zeabur 管理；生產與測試分離。

## 10. 部署（Zeabur）

- 服務：`web`（前端）、`api`、`realtime`、`redis`、`db`。
- HPA：`realtime` 依 CPU/連線數；`api` 依 RPS。
- 環境變數：

```env
DB_PROVIDER=mysql
DATABASE_URL=mysql://root:password@localhost:3306/danmaku_live
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
ALLOWLIST_USERS_JSON=[{"email":"elizabeth@yongrui.tw","name":"陳畇瑾","nickname":"莎白","role":"audience"}]
EMOJI_WHITELIST=👍,😂,😭,🎉
RATE_LIMIT_MAX=1
RATE_LIMIT_WINDOW=3s
```

## 12. 環境與啟動（Dev/Prod）

- 開發（本機）：
  - `DB_PROVIDER=mysql`，本地 Docker 或直接連 Zeabur MySQL
  - `REDIS_URL=redis://localhost:6379`（啟用以支援節流/事件聚合）
  - 使用 Prisma 管理 MySQL schema 和 migrations
- 上線（Zeabur/雲端）：
  - Zeabur 一鍵部署 MySQL 8.0 服務
  - Redis 為標配（RateLimit、Pub/Sub、Job）
  - 環境變數自動注入，零配置部署

## 11. 測試策略

- 單元：文字驗證、白名單、節流、規則匹配。
- 整合：API→Moderation→Redis→WS；重連與重送。
- E2E：100 並發用戶，連續 10 分鐘；P95 ≤ 1s。
- 安全：XSS、表情白名單繞過測試；滲透基礎掃描。

### (API|介面|接口).*(規格|規範)|API 規格|API 介面
**Idempotency 與節流回應**  
- `POST /api/rooms/:id/messages` 必須接受 Header：`Idempotency-Key`（UUIDv4）。同一 key 重送須回傳相同結果且不重複入列。  
- 超出節流回傳 `429 Too Many Requests`，Headers：`Retry-After`（秒）、`X-RateLimit-Reset`（epoch ms）。  
- 同步透過 WebSocket 發送 `rate.limited { reason, retryAt }` 事件給客戶端。

### WebSocket|即時.*(通訊|通信)|Socket\.?IO
**WebSocket 批次廣播與時間戳**  
- 伺服器以 **50–100ms** 為節拍合併廣播（單批 ≤ 100 則），事件：`danmu.push`，payload 為陣列。  
- 每則訊息增加 `serverTime`（epoch ms）以供端到端延遲量測與動畫對齊。  
- 事件命名：  
  - C → S：`user.login { token }`、`danmu.send { content }`、`heartbeat`  
  - S → C：`danmu.push [{...}]`、`system.slowmode { on, reason }`、`system.pause { on }`、`rate.limited { reason, retryAt }`

### (資料|数据).*(結構|架構)|Redis
**Redis 資料結構與保留**  
- 優先使用 Redis **Stream**：`XADD danmaku:main MAXLEN ~ 1000 * id <uuid> content <text> nickname <text> authorHash <hash> roomId main serverTime <ms>`。  
- 使用者狀態：`users:{email}`（TTL 2h），連線映射：`connections:{socketId} -> email`（TTL 1h）。  
- **資料保留**：所有與活動相關的 key 於 **T+1 天** 自動過期（TTL）。

### (Rate.?Limit|節流|頻率限制)
**節流與錯誤回應**  
- 使用 **Token Bucket**：每使用者 1 rps、burst 3；房間高峰自動啟用慢速模式（5–10s/則/人）。  
- 觸發節流：HTTP 回 `429`（含 `Retry-After`、`X-RateLimit-Reset`），WebSocket 發 `rate.limited`。  
- 去重：同一使用者 2 秒內完全相同內容丟棄（以 `authorHash + normalizedContent` 為鍵）。

## 部署|Deployment
**部署與擴充注意事項**  
- 多實例部署需使用 **socket.io-redis-adapter**，並在負載均衡層啟用 **黏著連線（sticky sessions）**。  
- 反向代理（Nginx/Cloudflare）需開啟 WebSocket 支援並調整 `ping_timeout/ping_interval`（例如 20s/25s）。
