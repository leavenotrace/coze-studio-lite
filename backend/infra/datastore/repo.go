package datastore

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Repo struct{ db *gorm.DB }

func NewRepo(mysqlDSN string) *Repo {
	db, err := gorm.Open(mysql.Open(mysqlDSN), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	return &Repo{db: db}
}

func (r *Repo) List(ctx context.Context) ([]domain.Prompt, error) {
	var rows []domain.Prompt
	if err := r.db.WithContext(ctx).Table("prompts").Order("created_at desc").Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *Repo) Save(ctx context.Context, p domain.Prompt) error {
	return r.db.WithContext(ctx).Table("prompts").Create(&p).Error
}

func (r *Repo) Get(ctx context.Context, id string) (domain.Prompt, error) {
	var p domain.Prompt
	if err := r.db.WithContext(ctx).Table("prompts").Where("id=?", id).First(&p).Error; err != nil {
		return domain.Prompt{}, err
	}
	return p, nil
}

func (r *Repo) Update(ctx context.Context, p domain.Prompt) error {
	return r.db.WithContext(ctx).Table("prompts").Where("id=?", p.ID).Updates(map[string]any{
		"name": p.Name, "body": p.Body, "tags": p.Tags, "owner_id": p.OwnerID,
	}).Error
}

func (r *Repo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Table("prompts").Where("id=?", id).Delete(&domain.Prompt{}).Error
}

// --- user methods ---
func (r *Repo) CreateUser(ctx context.Context, u domain.User) error {
	return r.db.WithContext(ctx).Table("users").Create(&u).Error
}

func (r *Repo) GetUserByEmail(ctx context.Context, email string) (domain.User, error) {
	var u domain.User
	if err := r.db.WithContext(ctx).Table("users").Where("email=?", email).First(&u).Error; err != nil {
		return domain.User{}, err
	}
	return u, nil
}

func (r *Repo) GetUserByID(ctx context.Context, id string) (domain.User, error) {
	var u domain.User
	if err := r.db.WithContext(ctx).Table("users").Where("id=?", id).First(&u).Error; err != nil {
		return domain.User{}, err
	}
	return u, nil
}