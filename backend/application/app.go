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


// 新增：更新
func (s *PromptService) Update(ctx context.Context, id, name, body string, tags []string) (domain.Prompt, error) {
	p, err := s.repo.Get(ctx, id)
	if err != nil { return domain.Prompt{}, err }
	p.Name = name
	p.Body = body
	// 最简：只存首个标签
	if len(tags) > 0 { p.Tags = []byte(`["` + tags[0] + `"]`) } else { p.Tags = []byte("[]") }
	if err := s.repo.Update(ctx, p); err != nil { return domain.Prompt{}, err }
	return p, nil
}

// 新增：删除
func (s *PromptService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}