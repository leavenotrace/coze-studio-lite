SHELL := /bin/bash

export API_PORT ?= 8099
export MYSQL_DSN ?= coze:coze_pass@tcp(127.0.0.1:3306)/coze?parseTime=true&charset=utf8mb4

.PHONY: up down migrate server test fmt dev dev-stop

# 启动依赖服务（Docker Compose）
up:
	docker compose up -d

# 停止服务
down:
	docker compose down -v

# 执行数据库迁移
migrate:
	goose -dir ./backend/migrations mysql "$(MYSQL_DSN)" up

# 启动后端服务
server:
	cd backend && API_PORT=$(API_PORT) MYSQL_DSN="$(MYSQL_DSN)" go run ./

# 开发模式：后台启动 backend 与 frontend (studio-lite)
# 将日志写到根目录的 backend.log 与 vite.log，并把 PID 写入 backend.pid 和 vite.pid
dev:
	@echo "Starting backend in background..."
	@cd backend && API_PORT=$(API_PORT) MYSQL_DSN="$(MYSQL_DSN)" nohup go run ./ > ../backend.log 2>&1 & echo $$! > ../backend.pid
	@sleep 1
	@echo "Starting frontend (studio-lite) dev server in background..."
	@sh -c 'cd frontend/apps/studio-lite && nohup npx vite > $(CURDIR)/vite.log 2>&1 & echo $$! > $(CURDIR)/vite.pid'
	@sleep 1
	@echo "backend pid: $$(cat $(CURDIR)/backend.pid || echo none)"
	@echo "vite pid: $$(cat $(CURDIR)/vite.pid || echo none)"

# 停止 dev 模式启动的进程
dev-stop:
	@echo "Stopping dev processes..."
	@[ -f $(CURDIR)/backend.pid ] && kill $$(cat $(CURDIR)/backend.pid) && rm -f $(CURDIR)/backend.pid && echo "killed backend" || echo "no backend.pid"
	@[ -f $(CURDIR)/vite.pid ] && kill $$(cat $(CURDIR)/vite.pid) && rm -f $(CURDIR)/vite.pid && echo "killed vite" || echo "no vite.pid"
	@echo "done"

# Start services bound to 0.0.0.0 on fixed ports so they are reachable from other hosts
# Note: You still need to open firewall/security-group rules and/or NAT port-forwarding.
dev-public:
	@echo "Starting backend (0.0.0.0:${API_PORT}) and frontend (0.0.0.0:5173) for public access..."
	@cd backend && API_PORT=$(API_PORT) MYSQL_DSN="$(MYSQL_DSN)" nohup go run ./ > ../backend.log 2>&1 & echo $$! > ../backend.pid
	@sleep 1
	@sh -c 'cd frontend/apps/studio-lite && nohup npx vite --host 0.0.0.0 --port 5173 > $(CURDIR)/vite.log 2>&1 & echo $$! > $(CURDIR)/vite.pid'
	@sleep 1
	@echo "backend pid: $$(cat $(CURDIR)/backend.pid || echo none)"
	@echo "vite pid: $$(cat $(CURDIR)/vite.pid || echo none)"

# 单元测试
test:
	cd backend && go test ./...

# 格式化代码
fmt:
	cd backend && go fmt ./...