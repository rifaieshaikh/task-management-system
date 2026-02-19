# System Architecture

## Overview

The Task Management System follows a modern three-tier architecture with clear separation of concerns, implementing industry best practices for scalability, security, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           React SPA (TypeScript)                       │ │
│  │  - Material-UI Components                              │ │
│  │  - Redux State Management                              │ │
│  │  - Axios HTTP Client                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Spring Boot Backend (Java 21)                  │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Controllers (REST API)                          │ │ │
│  │  │  - TaskController                                │ │ │
│  │  │  - Exception Handlers                            │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Services (Business Logic)                       │ │ │
│  │  │  - TaskService                                   │ │ │
│  │  │  - Validation                                    │ │ │
│  │  │  - Transaction Management                        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Repositories (Data Access)                      │ │ │
│  │  │  - TaskRepository (Spring Data JPA)              │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JDBC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database                       │ │
│  │  - Tasks Table                                         │ │
│  │  - Indexes for Performance                             │ │
│  │  - Flyway Migrations                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Spring Boot | 3.2.2 | Application framework |
| Language | Java | 21 | Programming language |
| Database | PostgreSQL | 15+ | Relational database |
| ORM | Hibernate/JPA | 6.x | Object-relational mapping |
| Migration | Flyway | 10.x | Database version control |
| API Docs | SpringDoc OpenAPI | 2.x | API documentation |
| Build Tool | Maven | 3.9+ | Dependency management |
| Logging | Logback | 1.4.x | Structured logging |

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19.x | UI framework |
| Language | TypeScript | 4.9+ | Type-safe JavaScript |
| State | Redux Toolkit | 2.x | State management |
| UI Library | Material-UI | 5.x | Component library |
| HTTP Client | Axios | 1.x | API communication |
| Date Utils | date-fns | 3.x | Date manipulation |
| Build Tool | Create React App | 5.x | Build configuration |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker | Application packaging |
| Orchestration | Docker Compose | Multi-container management |
| Reverse Proxy | Nginx | Frontend serving & API proxy |
| Monitoring | Prometheus | Metrics collection |
| Health Checks | Spring Actuator | Application health |

## Design Patterns

### Backend Patterns

#### 1. Layered Architecture

```
Controller Layer → Service Layer → Repository Layer → Database
```

- **Controllers**: Handle HTTP requests/responses, validation
- **Services**: Implement business logic, transactions
- **Repositories**: Data access abstraction
- **Entities**: Domain models

#### 2. Data Transfer Objects (DTO)

```java
TaskRequestDTO  → Controller → Service → Entity
Entity → Service → TaskResponseDTO → Controller
```

Separates API contracts from domain models, enabling:
- API versioning without breaking changes
- Validation at API boundary
- Reduced data exposure

#### 3. Repository Pattern

```java
public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("SELECT t FROM Task t WHERE ...")
    Page<Task> findByFilters(...);
}
```

Abstracts data access, enabling:
- Easy testing with mocks
- Database independence
- Query optimization

#### 4. Exception Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFound(...) {
        // Centralized error handling
    }
}
```

Provides consistent error responses across the API.

### Frontend Patterns

#### 1. Component-Based Architecture

```
App
├── TaskList (Container)
│   ├── TaskItem (Presentational)
│   └── TaskForm (Presentational)
└── Common Components
    ├── Loading
    ├── ErrorAlert
    └── ErrorBoundary
```

#### 2. Redux State Management

```typescript
State → Actions → Reducers → New State → UI Update
```

Centralized state with predictable updates:
- Single source of truth
- Time-travel debugging
- Middleware support

#### 3. Custom Hooks

```typescript
const { executeWithRetry, retrying } = useRetry({
    maxAttempts: 3,
    initialDelay: 1000
});
```

Reusable logic extraction for:
- Retry mechanisms
- API calls
- Side effects

#### 4. Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
    <TaskList />
</ErrorBoundary>
```

Graceful error handling preventing app crashes.

## Data Flow

### Create Task Flow

```
1. User fills form → TaskForm component
2. Form validation → Client-side
3. Redux action dispatched → createTask thunk
4. HTTP POST → /api/tasks
5. Controller validation → @Valid annotation
6. Service validation → Business rules
7. Repository save → Database
8. Response DTO → Client
9. Redux state update → UI refresh
```

### Optimistic Update Flow

```
1. User toggles task → TaskItem component
2. Optimistic update → Redux state (immediate UI)
3. API call → PATCH /api/tasks/{id}/toggle
4. Success → Clear optimistic state
5. Failure → Rollback to original state
6. Show error → User notification
```

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_search ON tasks USING gin(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);
```

### Migration Strategy

- **Flyway** manages schema versions
- **Versioned migrations** (V1__, V2__, etc.)
- **Repeatable migrations** for views/functions
- **Rollback scripts** for production safety

## Security Architecture

### Defense in Depth

```
1. Input Validation (Frontend)
   ↓
2. CORS Policy (Browser)
   ↓
3. Rate Limiting (Backend)
   ↓
4. Input Sanitization (Backend)
   ↓
5. SQL Injection Prevention (JPA/Hibernate)
   ↓
6. Database Permissions (PostgreSQL)
```

### Security Layers

1. **Frontend Validation**
   - Client-side form validation
   - Type safety with TypeScript
   - XSS prevention with React

2. **API Security**
   - CORS configuration
   - Rate limiting (60 req/min per IP)
   - Input sanitization
   - Bean validation

3. **Database Security**
   - Parameterized queries (JPA)
   - Connection pooling
   - SSL/TLS encryption
   - Least privilege access

## Performance Optimizations

### Backend

1. **Database Connection Pooling**
   ```yaml
   hikari:
     maximum-pool-size: 20
     minimum-idle: 5
   ```

2. **Hibernate Caching**
   - Second-level cache
   - Query cache
   - Batch operations

3. **Pagination**
   - Limit result sets
   - Cursor-based for large datasets

4. **Indexes**
   - B-tree for equality/range
   - GIN for full-text search

### Frontend

1. **Code Splitting**
   - Lazy loading routes
   - Dynamic imports

2. **Memoization**
   - React.memo for components
   - useMemo for expensive calculations

3. **Optimistic Updates**
   - Immediate UI feedback
   - Background sync

4. **Caching**
   - Redux state persistence
   - HTTP caching headers

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    ├── Backend Instance 1
    ├── Backend Instance 2
    └── Backend Instance 3
         ↓
    Database (Primary)
         ├── Read Replica 1
         └── Read Replica 2
```

### Vertical Scaling

- Increase JVM heap size
- Optimize database parameters
- Add more CPU/RAM

### Caching Strategy

```
Browser Cache → CDN → Application Cache → Database
```

## Monitoring & Observability

### Metrics Collection

```
Application → Spring Actuator → Prometheus → Grafana
```

### Health Checks

- Database connectivity
- Disk space
- Memory usage
- Custom business metrics

### Logging Strategy

```
Application Logs → Logback → JSON Format → Log Aggregation
```

- Structured logging (JSON)
- Log levels per environment
- Correlation IDs for tracing
- Sensitive data masking

## Deployment Architecture

### Development

```
Docker Compose
├── PostgreSQL (port 5432)
├── Backend (port 8080)
└── Frontend (port 3000)
```

### Production

```
Nginx (HTTPS)
    ├── Static Files (Frontend)
    └── Reverse Proxy → Backend
                          ↓
                    PostgreSQL (SSL)
```

## Future Enhancements

### Planned Features

1. **Authentication & Authorization**
   - JWT tokens
   - OAuth2 integration
   - Role-based access control

2. **Real-time Updates**
   - WebSocket support
   - Server-sent events
   - Push notifications

3. **Advanced Features**
   - Task categories/tags
   - File attachments
   - Task comments
   - Activity history

4. **Microservices Migration**
   - Service decomposition
   - API Gateway
   - Service mesh
   - Event-driven architecture

### Scalability Roadmap

1. **Phase 1**: Optimize current monolith
2. **Phase 2**: Add caching layer (Redis)
3. **Phase 3**: Implement read replicas
4. **Phase 4**: Microservices architecture
5. **Phase 5**: Event-driven with message queue

## Best Practices

### Code Quality

- **SOLID principles**
- **Clean code standards**
- **Comprehensive testing**
- **Code reviews**
- **Documentation**

### DevOps

- **CI/CD pipelines**
- **Automated testing**
- **Infrastructure as Code**
- **Monitoring & alerting**
- **Disaster recovery**

### Security

- **Regular dependency updates**
- **Security scanning**
- **Penetration testing**
- **Incident response plan**
- **Data encryption**

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable, and secure task management system. The modular design allows for easy extension and modification as requirements evolve.
