-- V3__insert_seed_data.sql
-- Insert sample tasks for testing and demonstration

-- Insert completed tasks
INSERT INTO tasks (title, description, is_completed, due_date, created_at, updated_at)
VALUES 
    ('Complete project documentation', 'Write comprehensive README and API documentation for the task management system', true, '2024-01-15', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('Setup development environment', 'Install Java 21, Node.js, PostgreSQL, and Docker', true, '2024-01-10', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
    ('Review pull requests', 'Review and merge pending pull requests from team members', true, '2024-01-20', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '7 days');

-- Insert pending tasks with upcoming due dates
INSERT INTO tasks (title, description, is_completed, due_date, created_at, updated_at)
VALUES 
    ('Implement user authentication', 'Add JWT-based authentication and authorization to the API', false, CURRENT_DATE + INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('Write unit tests', 'Create comprehensive unit tests for service and controller layers', false, CURRENT_DATE + INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('Deploy to production', 'Deploy the application to AWS/Azure cloud platform', false, CURRENT_DATE + INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', false, CURRENT_DATE + INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days');

-- Insert overdue tasks
INSERT INTO tasks (title, description, is_completed, due_date, created_at, updated_at)
VALUES 
    ('Fix critical bug in payment module', 'Investigate and fix the payment processing error reported by users', false, CURRENT_DATE - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('Update dependencies', 'Update all npm and Maven dependencies to latest stable versions', false, CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Insert tasks without due dates
INSERT INTO tasks (title, description, is_completed, due_date, created_at, updated_at)
VALUES 
    ('Research new technologies', 'Explore GraphQL, WebSockets, and microservices architecture for future improvements', false, NULL, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'),
    ('Optimize database queries', 'Analyze and optimize slow database queries using EXPLAIN ANALYZE', false, NULL, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    ('Create user documentation', 'Write end-user documentation and tutorial videos', false, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('Refactor legacy code', 'Refactor old codebase to follow modern best practices and design patterns', false, NULL, CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_TIMESTAMP - INTERVAL '9 days');

-- Insert tasks with longer descriptions
INSERT INTO tasks (title, description, is_completed, due_date, created_at, updated_at)
VALUES 
    ('Implement email notifications', 'Add email notification system for task reminders, due date alerts, and completion confirmations. Integrate with SendGrid or AWS SES for reliable email delivery. Include email templates with proper styling and branding.', false, CURRENT_DATE + INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('Performance optimization', 'Conduct comprehensive performance audit of the application. Implement caching strategies using Redis, optimize frontend bundle size, add lazy loading for components, and implement database query optimization. Target: reduce page load time by 50%.', false, CURRENT_DATE + INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert simple tasks
INSERT INTO tasks (title, description, is_completed, due_date, created_at, updated_at)
VALUES 
    ('Team meeting', NULL, false, CURRENT_DATE + INTERVAL '1 day', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Code review session', NULL, false, CURRENT_DATE + INTERVAL '3 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Backup database', NULL, true, CURRENT_DATE - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days');

COMMENT ON COLUMN tasks.title IS 'Seed data includes various task types: completed, pending, overdue, with/without due dates';
