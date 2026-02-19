# Flyway & Swagger Integration Guide

This document covers the integration of Flyway for database schema migrations and Swagger/OpenAPI for API documentation.

---

## Flyway Database Migration

### Why Flyway?

**Benefits:**
- **Version Control for Database** - Track schema changes like code
- **Repeatable Migrations** - Consistent database state across environments
- **Team Collaboration** - No manual SQL script execution
- **Rollback Support** - Undo migrations if needed
- **Environment Consistency** - Same schema in dev, test, and production

### Maven Dependencies

Add to [`backend/pom.xml`](backend/pom.xml):

```xml
<dependencies>
    <!-- Flyway for database migrations -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>
</dependencies>
```

### Configuration

Update [`backend/src/main/resources/application.yml`](backend/src/main/resources/application.yml):

```yaml
spring:
  application:
    name: task-management-backend
  
  datasource:
    url: jdbc:postgresql://localhost:5432/taskdb
    username: taskuser
    password: taskpass
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate  # Changed from 'update' to 'validate'
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
    baseline-version: 0
    validate-on-migrate: true
    out-of-order: false
    
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC

server:
  port: 8080
  error:
    include-message: always
    include-binding-errors: always

logging:
  level:
    com.taskmanagement: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
    org.flywaydb: INFO
```

### Migration Files Structure

```
backend/src/main/resources/
└── db/
    └── migration/
        ├── V1__create_tasks_table.sql
        ├── V2__add_indexes.sql
        └── V3__add_sample_data.sql (optional)
```

### Migration File Naming Convention

Format: `V{version}__{description}.sql`
- `V` - Versioned migration (required)
- `{version}` - Version number (e.g., 1, 2, 1.1, 2.5)
- `__` - Double underscore separator (required)
- `{description}` - Description with underscores

Examples:
- `V1__create_tasks_table.sql`
- `V2__add_indexes.sql`
- `V3__add_completed_index.sql`
- `V1.1__hotfix_task_title_length.sql`

### Migration Scripts

**File**: [`backend/src/main/resources/db/migration/V1__create_tasks_table.sql`](backend/src/main/resources/db/migration/V1__create_tasks_table.sql)

```sql
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
```

**File**: [`backend/src/main/resources/db/migration/V2__add_indexes.sql`](backend/src/main/resources/db/migration/V2__add_indexes.sql)

```sql
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
CREATE INDEX idx_tasks_description ON tasks USING gin(to_tsvector('english', description));
```

**File**: [`backend/src/main/resources/db/migration/V3__add_sample_data.sql`](backend/src/main/resources/db/migration/V3__add_sample_data.sql) (Optional for development)

```sql
-- Insert sample data for development and testing
-- This migration can be skipped in production

INSERT INTO tasks (title, description, is_completed, due_date, created_at, updated_at) VALUES
('Complete project documentation', 'Write comprehensive documentation for the task management system', false, CURRENT_DATE + INTERVAL '7 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Review pull requests', 'Review and merge pending pull requests from team members', false, CURRENT_DATE + INTERVAL '2 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Update dependencies', 'Update all project dependencies to latest stable versions', false, CURRENT_DATE + INTERVAL '14 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', true, CURRENT_DATE - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('Write unit tests', 'Achieve 80% code coverage with unit tests', false, CURRENT_DATE + INTERVAL '5 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Database optimization', 'Optimize database queries and add necessary indexes', true, CURRENT_DATE - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('Security audit', 'Perform security audit and fix vulnerabilities', false, CURRENT_DATE + INTERVAL '10 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Performance testing', 'Conduct load testing and optimize bottlenecks', false, CURRENT_DATE + INTERVAL '12 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Flyway Commands

```bash
# Run migrations (happens automatically on application startup)
mvn spring-boot:run

# Clean database (removes all objects) - USE WITH CAUTION
mvn flyway:clean

# Get migration info
mvn flyway:info

# Validate migrations
mvn flyway:validate

# Repair migration history (if needed)
mvn flyway:repair

# Baseline existing database
mvn flyway:baseline
```

### Flyway in Docker

The migrations will run automatically when the backend container starts. Ensure the database is ready before backend starts:

```yaml
# In docker-compose.yml
services:
  backend:
    depends_on:
      postgres:
        condition: service_healthy
```

### Rollback Strategy

Flyway doesn't support automatic rollback in the free version. For rollback:

1. **Create undo migration**:
   ```sql
   -- V4__undo_add_priority_column.sql
   ALTER TABLE tasks DROP COLUMN IF EXISTS priority;
   ```

2. **Use database backups** before major migrations

3. **Test migrations** in development/staging first

---

## Swagger/OpenAPI Integration

### Why Swagger?

**Benefits:**
- **Interactive API Documentation** - Test APIs directly from browser
- **Auto-generated Documentation** - Stays in sync with code
- **Client Code Generation** - Generate client SDKs
- **API Discovery** - Easy for frontend developers to explore APIs
- **Standardized Format** - OpenAPI 3.0 specification

### Maven Dependencies

Add to [`backend/pom.xml`](backend/pom.xml):

```xml
<dependencies>
    <!-- SpringDoc OpenAPI (Swagger) -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
</dependencies>
```

### Configuration

**File**: [`backend/src/main/java/com/taskmanagement/config/OpenApiConfig.java`](backend/src/main/java/com/taskmanagement/config/OpenApiConfig.java)

```java
package com.taskmanagement.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Bean
    public OpenAPI taskManagementOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:" + serverPort);
        localServer.setDescription("Local Development Server");
        
        Server dockerServer = new Server();
        dockerServer.setUrl("http://localhost:8080");
        dockerServer.setDescription("Docker Server");
        
        Contact contact = new Contact();
        contact.setName("Task Management Team");
        contact.setEmail("support@taskmanagement.com");
        
        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");
        
        Info info = new Info()
                .title("Task Management API")
                .version("1.0.0")
                .description("RESTful API for managing tasks with full CRUD operations, " +
                           "pagination, sorting, and filtering capabilities.")
                .contact(contact)
                .license(license);
        
        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, dockerServer));
    }
}
```

### Application Properties

Add to [`backend/src/main/resources/application.yml`](backend/src/main/resources/application.yml):

```yaml
# SpringDoc OpenAPI Configuration
springdoc:
  api-docs:
    path: /api-docs
    enabled: true
  swagger-ui:
    path: /swagger-ui.html
    enabled: true
    operations-sorter: method
    tags-sorter: alpha
    display-request-duration: true
    show-extensions: true
    show-common-extensions: true
  show-actuator: true
```

### Controller Annotations

Update [`backend/src/main/java/com/taskmanagement/controller/TaskController.java`](backend/src/main/java/com/taskmanagement/controller/TaskController.java):

```java
package com.taskmanagement.controller;

import com.taskmanagement.dto.TaskRequestDTO;
import com.taskmanagement.dto.TaskResponseDTO;
import com.taskmanagement.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:3000}")
@Tag(name = "Task Management", description = "APIs for managing tasks")
public class TaskController {
    
    private final TaskService taskService;
    
    @Operation(
        summary = "Get all tasks",
        description = "Retrieve a paginated list of tasks with optional filtering and sorting"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved tasks",
            content = @Content(schema = @Schema(implementation = Page.class))
        )
    })
    @GetMapping
    public ResponseEntity<Page<TaskResponseDTO>> getAllTasks(
            @Parameter(description = "Page number (0-indexed)") 
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Number of items per page") 
            @RequestParam(defaultValue = "10") int size,
            
            @Parameter(description = "Field to sort by (createdAt, dueDate, title)") 
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Sort order (asc or desc)") 
            @RequestParam(defaultValue = "desc") String sortOrder,
            
            @Parameter(description = "Filter by completion status") 
            @RequestParam(required = false) Boolean completed,
            
            @Parameter(description = "Search term for title and description") 
            @RequestParam(required = false) String search) {
        
        Sort sort = sortOrder.equalsIgnoreCase("asc") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TaskResponseDTO> tasks = taskService.searchTasks(search, completed, pageable);
        return ResponseEntity.ok(tasks);
    }
    
    @Operation(
        summary = "Get task by ID",
        description = "Retrieve a specific task by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Task found",
            content = @Content(schema = @Schema(implementation = TaskResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Task not found"
        )
    })
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(
            @Parameter(description = "Task ID") 
            @PathVariable Long id) {
        TaskResponseDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }
    
    @Operation(
        summary = "Create a new task",
        description = "Create a new task with the provided details"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Task created successfully",
            content = @Content(schema = @Schema(implementation = TaskResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data"
        )
    })
    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(
            @Parameter(description = "Task details") 
            @Valid @RequestBody TaskRequestDTO taskRequest) {
        TaskResponseDTO createdTask = taskService.createTask(taskRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }
    
    @Operation(
        summary = "Update a task",
        description = "Update an existing task with new details"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Task updated successfully",
            content = @Content(schema = @Schema(implementation = TaskResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Task not found"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data"
        )
    })
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @Parameter(description = "Task ID") 
            @PathVariable Long id,
            @Parameter(description = "Updated task details") 
            @Valid @RequestBody TaskRequestDTO taskRequest) {
        TaskResponseDTO updatedTask = taskService.updateTask(id, taskRequest);
        return ResponseEntity.ok(updatedTask);
    }
    
    @Operation(
        summary = "Toggle task completion",
        description = "Toggle the completion status of a task"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Task completion toggled successfully",
            content = @Content(schema = @Schema(implementation = TaskResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Task not found"
        )
    })
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponseDTO> toggleTaskCompletion(
            @Parameter(description = "Task ID") 
            @PathVariable Long id) {
        TaskResponseDTO updatedTask = taskService.toggleTaskCompletion(id);
        return ResponseEntity.ok(updatedTask);
    }
    
    @Operation(
        summary = "Delete a task",
        description = "Delete a task by its ID"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "Task deleted successfully"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Task not found"
        )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @Parameter(description = "Task ID") 
            @PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
```

### DTO Schema Annotations

Update DTOs with schema annotations:

**File**: [`backend/src/main/java/com/taskmanagement/dto/TaskRequestDTO.java`](backend/src/main/java/com/taskmanagement/dto/TaskRequestDTO.java)

```java
package com.taskmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating or updating a task")
public class TaskRequestDTO {
    
    @Schema(
        description = "Task title",
        example = "Complete project documentation",
        required = true,
        maxLength = 200
    )
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Schema(
        description = "Task description",
        example = "Write comprehensive documentation for the task management system",
        maxLength = 1000
    )
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Schema(
        description = "Task completion status",
        example = "false",
        defaultValue = "false"
    )
    private Boolean isCompleted;
    
    @Schema(
        description = "Task due date",
        example = "2026-02-25",
        type = "string",
        format = "date"
    )
    private LocalDate dueDate;
}
```

**File**: [`backend/src/main/java/com/taskmanagement/dto/TaskResponseDTO.java`](backend/src/main/java/com/taskmanagement/dto/TaskResponseDTO.java)

```java
package com.taskmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object containing task details")
public class TaskResponseDTO {
    
    @Schema(description = "Task ID", example = "1")
    private Long id;
    
    @Schema(description = "Task title", example = "Complete project documentation")
    private String title;
    
    @Schema(description = "Task description", example = "Write comprehensive documentation")
    private String description;
    
    @Schema(description = "Task completion status", example = "false")
    private Boolean isCompleted;
    
    @Schema(description = "Task due date", example = "2026-02-25")
    private LocalDate dueDate;
    
    @Schema(description = "Task creation timestamp", example = "2026-02-19T09:00:00Z")
    private LocalDateTime createdAt;
    
    @Schema(description = "Task last update timestamp", example = "2026-02-19T09:00:00Z")
    private LocalDateTime updatedAt;
}
```

### Accessing Swagger UI

Once the application is running:

1. **Swagger UI**: http://localhost:8080/swagger-ui.html
2. **OpenAPI JSON**: http://localhost:8080/api-docs
3. **OpenAPI YAML**: http://localhost:8080/api-docs.yaml

### Swagger UI Features

- **Try it out**: Test APIs directly from the browser
- **Request/Response examples**: See sample data
- **Schema definitions**: View data models
- **Authentication**: Add auth headers (for future JWT integration)
- **Download OpenAPI spec**: Export API specification

### Customizing Swagger UI

Add custom CSS or JavaScript:

```yaml
# application.yml
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    custom-css: /swagger-ui-custom.css
    custom-js: /swagger-ui-custom.js
```

---

## Integration Testing with Flyway

**File**: [`backend/src/test/resources/application-test.yml`](backend/src/test/resources/application-test.yml)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  
  jpa:
    hibernate:
      ddl-auto: validate
    database-platform: org.hibernate.dialect.H2Dialect
  
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

---

## Best Practices

### Flyway Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Test migrations** in development before production
3. **Use descriptive names** for migration files
4. **Keep migrations small** - One logical change per migration
5. **Version control migrations** - Commit with code changes
6. **Backup before major migrations** - Safety first
7. **Use transactions** - Wrap DDL in transactions when possible

### Swagger Best Practices

1. **Document all endpoints** - Complete API coverage
2. **Provide examples** - Help developers understand usage
3. **Use meaningful descriptions** - Clear and concise
4. **Group related endpoints** - Use tags effectively
5. **Document error responses** - Include all status codes
6. **Keep documentation updated** - Sync with code changes
7. **Secure Swagger UI** - Disable in production or add authentication

---

## Updated Maven POM

Complete dependencies section:

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Flyway for database migrations -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>
    
    <!-- SpringDoc OpenAPI (Swagger) -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## Verification Steps

### Verify Flyway

1. **Check migration status**:
   ```bash
   mvn flyway:info
   ```

2. **View flyway_schema_history table**:
   ```sql
   SELECT * FROM flyway_schema_history;
   ```

3. **Check application logs**:
   ```
   Flyway Community Edition ... by Redgate
   Database: jdbc:postgresql://localhost:5432/taskdb (PostgreSQL 16.0)
   Successfully validated 3 migrations (execution time 00:00.015s)
   Current version of schema "public": 3
   Schema "public" is up to date. No migration necessary.
   ```

### Verify Swagger

1. **Access Swagger UI**: http://localhost:8080/swagger-ui.html
2. **Test an endpoint**: Click "Try it out" on GET /api/tasks
3. **View OpenAPI spec**: http://localhost:8080/api-docs
4. **Check all endpoints are documented**

---

This integration provides professional database version control and interactive API documentation for your task management system.
