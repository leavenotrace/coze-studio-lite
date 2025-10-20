# Coze Studio Lite — 使用说明（中文）

> 这是项目的简体中文使用说明，包含本地开发、迁移和快速测试的步骤。

## 目录
- 简介
- 本地开发（后端 + 前端）
- 数据库迁移
- Tailwind / DaisyUI 说明
- 快速创建测试用户（curl）
- 常见问题

## 简介
Coze Studio Lite 是一个轻量的前后端示例仓库。前端使用 Vite + React（TypeScript），并演示了使用 TailwindCSS 与 DaisyUI 做快速 UI；后端使用 Go（Hertz 框架）与 GORM 连接 MySQL，提供简易的 prompts 和认证（register/login）的接口。

## 本地开发
先确保你本机能运行 Docker 或本地安装了 MySQL（项目的默认 DSN 为 `coze:coze_pass@tcp(127.0.0.1:3306)/coze`）。

1. 启动后端（在仓库 root）：

```bash
# 在 backend 目录构建并运行
cd backend
# 推荐直接在终端运行以便看到日志
go run .
```

默认监听端口：8099（可通过环境变量 `API_PORT` 修改）。

2. 启动前端（studio-lite app）:

```bash
cd frontend/apps/studio-lite
npm install
npm run dev
```

- Vite 会在 5173 启动 dev server（若 5173 被占用会自动换端口，请以终端输出为准）。
- 前端已设置 proxy：`/api` 会被代理到 `http://127.0.0.1:8099`，以便本地开发时避免跨域。

3. 停止 dev 服务
- 若以后台方式运行（例如用 nohup），请记录并 `kill <pid>` 停止，或使用你常用的进程管理工具。

## 数据库迁移
仓库 `migrations/` 中包含 SQL 文件：
- `20251020_create_users.sql` — 创建 users 表
- `20251021_add_owner_to_prompts.sql` — 为 prompts 表添加 owner_id

你可以用 mysql 客户端手动执行：

```bash
mysql -h 127.0.0.1 -P 3306 -u coze -pcoze_pass coze < migrations/20251020_create_users.sql
mysql -h 127.0.0.1 -P 3306 -u coze -pcoze_pass coze < migrations/20251021_add_owner_to_prompts.sql
```

注意：项目在开发过程中可能已经对数据库做过部分修改。因此如果运行迁移时报重复列或表存在，请按实际数据库状态调整（跳过已应用的迁移）。

## Tailwind / DaisyUI
- 前端使用 Tailwind CSS + DaisyUI。若样式没有生效，请确保 dev server 使用的 Vite 实例的工作目录是 `frontend/apps/studio-lite`（仓库可能存在多个 Vite 实例，会导致错误的根目录被服务）。
- 如果遇到 CSS 报 500 / PostCSS 错误，通常是 PostCSS 插件配置或 Tailwind 版本不兼容导致的（本仓库在 `frontend` 根安装了必要插件）。

## 快速创建测试用户
如果想快速创建一个测试用户用于登录/验证，可以运行：

```bash
curl -v -X POST http://127.0.0.1:8099/api/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"bob@happyshare.io","password":"pass"}'
```

登录（获取 token）：

```bash
curl -v -X POST http://127.0.0.1:8099/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"bob@happyshare.io","password":"pass"}'
```

返回的 JSON 中包含 `token` 字段，前端会把它保存到 localStorage（key: `auth.token`），并在后续请求中通过 `Authorization: Bearer <token>` 发送。

## 常见问题
- Q: 页面没有样式 / CSS 返回 HTML？
  - A: 请检查是否启动了正确的 Vite 实例（cwd 应为 `frontend/apps/studio-lite`），并注意终端输出的端口（Vite 若遇到 5173 被占用会自动切换端口）。

- Q: 登录返回 401 / "record not found"？
  - A: 说明该用户未在 DB 中注册。先执行 Register（UI 或上面的 curl），再 Login。

- Q: JWT 秘钥是哪里？
  - A: 当前为开发模式的硬编码值（在 `backend/pkg/auth/auth.go`），生产请通过环境变量注入并使用更安全的策略（HttpOnly cookie、refresh token 等）。

## 贡献
欢迎提交 PR 或 issue。若要本地开发并提交，请在提交前运行基本校验并写简短说明。

---
若你希望我把该 README 的内容合入项目根 `README.md`（替代或追加），或把其翻成繁体、添加更多中文示例（比如截图、演示命令），告诉我我会继续完成并 push 到远端。
