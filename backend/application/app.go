package application

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain"
	"github.com/coze-dev/coze-studio/backend/infra/datastore"
)

type Services struct {
	Prompts *PromptService
}

func New(mysqlDSN string) *Services {
	repo := datastore.NewRepo(mysqlDSN)
	return &Services{
		Prompts: &PromptService{repo: repo},
	}
}

type PromptService struct{ repo domain.PromptRepo }

func (s *PromptService) List(ctx context.Context) ([]domain.Prompt, error) {
	return s.repo.List(ctx)
}

func (s *PromptService) Create(ctx context.Context, name, body string, tags []string) (domain.Prompt, error) {
	p := domain.NewPrompt(name, body, tags)
	if err := s.repo.Save(ctx, p); err != nil {
		return domain.Prompt{}, err
	}
	return p, nil
}