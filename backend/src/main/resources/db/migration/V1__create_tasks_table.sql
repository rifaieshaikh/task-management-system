-- Create tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add comments for documentation
COMMENT ON TABLE tasks IS 'Stores task information for the task management system';
COMMENT ON COLUMN tasks.id IS 'Primary key, auto-generated';
COMMENT ON COLUMN tasks.title IS 'Task title, required, max 200 characters';
COMMENT ON COLUMN tasks.description IS 'Task description, optional, max 1000 characters';
COMMENT ON COLUMN tasks.is_completed IS 'Task completion status, defaults to false';
COMMENT ON COLUMN tasks.due_date IS 'Task due date, optional';
COMMENT ON COLUMN tasks.created_at IS 'Timestamp when task was created';
COMMENT ON COLUMN tasks.updated_at IS 'Timestamp when task was last updated';
