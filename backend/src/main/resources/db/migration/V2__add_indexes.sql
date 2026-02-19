-- Add indexes for better query performance

-- Index on is_completed for filtering
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);

-- Index on due_date for sorting and filtering
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Index on created_at for sorting
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Composite index for common query pattern (completed + due_date)
CREATE INDEX idx_tasks_completed_due_date ON tasks(is_completed, due_date);

-- Index for text search on title
CREATE INDEX idx_tasks_title ON tasks USING gin(to_tsvector('english', title));

-- Index for text search on description
CREATE INDEX idx_tasks_description ON tasks USING gin(to_tsvector('english', COALESCE(description, '')));
