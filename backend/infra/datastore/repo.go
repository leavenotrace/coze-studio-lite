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