# Task Management System

A full-stack task management application built with Spring Boot, React, TypeScript, and PostgreSQL. Features include task CRUD operations, search, filtering, pagination, and real-time updates with optimistic UI.

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher
- **Node.js 18** or higher
- **PostgreSQL 15** or higher
- **Maven 3.9** or higher
- **Docker & Docker Compose** (optional)

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd task-management-system

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Option 2: Run Locally

#### 1. Setup PostgreSQL Database

```bash
# Create database
createdb taskmanagement

# Or using psql
psql -U postgres
CREATE DATABASE taskmanagement;
\q
```

#### 2. Configure Environment Variables

```bash
# Backend - Create backend/.env
cp .env.example backend/.env

# Edit backend/.env with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanagement
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### 3. Start Backend

```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run

# Backend will start on http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

#### 4. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm start

# Frontend will start on http://localhost:3000
```

## 📚 Documentation

- **[FEATURES.md](FEATURES.md)** - Complete feature list and capabilities
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[SECURITY.md](SECURITY.md)** - Security best practices and guidelines
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

## 🏗️ Project Structure

```
task-management-system/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/taskmanagement/
│   │       ├── config/        # Configuration classes
│   │       ├── controller/    # REST controllers
│   │       ├── dto/           # Data Transfer Objects
│   │       ├── entity/        # JPA entities
│   │       ├── exception/     # Exception handlers
│   │       ├── health/        # Health indicators
│   │       ├── repository/    # Data repositories
│   │       ├── service/       # Business logic
│   │       └── util/          # Utility classes
│   ├── src/main/resources/
│   │   ├── db/migration/      # Flyway migrations
│   │   ├── application.yml    # Main configuration
│   │   ├── application-docker.yml
│   │   ├── application-prod.yml
│   │   └── logback-spring.xml # Logging configuration
│   └── pom.xml
├── frontend/                   # React TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── api/               # API service layer
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # Redux store
│   │   ├── theme/             # Material-UI theme
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   └── package.json
├── monitoring/                 # Monitoring configuration
│   └── prometheus.yml
├── scripts/                    # Utility scripts
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:taskmanagement}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
```

### Frontend Configuration

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8080
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
mvn test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend

```bash
cd backend
mvn clean package -DskipTests

# JAR file will be in target/task-management-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend
npm run build

# Build files will be in build/
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (paginated) |
| GET | `/api/tasks/{id}` | Get task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/toggle` | Toggle task completion |
| DELETE | `/api/tasks/{id}` | Delete task |

### Query Parameters

- `search` - Search in title and description
- `completed` - Filter by completion status (true/false)
- `page` - Page number (0-based)
- `size` - Page size (default: 10)
- `sortBy` - Sort field (title, dueDate, createdAt)
- `sortDirection` - Sort direction (ASC, DESC)

## 🔐 Security Features

- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting (60 requests/minute per IP)
- Secure password handling
- Environment variable management
- HTTPS/TLS support in production

## 🚀 Performance Features

- Database connection pooling
- Hibernate second-level cache
- Query optimization with indexes
- Pagination for large datasets
- Optimistic UI updates
- Lazy loading
- Gzip compression

## 🛠️ Development

### Backend Development

```bash
cd backend
mvn spring-boot:run

# Hot reload is enabled by default
```

### Frontend Development

```bash
cd frontend
npm start

# Hot reload is enabled by default
```

### Database Migrations

Flyway migrations are automatically applied on startup. To create a new migration:

```bash
# Create a new migration file
cd backend/src/main/resources/db/migration
touch V4__your_migration_name.sql
```

## 🐛 Troubleshooting

### Backend Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection details in application.yml
```

**Port 8080 already in use**
```bash
# Change port in application.yml
server:
  port: 8081
```

### Frontend Issues

**API connection failed**
```bash
# Check REACT_APP_API_URL in .env
# Ensure backend is running
curl http://localhost:8080/actuator/health
```

**Port 3000 already in use**
```bash
# Set different port
PORT=3001 npm start
```

### Docker Issues

**Container fails to start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up --build
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.
