-- add owner_id to prompts table
ALTER TABLE prompts
  ADD COLUMN owner_id varchar(32) DEFAULT '';

-- add index
CREATE INDEX idx_prompts_owner_id ON prompts(owner_id);
