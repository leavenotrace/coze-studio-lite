package api

import (
	"context"
	"net/http"
	"os"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"

	"github.com/coze-dev/coze-studio/backend/application"
    "github.com/coze-dev/coze-studio/backend/pkg/auth"
)

type H = map[string]any

func Run() error {
	port := ":" + getEnv("API_PORT", "8099")
	h := server.Default(server.WithHostPorts(port))

	// 依赖注入（服务编排）
	appsvc := application.New(
		getEnv("MYSQL_DSN", "coze:coze_pass@tcp(127.0.0.1:3306)/coze?parseTime=true&charset=utf8mb4"),
	)

	// 健康检查
	h.GET("/healthz", func(c context.Context, ctx *app.RequestContext) {
		ctx.String(http.StatusOK, "ok")
	})

	// Prompt 最小化接口：列表、创建
	r := h.Group("/api")
	r.GET("/prompts", func(c context.Context, ctx *app.RequestContext) {
		data, err := appsvc.Prompts.List(c)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, H{"code": 500, "msg": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, H{"code": 0, "data": data})
	})
	r.POST("/prompts", func(c context.Context, ctx *app.RequestContext) {
		var in struct {
			Name string   `json:"name"`
			Body string   `json:"body"`
			Tags []string `json:"tags"`
		}
		if err := ctx.Bind(&in); err != nil {
			ctx.JSON(http.StatusBadRequest, H{"code": 400, "msg": "bad request"})
			return
		}
		p, err := appsvc.Prompts.Create(c, in.Name, in.Body, in.Tags)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, H{"code": 500, "msg": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, H{"code": 0, "data": p})
	})

	// Auth: register
	r.POST("/register", func(c context.Context, ctx *app.RequestContext) {
		var in struct{
			Email string `json:"email"`
			Password string `json:"password"`
		}
 		if err := ctx.Bind(&in); err != nil {
 			ctx.JSON(http.StatusBadRequest, H{"code":400, "msg":"bad request"}); return
 		}
 		u, err := appsvc.Users.Register(c, in.Email, in.Password)
 		if err != nil { ctx.JSON(http.StatusInternalServerError, H{"code":500, "msg":err.Error()}); return }
 		ctx.JSON(http.StatusOK, H{"code":0, "data":u})
 	})

	// Auth: login
	r.POST("/login", func(c context.Context, ctx *app.RequestContext) {
		var in struct{
			Email string `json:"email"`
			Password string `json:"password"`
		}
		if err := ctx.Bind(&in); err != nil { ctx.JSON(http.StatusBadRequest, H{"code":400, "msg":"bad request"}); return }
		u, err := appsvc.Users.Login(c, in.Email, in.Password)
		if err != nil { ctx.JSON(http.StatusUnauthorized, H{"code":401, "msg":err.Error()}); return }
		// issue JWT
		tok, terr := auth.GenerateToken(u.ID)
		if terr != nil { ctx.JSON(http.StatusInternalServerError, H{"code":500, "msg":terr.Error()}); return }
		ctx.JSON(http.StatusOK, H{"code":0, "data": map[string]any{"user": u, "token": tok}})
	})

		// 新增：PUT /api/prompts/:id
		r.PUT("/prompts/:id", func(c context.Context, ctx *app.RequestContext) {
			id := string(ctx.Param("id"))
			var in struct {
				Name string   `json:"name"`
				Body string   `json:"body"`
				Tags []string `json:"tags"`
			}
			if err := ctx.Bind(&in); err != nil {
				ctx.JSON(http.StatusBadRequest, H{"code": 400, "msg": "bad request"})
				return
			}
			p, err := appsvc.Prompts.Update(c, id, in.Name, in.Body, in.Tags)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, H{"code": 500, "msg": err.Error()})
				return
			}
			ctx.JSON(http.StatusOK, H{"code": 0, "data": p})
		})

		// 新增：DELETE /api/prompts/:id
		r.DELETE("/prompts/:id", func(c context.Context, ctx *app.RequestContext) {
			id := string(ctx.Param("id"))
			if err := appsvc.Prompts.Delete(c, id); err != nil {
				ctx.JSON(http.StatusInternalServerError, H{"code": 500, "msg": err.Error()})
				return
			}
			ctx.JSON(http.StatusOK, H{"code": 0, "data": true})
		})

	return h.Run()
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}