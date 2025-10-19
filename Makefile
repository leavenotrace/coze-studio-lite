SHELL := /bin/bash

export API_PORT ?= 8099
export MYSQL_DSN ?= coze:coze_pass@tcp(127.0.0.1:3306)/coze?parseTime=true&charset=utf8mb4

.PHONY: up down migrate server test fmt

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

# 单元测试
test:
	cd backend && go test ./...

# 格式化代码
fmt:
	cd backend && go fmt ./...