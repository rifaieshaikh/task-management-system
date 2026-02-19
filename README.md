# Task Management System

A full-stack task management application built with Spring Boot, React, TypeScript, and PostgreSQL, containerized with Docker.

## 🚀 Features

### Core Functionality
- ✅ Create, read, update, and delete tasks
- ✅ Toggle task completion status directly from list view
- ✅ Pagination for efficient data handling
- ✅ Sorting by title, due date, or creation date
- ✅ Filtering by completion status
- ✅ Search tasks by title or description
- ✅ Form validation with user-friendly error messages
- ✅ Responsive Material-UI design

### Technical Features
- 🏗️ RESTful API with proper HTTP methods and status codes
- 📚 **Swagger/OpenAPI documentation** - Interactive API documentation
- 🔄 **Flyway database migrations** - Version-controlled schema management
- 🔄 Redux state management with Redux Toolkit
- 🧪 Comprehensive unit and integration tests
- 🎭 End-to-end tests with Playwright
- 🐳 Docker containerization for easy deployment
- 📝 Clean, maintainable code with proper project structure

---

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Contributing](#contributing)

---

## 🛠️ Technology Stack

### Backend
- **Java 21** - Latest LTS version with modern features
- **Spring Boot 3.2+** - Enterprise-grade framework
- **Spring Data JPA** - Database abstraction layer
- **PostgreSQL 16** - Robust relational database
- **Flyway** - Database migration tool
- **SpringDoc OpenAPI** - Swagger/OpenAPI 3.0 documentation
- **Maven** - Dependency management
- **JUnit 5 & Mockito** - Testing framework

### Frontend
- **React 18** - Modern UI library
- **TypeScript 5.x** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Jest & React Testing Library** - Unit testing
- **Playwright** - E2E testing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📁 Project Structure

```
task-management-system/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskmanagement/
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Data access
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── exception/       # Exception handling
│   │   │   │   └── config/          # Configuration
│   │   │   └── resources/
│   │   │       └── application.yml  # App configuration
│   │   └── test/                    # Unit & integration tests
│   ├── Dockerfile
│   ├── pom.xml
│   └── README.md
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/                # API service layer
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Redux store & slices
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   ├── e2e/                    # Playwright E2E tests
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── README.md
├── plans/                      # Architecture & planning docs
│   ├── architecture-plan.md
│   ├── implementation-guide.md
│   ├── frontend-implementation.md
│   └── docker-setup.md
├── docker-compose.yml          # Multi-container setup
└── README.md                   # This file
```

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
  
For local development without Docker:
- **Java 21** JDK
- **Maven 3.8+**
- **Node.js 18+** and npm
- **PostgreSQL 16**

---

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - **Swagger UI**: http://localhost:8080/swagger-ui.html
   - Database: localhost:5432

4. **Stop the application**
   ```bash
   docker-compose down
   ```

That's it! The application is now running with all services containerized.

---

## 💻 Development Setup

### Backend Development

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Start PostgreSQL** (if not using Docker)
   ```bash
   docker-compose up postgres
   ```
   Or install PostgreSQL locally and create database:
   ```sql
   CREATE DATABASE taskdb;
   CREATE USER taskuser WITH PASSWORD 'taskpass';
   GRANT ALL PRIVILEGES ON DATABASE taskdb TO taskuser;
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```
   
   Or with your IDE:
   - Open project in IntelliJ IDEA or Eclipse
   - Run `TaskManagementApplication.java`

4. **Verify backend is running**
   ```bash
   curl http://localhost:8080/api/tasks
   ```

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open browser to http://localhost:3000

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run tests with coverage
mvn test jacoco:report

# Run specific test class
mvn test -Dtest=TaskServiceTest

# Run integration tests
mvn verify
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### Get All Tasks
```http
GET /tasks?page=0&size=10&sort=createdAt,desc&completed=false&search=keyword
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order - asc/desc (default: desc)
- `completed` (optional): Filter by completion status
- `search` (optional): Search in title and description

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the task management system",
      "isCompleted": false,
      "dueDate": "2026-02-25",
      "createdAt": "2026-02-19T09:00:00Z",
      "updatedAt": "2026-02-19T09:00:00Z"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  }
}
```

#### Get Task by ID
```http
GET /tasks/{id}
```

**Response:** `200 OK` or `404 Not Found`

#### Create Task
```http
POST /tasks
Content-Type: application/json

{
  "title": "New task",
  "description": "Task description",
  "dueDate": "2026-02-25"
}
```

**Response:** `201 Created`

#### Update Task
```http
PUT /tasks/{id}
Content-Type: application/json

{
  "title": "Updated task",
  "description": "Updated description",
  "isCompleted": true,
  "dueDate": "2026-02-26"
}
```

**Response:** `200 OK` or `404 Not Found`

#### Toggle Task Completion
```http
PATCH /tasks/{id}/toggle
```

**Response:** `200 OK` or `404 Not Found`

#### Delete Task
```http
DELETE /tasks/{id}
```

**Response:** `204 No Content` or `404 Not Found`

### Error Response Format
```json
{
  "timestamp": "2026-02-19T09:20:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Title is required",
  "path": "/api/tasks"
}
```

---

## 🏗️ Architecture

### Backend Architecture

The backend follows a **layered architecture** pattern:

```
Controller Layer → Service Layer → Repository Layer → Database
```

- **Controller Layer**: Handles HTTP requests/responses, input validation
- **Service Layer**: Contains business logic, transaction management
- **Repository Layer**: Data access using Spring Data JPA
- **Entity Layer**: JPA entities representing database tables

### Frontend Architecture

The frontend uses **Redux** for state management:

```
Components → Redux Actions → Async Thunks → API → Backend
                ↓
           Redux Store
                ↓
           Components (re-render)
```

### Key Design Decisions

1. **DTO Pattern**: Separate DTOs for API contracts vs. internal entities
2. **Redux Toolkit**: Modern Redux with built-in best practices
3. **Material-UI**: Consistent, accessible UI components
4. **Docker**: Containerization for consistent environments
5. **Server-side Pagination**: Efficient handling of large datasets

For detailed architecture documentation, see [`plans/architecture-plan.md`](plans/architecture-plan.md).

---

## 🔧 Configuration

### Backend Configuration

**File**: [`backend/src/main/resources/application.yml`](backend/src/main/resources/application.yml)

Key configurations:
- Database connection settings
- JPA/Hibernate settings
- Server port
- CORS configuration
- Logging levels

### Frontend Configuration

**File**: [`frontend/.env`](frontend/.env)

```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

For more Docker commands, see [`plans/docker-setup.md`](plans/docker-setup.md).

---

## 📖 Additional Documentation

- **[Architecture Plan](plans/architecture-plan.md)** - Detailed architecture and design decisions
- **[Implementation Guide](plans/implementation-guide.md)** - Step-by-step backend implementation
- **[Frontend Implementation](plans/frontend-implementation.md)** - Frontend setup and components
- **[Docker Setup](plans/docker-setup.md)** - Docker configuration and commands
- **[Backend README](backend/README.md)** - Backend-specific documentation
- **[Frontend README](frontend/README.md)** - Frontend-specific documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Backend**: Follow Java coding conventions, use Lombok for boilerplate reduction
- **Frontend**: Follow Airbnb React/TypeScript style guide
- **Commits**: Use conventional commits format

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful UI library
- Material-UI team for the beautiful components
- All open-source contributors

---

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

## 🗺️ Roadmap

Future enhancements:
- [ ] User authentication and authorization (JWT)
- [ ] Task categories and tags
- [ ] Task priority levels
- [ ] Recurring tasks
- [ ] Email notifications
- [ ] File attachments
- [ ] Task comments
- [ ] Analytics dashboard
- [ ] Mobile application

---

**Built with ❤️ using Spring Boot, React, and TypeScript**
