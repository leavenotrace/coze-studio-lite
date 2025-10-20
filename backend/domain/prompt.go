package domain

import (
	"context"
	"time"
	"errors"

	"github.com/oklog/ulid/v2"
	"golang.org/x/crypto/bcrypt"
)

type Prompt struct {
	ID        string    `json:"id" gorm:"column:id;primaryKey"`
	Name      string    `json:"name" gorm:"column:name"`
	Body      string    `json:"body" gorm:"column:body"`
	Tags      []byte    `json:"tags" gorm:"column:tags"` // 存 JSON
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;autoCreateTime"`
}

func NewPrompt(name, body string, tags []string) Prompt {
	// 这里将 tags 序列化为 JSON 存入 []byte，简化演示
	j := []byte("[]")
	if len(tags) > 0 {
		j = []byte(`["` + tags[0] + `"]`) // 最小演示：仅取第一个标签
	}
	return Prompt{
		ID:        ulid.Make().String(),
		Name:      name,
		Body:      body,
		Tags:      j,
		CreatedAt: time.Now(),
	}
}


type PromptRepo interface {
	List(ctx context.Context) ([]Prompt, error)
	Save(ctx context.Context, p Prompt) error
	// 新增：
	Get(ctx context.Context, id string) (Prompt, error)
	Update(ctx context.Context, p Prompt) error
	Delete(ctx context.Context, id string) error
}

// --- user domain interfaces & helpers ---

var ErrUnauthenticated = errors.New("unauthenticated")

func GenerateID() string { return ulid.Make().String() }

type UserRepo interface {
	CreateUser(ctx context.Context, u User) error
	GetUserByEmail(ctx context.Context, email string) (User, error)
}

func HashPassword(pw string) string {
	h, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(h)
}

func CheckPassword(pw, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)) == nil
}