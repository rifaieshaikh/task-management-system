# Task Management Backend

Spring Boot REST API for the Task Management System.

## Technology Stack

- **Java 21** - Latest LTS version
- **Spring Boot 3.2.2** - Application framework
- **Spring Data JPA** - Data access layer
- **PostgreSQL 16** - Database
- **Flyway** - Database migrations
- **SpringDoc OpenAPI** - API documentation (Swagger)
- **Lombok** - Reduce boilerplate code
- **Maven** - Build tool

## Prerequisites

- Java 21 JDK
- Maven 3.8+
- PostgreSQL 16 (or use Docker)
- Docker & Docker Compose (optional)

## Quick Start

### Option 1: Using Docker (Recommended)

```bash
# From project root
docker-compose up postgres

# Wait for PostgreSQL to be ready, then run backend
cd backend
mvn spring-boot:run
```

### Option 2: Local PostgreSQL

1. **Install and start PostgreSQL**

2. **Create database and user**
   ```sql
   CREATE DATABASE taskdb;
   CREATE USER taskuser WITH PASSWORD 'taskpass';
   GRANT ALL PRIVILEGES ON DATABASE taskdb TO taskuser;
   ```

3. **Run the application**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

## Configuration

### Application Properties

Located in [`src/main/resources/application.yml`](src/main/resources/application.yml)

Key configurations:
- **Database**: PostgreSQL connection settings
- **JPA**: Hibernate with validation mode
- **Flyway**: Automatic database migrations
- **Swagger**: API documentation at `/swagger-ui.html`
- **CORS**: Configured for frontend at `http://localhost:3000`

### Profiles

- **default**: Local development with localhost PostgreSQL
- **docker**: Docker environment with container networking

Activate profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=docker
```

## API Endpoints

Base URL: `http://localhost:8080/api`

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (paginated) |
| GET | `/tasks/{id}` | Get task by ID |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/{id}` | Update task |
| PATCH | `/tasks/{id}/toggle` | Toggle completion status |
| DELETE | `/tasks/{id}` | Delete task |

### Query Parameters

**GET /tasks** supports:
- `page` - Page number (default: 0)
- `size` - Page size (default: 10)
- `sortBy` - Sort field: title, dueDate, createdAt (default: createdAt)
- `sortOrder` - Sort order: asc, desc (default: desc)
- `completed` - Filter by status: true, false
- `search` - Search in title and description

Example:
```bash
curl "http://localhost:8080/api/tasks?page=0&size=10&sortBy=dueDate&sortOrder=asc&completed=false&search=project"
```

## API Documentation

Interactive Swagger UI available at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs
- **OpenAPI YAML**: http://localhost:8080/api-docs.yaml

## Database Migrations

Flyway migrations are located in [`src/main/resources/db/migration/`](src/main/resources/db/migration/)

Migrations run automatically on application startup.

### Migration Files

- `V1__create_tasks_table.sql` - Creates tasks table
- `V2__add_indexes.sql` - Adds performance indexes

### Flyway Commands

```bash
# View migration status
mvn flyway:info

# Validate migrations
mvn flyway:validate

# Clean database (removes all objects) - USE WITH CAUTION
mvn flyway:clean
```

## Building

### Development Build

```bash
mvn clean install
```

### Production Build

```bash
mvn clean package -DskipTests
```

The JAR file will be in `target/task-management-backend-1.0.0.jar`

### Run JAR

```bash
java -jar target/task-management-backend-1.0.0.jar
```

## Testing

### Run All Tests

```bash
mvn test
```

### Run with Coverage

```bash
mvn test jacoco:report
```

Coverage report will be in `target/site/jacoco/index.html`

### Run Specific Test

```bash
mvn test -Dtest=TaskServiceTest
```

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/taskmanagement/
│   │   │   ├── TaskManagementApplication.java
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   ├── controller/
│   │   │   │   └── TaskController.java
│   │   │   ├── dto/
│   │   │   │   ├── TaskRequestDTO.java
│   │   │   │   ├── TaskResponseDTO.java
│   │   │   │   └── ErrorResponseDTO.java
│   │   │   ├── entity/
│   │   │   │   └── Task.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── TaskNotFoundException.java
│   │   │   ├── repository/
│   │   │   │   └── TaskRepository.java
│   │   │   └── service/
│   │   │       ├── TaskService.java
│   │   │       └── TaskServiceImpl.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-docker.yml
│   │       └── db/migration/
│   │           ├── V1__create_tasks_table.sql
│   │           └── V2__add_indexes.sql
│   └── test/
│       └── java/com/taskmanagement/
│           ├── controller/
│           ├── service/
│           └── integration/
├── Dockerfile
├── pom.xml
└── README.md
```

## Architecture

### Layered Architecture

```
Controller Layer (REST API)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
```

### Key Components

- **Controller**: Handles HTTP requests, validation, and responses
- **Service**: Contains business logic and transaction management
- **Repository**: Spring Data JPA interface for database operations
- **Entity**: JPA entity representing database table
- **DTO**: Data Transfer Objects for API requests/responses

## Error Handling

All errors return a consistent format:

```json
{
  "timestamp": "2026-02-19T09:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Task not found with id: 1",
  "path": "/api/tasks/1"
}
```

## Validation

Input validation using Bean Validation:
- `@NotBlank` - Required fields
- `@Size` - Length constraints
- `@Future` - Date validation

Validation errors return 400 Bad Request with detailed messages.

## Logging

Logging configuration in `application.yml`:
- **Application**: DEBUG level
- **Spring**: INFO level
- **Hibernate SQL**: DEBUG level
- **Flyway**: INFO level

## Health Check

Spring Boot Actuator provides health endpoint:
- **Health**: http://localhost:8080/actuator/health

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U taskuser -d taskdb
```

### Application Won't Start

```bash
# Check logs
mvn spring-boot:run

# Verify Java version
java -version  # Should be 21

# Clean and rebuild
mvn clean install
```

### Flyway Migration Errors

```bash
# Check migration status
mvn flyway:info

# Repair migration history
mvn flyway:repair
```

## Development Tips

### Hot Reload

Spring Boot DevTools enables automatic restart on code changes.

### Database Console

Access H2 console for testing (if configured):
http://localhost:8080/h2-console

### API Testing

Use Swagger UI for interactive API testing:
http://localhost:8080/swagger-ui.html

Or use curl:
```bash
# Create task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test Description"}'

# Get all tasks
curl http://localhost:8080/api/tasks

# Get task by ID
curl http://localhost:8080/api/tasks/1

# Update task
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","isCompleted":true}'

# Delete task
curl -X DELETE http://localhost:8080/api/tasks/1
```

## Production Deployment

### Environment Variables

Set these environment variables in production:
```bash
SPRING_PROFILES_ACTIVE=docker
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/taskdb
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Deployment

```bash
# Build image
docker build -t task-backend .

# Run container
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/taskdb \
  task-backend
```

## License

MIT License
