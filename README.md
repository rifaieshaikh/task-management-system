# Task Management System

A full-stack task management application built with Spring Boot, React, TypeScript, and PostgreSQL. Features a modern Material-UI interface, Redux state management, and comprehensive REST API with Swagger documentation.

## 🚀 Features

### Backend
- ✅ **RESTful API** with Spring Boot 3.2+ and Java 21
- 🗄️ **PostgreSQL Database** with Flyway migrations
- 📚 **Swagger/OpenAPI Documentation** for interactive API testing
- 🔒 **Bean Validation** for input validation
- 🎯 **Global Exception Handling** with user-friendly error messages
- 🔍 **Advanced Search & Filtering** with pagination and sorting
- 🐳 **Docker Support** with multi-stage builds
- 📊 **Health Checks** with Spring Boot Actuator

### Frontend
- ⚛️ **React 19** with TypeScript for type safety
- 🎨 **Material-UI** for modern, responsive design
- 🔄 **Redux Toolkit** for state management
- 🔍 **Real-time Search** with debouncing
- 📄 **Pagination** for efficient data handling
- 🎯 **Smart Filtering** by completion status
- 📊 **Flexible Sorting** by multiple fields
- ✨ **Form Validation** with user feedback
- 🚨 **Error Handling** with alerts

## 📋 Prerequisites

- **Java**: 21 (LTS)
- **Node.js**: 18.x or higher
- **PostgreSQL**: 16 or higher
- **Maven**: 3.8+ (or use Maven wrapper)
- **Docker & Docker Compose**: (optional, for containerized deployment)

## 🛠️ Quick Start

### Option 1: Docker Compose (Recommended)

Start all services with a single command:

```bash
docker-compose up -d
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **PostgreSQL**: localhost:5432

### Option 2: Local Development

#### 1. Start PostgreSQL

```bash
# Using Docker
docker run -d \
  --name task-db \
  -e POSTGRES_DB=taskdb \
  -e POSTGRES_USER=taskuser \
  -e POSTGRES_PASSWORD=taskpass \
  -p 5432:5432 \
  postgres:16-alpine

# Or use your local PostgreSQL installation
```

#### 2. Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend will start on http://localhost:8080

#### 3. Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend will start on http://localhost:3000

## 📁 Project Structure

```
task-management-system/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskmanagement/
│   │   │   │   ├── config/           # Configuration classes
│   │   │   │   ├── controller/       # REST controllers
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── entity/           # JPA entities
│   │   │   │   ├── exception/        # Exception handling
│   │   │   │   ├── repository/       # Data access layer
│   │   │   │   └── service/          # Business logic
│   │   │   └── resources/
│   │   │       ├── db/migration/     # Flyway migrations
│   │   │       ├── application.yml   # Configuration
│   │   │       └── application-docker.yml
│   │   └── test/                     # Unit & integration tests
│   ├── Dockerfile
│   ├── pom.xml
│   └── README.md
├── frontend/                   # React TypeScript frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── api/               # API service layer
│   │   ├── components/        # React components
│   │   │   ├── common/        # Reusable components
│   │   │   ├── TaskList/      # Task list components
│   │   │   └── TaskForm/      # Task form components
│   │   ├── store/             # Redux store
│   │   │   └── slices/        # Redux slices
│   │   ├── theme/             # Material-UI theme
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Root component
│   │   └── index.tsx          # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── README.md
├── plans/                      # Project documentation
│   ├── architecture-plan.md
│   ├── implementation-guide.md
│   ├── frontend-implementation.md
│   ├── docker-setup.md
│   ├── flyway-swagger-integration.md
│   └── git-workflow.md
├── docker-compose.yml
├── .gitignore
└── README.md                   # This file
```

## 🔌 API Endpoints

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with pagination, sorting, filtering) |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/{id}` | Update a task |
| PATCH | `/api/tasks/{id}/toggle` | Toggle task completion |
| DELETE | `/api/tasks/{id}` | Delete a task |

### Query Parameters

- `search`: Search in title and description
- `isCompleted`: Filter by completion status (true/false)
- `page`: Page number (0-indexed)
- `size`: Page size (default: 10)
- `sort`: Sort field and direction (e.g., `createdAt,desc`)

### Example Requests

```bash
# Get all tasks
curl http://localhost:8080/api/tasks

# Search tasks
curl "http://localhost:8080/api/tasks?search=meeting"

# Filter completed tasks
curl "http://localhost:8080/api/tasks?isCompleted=true"

# Pagination and sorting
curl "http://localhost:8080/api/tasks?page=0&size=10&sort=dueDate,asc"

# Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task management system",
    "dueDate": "2024-12-31"
  }'

# Update a task
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "isCompleted": true
  }'

# Toggle completion
curl -X PATCH http://localhost:8080/api/tasks/1/toggle

# Delete a task
curl -X DELETE http://localhost:8080/api/tasks/1
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**Local**: http://localhost:8080/swagger-ui.html

**Docker**: http://localhost:8080/swagger-ui.html

The Swagger UI provides:
- Complete API documentation
- Request/response schemas
- Interactive testing interface
- Example requests and responses

## 🗄️ Database Schema

### Tasks Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL |
| is_completed | BOOLEAN | NOT NULL, DEFAULT false |
| due_date | DATE | NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### Indexes

- `idx_tasks_is_completed`: For filtering by completion status
- `idx_tasks_due_date`: For sorting by due date
- `idx_tasks_created_at`: For sorting by creation date

## 🐳 Docker Deployment

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Backend health endpoint
curl http://localhost:8080/actuator/health

# Frontend health check
curl http://localhost:3000
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
./mvnw test

# Run with coverage
./mvnw test jacoco:report

# Run specific test
./mvnw test -Dtest=TaskServiceTest
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- TaskList.test.tsx
```

### E2E Tests (Playwright)

```bash
cd frontend

# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/taskdb
    username: taskuser
    password: taskpass
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  
  flyway:
    enabled: true
    baseline-on-migrate: true
```

### Frontend Configuration

Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

## 🚀 Production Deployment

### Backend

```bash
cd backend

# Build JAR
./mvnw clean package -DskipTests

# Run JAR
java -jar target/task-management-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend

# Build production bundle
npm run build

# Serve with nginx or any static server
serve -s build
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Deploy
docker-compose up -d
```

## 🔒 Security

### Implemented Security Measures

1. **Input Validation**: Bean Validation on all DTOs
2. **SQL Injection Prevention**: JPA/Hibernate parameterized queries
3. **CORS Configuration**: Controlled cross-origin access
4. **Error Handling**: No sensitive data in error responses
5. **Security Headers**: Set in Nginx configuration
6. **Environment Variables**: Sensitive data in `.env` files

### Production Recommendations

- Enable HTTPS/TLS
- Use strong database passwords
- Implement authentication (JWT/OAuth2)
- Add rate limiting
- Enable security headers
- Regular dependency updates
- Database connection pooling
- Implement logging and monitoring

## 📊 Performance Optimization

### Backend

- Database indexes on frequently queried columns
- Pagination for large datasets
- Connection pooling with HikariCP
- Lazy loading for JPA relationships
- Caching with Spring Cache (optional)

### Frontend

- Code splitting with React lazy loading
- Debounced search (500ms delay)
- Memoization with React.memo
- Production build minification
- Gzip compression in Nginx
- Static asset caching

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Database connection failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U taskuser -d taskdb
```

**Issue**: Port 8080 already in use
```bash
# Change port in application.yml
server:
  port: 8081
```

### Frontend Issues

**Issue**: API connection failed
```bash
# Check backend is running
curl http://localhost:8080/api/tasks

# Verify .env configuration
cat frontend/.env
```

**Issue**: Port 3000 already in use
```bash
# Use different port
PORT=3001 npm start
```

### Docker Issues

**Issue**: Container fails to start
```bash
# Check logs
docker-compose logs backend

# Rebuild images
docker-compose build --no-cache
```

## 📝 Development Workflow

### Git Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the amazing library
- Material-UI for the component library
- PostgreSQL team for the robust database
- All open-source contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in `/plans` directory
- Review backend README: `backend/README.md`
- Review frontend README: `frontend/README.md`

## 🎯 Project Status

### Completed ✅
- Backend API with full CRUD operations
- Frontend UI with all features
- Docker deployment configuration
- Comprehensive documentation
- Database migrations with Flyway
- API documentation with Swagger
- Redux state management
- Material-UI theming
- Error handling and validation

### Pending 🚧
- Backend unit and integration tests
- Frontend component tests
- E2E tests with Playwright
- Authentication and authorization
- User management
- Task categories/tags
- File attachments
- Email notifications

## 📈 Statistics

- **Total Commits**: 29+
- **Backend Files**: 20+
- **Frontend Files**: 25+
- **API Endpoints**: 6
- **Components**: 5+
- **Lines of Code**: 3000+

---

**Built with ❤️ using Spring Boot, React, and TypeScript**
