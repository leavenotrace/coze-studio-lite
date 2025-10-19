-- +goose Up
CREATE TABLE IF NOT EXISTS prompts(
  id         VARCHAR(26) PRIMARY KEY,
  name       VARCHAR(128) NOT NULL,
  body       TEXT NOT NULL,
  tags       JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- +goose Down
DROP TABLE IF EXISTS prompts;