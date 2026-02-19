# Git Workflow & Commit Strategy

This document outlines the Git workflow and commit strategy for the task management system project.

---

## Repository Information

- **Remote Repository**: https://github.com/rifaieshaikh/task-management-system
- **Default Branch**: `main`
- **Development Branch**: `develop` (recommended)

---

## Branch Strategy

### Main Branches

```
main (production-ready code)
  ↑
develop (integration branch)
  ↑
feature/* (feature branches)
```

### Branch Naming Convention

- `feature/backend-setup` - New features
- `feature/frontend-components` - Frontend work
- `bugfix/fix-validation` - Bug fixes
- `hotfix/critical-issue` - Production hotfixes
- `docs/update-readme` - Documentation updates
- `test/add-unit-tests` - Testing work
- `refactor/improve-service` - Code refactoring

---

## Commit Message Convention

Follow **Conventional Commits** specification for clear, semantic commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples

```bash
# Feature commits
git commit -m "feat(backend): add Task entity with JPA annotations"
git commit -m "feat(frontend): implement TaskList component with pagination"
git commit -m "feat(api): add Swagger/OpenAPI documentation"

# Fix commits
git commit -m "fix(backend): resolve validation error handling"
git commit -m "fix(frontend): correct date formatting in TaskList"

# Documentation commits
git commit -m "docs: add architecture plan and implementation guide"
git commit -m "docs(readme): update setup instructions with Docker"

# Test commits
git commit -m "test(backend): add unit tests for TaskService"
git commit -m "test(frontend): add E2E tests with Playwright"

# Chore commits
git commit -m "chore(backend): add Flyway and Swagger dependencies"
git commit -m "chore(frontend): configure Redux Toolkit"

# Build commits
git commit -m "build(docker): add multi-stage Dockerfile for backend"
git commit -m "build: configure docker-compose for all services"
```

### Multi-line Commit Messages

For complex changes:

```bash
git commit -m "feat(backend): implement task CRUD operations

- Add TaskService with business logic
- Create TaskController with REST endpoints
- Implement pagination, sorting, and filtering
- Add comprehensive error handling

Closes #12"
```

---

## Commit Strategy by Phase

### Phase 1: Planning & Documentation ✅

```bash
# Initial commit
git add .gitignore
git commit -m "chore: initialize project with .gitignore"

# Documentation commits
git add plans/architecture-plan.md
git commit -m "docs: add comprehensive architecture plan"

git add plans/implementation-guide.md
git commit -m "docs: add backend implementation guide"

git add plans/frontend-implementation.md
git commit -m "docs: add frontend implementation guide"

git add plans/docker-setup.md
git commit -m "docs: add Docker configuration guide"

git add plans/flyway-swagger-integration.md
git commit -m "docs: add Flyway and Swagger integration guide"

git add plans/project-summary.md plans/git-workflow.md
git commit -m "docs: add project summary and Git workflow guide"

git add README.md
git commit -m "docs: create comprehensive project README"

# Push to remote
git push origin main
```

### Phase 2: Project Structure Setup

```bash
# Create directory structure
git add backend/ frontend/
git commit -m "chore: create backend and frontend directory structure"

# Docker configuration
git add docker-compose.yml
git commit -m "build(docker): add docker-compose configuration"

git add backend/Dockerfile
git commit -m "build(docker): add backend Dockerfile with multi-stage build"

git add frontend/Dockerfile frontend/nginx.conf
git commit -m "build(docker): add frontend Dockerfile with Nginx"
```

### Phase 3: Backend Implementation

```bash
# Maven setup
git add backend/pom.xml
git commit -m "build(backend): configure Maven with all dependencies"

# Application configuration
git add backend/src/main/resources/application.yml
git commit -m "feat(backend): add Spring Boot application configuration"

# Main application
git add backend/src/main/java/com/taskmanagement/TaskManagementApplication.java
git commit -m "feat(backend): create Spring Boot main application class"

# Flyway migrations
git add backend/src/main/resources/db/migration/
git commit -m "feat(backend): add Flyway migration scripts for tasks table"

# Entity layer
git add backend/src/main/java/com/taskmanagement/entity/Task.java
git commit -m "feat(backend): implement Task entity with JPA and validation"

# DTOs
git add backend/src/main/java/com/taskmanagement/dto/
git commit -m "feat(backend): create DTOs for request/response handling"

# Repository layer
git add backend/src/main/java/com/taskmanagement/repository/TaskRepository.java
git commit -m "feat(backend): implement TaskRepository with custom queries"

# Service layer
git add backend/src/main/java/com/taskmanagement/service/
git commit -m "feat(backend): implement TaskService with business logic"

# Exception handling
git add backend/src/main/java/com/taskmanagement/exception/
git commit -m "feat(backend): add global exception handling"

# Controller layer
git add backend/src/main/java/com/taskmanagement/controller/TaskController.java
git commit -m "feat(backend): implement REST controller with Swagger annotations"

# Configuration
git add backend/src/main/java/com/taskmanagement/config/
git commit -m "feat(backend): add CORS and OpenAPI configuration"

# Tests
git add backend/src/test/java/com/taskmanagement/service/
git commit -m "test(backend): add unit tests for TaskService"

git add backend/src/test/java/com/taskmanagement/controller/
git commit -m "test(backend): add controller tests with MockMvc"

git add backend/src/test/java/com/taskmanagement/integration/
git commit -m "test(backend): add integration tests"

# Backend README
git add backend/README.md
git commit -m "docs(backend): add backend-specific documentation"
```

### Phase 4: Frontend Implementation

```bash
# Initial React setup
git add frontend/package.json frontend/tsconfig.json
git commit -m "chore(frontend): initialize React TypeScript project"

# Type definitions
git add frontend/src/types/
git commit -m "feat(frontend): add TypeScript type definitions"

# API layer
git add frontend/src/api/
git commit -m "feat(frontend): implement API service layer with Axios"

# Redux setup
git add frontend/src/store/store.ts frontend/src/store/hooks.ts
git commit -m "feat(frontend): configure Redux store with TypeScript"

git add frontend/src/store/slices/taskSlice.ts
git commit -m "feat(frontend): implement task slice with async thunks"

# Utilities
git add frontend/src/utils/
git commit -m "feat(frontend): add utility functions for date handling"

# Common components
git add frontend/src/components/common/
git commit -m "feat(frontend): create common components (Loading, Error, Dialog)"

# Task components
git add frontend/src/components/TaskList/
git commit -m "feat(frontend): implement TaskList with pagination and filtering"

git add frontend/src/components/TaskForm/
git commit -m "feat(frontend): create TaskForm with validation"

git add frontend/src/components/TaskDetails/
git commit -m "feat(frontend): implement TaskDetails component"

# Pages
git add frontend/src/pages/
git commit -m "feat(frontend): create page components"

# Routing
git add frontend/src/App.tsx
git commit -m "feat(frontend): implement React Router navigation"

# Tests
git add frontend/src/components/**/*.test.tsx
git commit -m "test(frontend): add component unit tests"

git add frontend/src/store/slices/*.test.ts
git commit -m "test(frontend): add Redux slice tests"

git add frontend/e2e/
git commit -m "test(frontend): add Playwright E2E tests"

# Frontend README
git add frontend/README.md
git commit -m "docs(frontend): add frontend-specific documentation"
```

### Phase 5: Final Integration

```bash
# Environment files
git add frontend/.env.example backend/.env.example
git commit -m "chore: add environment file templates"

# Final documentation updates
git add README.md
git commit -m "docs: update main README with complete setup instructions"

# CI/CD (if applicable)
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflow for testing and deployment"
```

---

## Git Commands Reference

### Initial Setup

```bash
# Clone repository
git clone https://github.com/rifaieshaikh/task-management-system.git
cd task-management-system

# Configure user
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Check remote
git remote -v
```

### Daily Workflow

```bash
# Check status
git status

# Stage changes
git add <file>
git add .  # Add all changes

# Commit with message
git commit -m "type(scope): message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline --graph --decorate
```

### Branch Workflow

```bash
# Create and switch to new branch
git checkout -b feature/backend-setup

# Switch branches
git checkout main

# List branches
git branch -a

# Merge branch
git checkout main
git merge feature/backend-setup

# Delete branch
git branch -d feature/backend-setup

# Push branch to remote
git push origin feature/backend-setup
```

### Undoing Changes

```bash
# Unstage file
git reset HEAD <file>

# Discard changes in working directory
git checkout -- <file>

# Amend last commit
git commit --amend -m "new message"

# Revert commit (creates new commit)
git revert <commit-hash>

# Reset to previous commit (careful!)
git reset --hard <commit-hash>
```

### Viewing Changes

```bash
# View changes
git diff

# View staged changes
git diff --staged

# View commit history
git log

# View specific file history
git log --follow <file>

# View changes in commit
git show <commit-hash>
```

---

## Recommended Commit Frequency

### During Development

- **Small, focused commits** - Each commit should represent one logical change
- **Commit often** - Don't wait until end of day
- **Test before commit** - Ensure code compiles and tests pass
- **Meaningful messages** - Clear description of what and why

### Commit Checklist

Before each commit:
- [ ] Code compiles without errors
- [ ] Tests pass (if applicable)
- [ ] Code is formatted properly
- [ ] No debug code or console.logs
- [ ] Commit message follows convention
- [ ] Changes are related to single purpose

---

## Pull Request Strategy

### Creating Pull Requests

```bash
# Push feature branch
git push origin feature/backend-setup

# Create PR on GitHub
# Title: feat(backend): Implement backend setup with Spring Boot
# Description: 
# - Add Maven configuration
# - Implement Task entity
# - Create repository and service layers
# - Add unit tests
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Test addition

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## Git Hooks (Optional)

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Run tests before commit
npm test --passWithNoTests
mvn test -DskipTests=false

# Check for console.log
if git diff --cached | grep -E "console\.(log|debug|info)"; then
    echo "Error: console.log found in staged files"
    exit 1
fi
```

### Commit Message Hook

Create `.git/hooks/commit-msg`:

```bash
#!/bin/sh
# Validate commit message format
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?: .{1,100}"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
    echo "Error: Commit message doesn't follow convention"
    echo "Format: type(scope): subject"
    exit 1
fi
```

---

## Best Practices

### DO ✅

- Write clear, descriptive commit messages
- Commit early and often
- Keep commits focused and atomic
- Test before committing
- Pull before pushing
- Use branches for features
- Review your changes before committing
- Keep commit history clean

### DON'T ❌

- Commit broken code
- Mix unrelated changes in one commit
- Use vague messages like "fix stuff" or "update"
- Commit sensitive data (passwords, keys)
- Force push to main branch
- Commit generated files (node_modules, target/)
- Commit without testing
- Rewrite public history

---

## Commit History Example

```
* feat(frontend): add Playwright E2E tests
* test(frontend): add Redux slice unit tests
* test(frontend): add component unit tests
* feat(frontend): implement React Router navigation
* feat(frontend): create TaskDetails component
* feat(frontend): create TaskForm with validation
* feat(frontend): implement TaskList with pagination
* feat(frontend): create common components
* feat(frontend): add utility functions
* feat(frontend): implement task slice with async thunks
* feat(frontend): configure Redux store
* feat(frontend): implement API service layer
* feat(frontend): add TypeScript type definitions
* chore(frontend): initialize React TypeScript project
* docs(backend): add backend documentation
* test(backend): add integration tests
* test(backend): add controller tests
* test(backend): add unit tests for TaskService
* feat(backend): add CORS and OpenAPI configuration
* feat(backend): implement REST controller with Swagger
* feat(backend): add global exception handling
* feat(backend): implement TaskService with business logic
* feat(backend): implement TaskRepository
* feat(backend): create DTOs for request/response
* feat(backend): implement Task entity with JPA
* feat(backend): add Flyway migration scripts
* feat(backend): create Spring Boot main application
* feat(backend): add application configuration
* build(backend): configure Maven with dependencies
* build(docker): add frontend Dockerfile with Nginx
* build(docker): add backend Dockerfile
* build(docker): add docker-compose configuration
* chore: create directory structure
* docs: create comprehensive project README
* docs: add Git workflow guide
* docs: add project summary
* docs: add Flyway and Swagger integration guide
* docs: add Docker configuration guide
* docs: add frontend implementation guide
* docs: add backend implementation guide
* docs: add comprehensive architecture plan
* chore: initialize project with .gitignore
```

---

This Git workflow ensures a clean, professional commit history that makes the project easy to understand, maintain, and collaborate on.
