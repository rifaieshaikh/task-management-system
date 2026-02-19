# Task Management System - Implementation Guide

This guide provides step-by-step instructions for implementing the task management system.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Java 21** (JDK)
- **Maven 3.8+**
- **Node.js 18+** and npm
- **Docker** and Docker Compose
- **Git**
- **IDE**: IntelliJ IDEA (recommended for Java) or VS Code

---

## Phase 1: Project Setup & Infrastructure

### Step 1.1: Create Directory Structure

```bash
# Create main project directory (already exists)
cd task-management-system

# Create backend structure
mkdir -p backend/src/main/java/com/taskmanagement/{config,controller,dto,entity,exception,repository,service}
mkdir -p backend/src/main/resources
mkdir -p backend/src/test/java/com/taskmanagement/{controller,service,integration}

# Create frontend structure
mkdir -p frontend/public
mkdir -p frontend/src/{api,components/{TaskList,TaskForm,TaskDetails,common},pages,store/slices,types,utils}
mkdir -p frontend/e2e
```

### Step 1.2: Initialize Git

```bash
# Create .gitignore
cat > .gitignore << 'EOF'
# Backend
backend/target/
backend/.mvn/
backend/mvnw
backend/mvnw.cmd
backend/.idea/
backend/*.iml

# Frontend
frontend/node_modules/
frontend/build/
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local
frontend/coverage/
frontend/playwright-report/
frontend/test-results/

# Docker
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF

git init
git add .gitignore
git commit -m "Initial commit: Add .gitignore"
```

---

## Phase 2: Backend Implementation

### Step 2.1: Create Maven POM File

**File**: [`backend/pom.xml`](backend/pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.2</version>
        <relativePath/>
    </parent>
    
    <groupId>com.taskmanagement</groupId>
    <artifactId>task-management-backend</artifactId>
    <version>1.0.0</version>
    <name>Task Management Backend</name>
    <description>Backend API for Task Management System</description>
    
    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
    
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
        
        <!-- Lombok (optional, for reducing boilerplate) -->
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
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### Step 2.2: Create Application Configuration

**File**: [`backend/src/main/resources/application.yml`](backend/src/main/resources/application.yml)

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
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
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
```

**File**: [`backend/src/main/resources/application-docker.yml`](backend/src/main/resources/application-docker.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/taskdb
    username: taskuser
    password: taskpass
```

### Step 2.3: Create Main Application Class

**File**: [`backend/src/main/java/com/taskmanagement/TaskManagementApplication.java`](backend/src/main/java/com/taskmanagement/TaskManagementApplication.java)

```java
package com.taskmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TaskManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskManagementApplication.class, args);
    }
}
```

### Step 2.4: Create Task Entity

**File**: [`backend/src/main/java/com/taskmanagement/entity/Task.java`](backend/src/main/java/com/taskmanagement/entity/Task.java)

```java
package com.taskmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Column(nullable = false, length = 200)
    private String title;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false, name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isCompleted == null) {
            isCompleted = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Step 2.5: Create DTOs

**File**: [`backend/src/main/java/com/taskmanagement/dto/TaskRequestDTO.java`](backend/src/main/java/com/taskmanagement/dto/TaskRequestDTO.java)

```java
package com.taskmanagement.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequestDTO {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Boolean isCompleted;
    
    private LocalDate dueDate;
}
```

**File**: [`backend/src/main/java/com/taskmanagement/dto/TaskResponseDTO.java`](backend/src/main/java/com/taskmanagement/dto/TaskResponseDTO.java)

```java
package com.taskmanagement.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Boolean isCompleted;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**File**: [`backend/src/main/java/com/taskmanagement/dto/ErrorResponseDTO.java`](backend/src/main/java/com/taskmanagement/dto/ErrorResponseDTO.java)

```java
package com.taskmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponseDTO {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
```

### Step 2.6: Create Repository

**File**: [`backend/src/main/java/com/taskmanagement/repository/TaskRepository.java`](backend/src/main/java/com/taskmanagement/repository/TaskRepository.java)

```java
package com.taskmanagement.repository;

import com.taskmanagement.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Find by completion status
    Page<Task> findByIsCompleted(Boolean isCompleted, Pageable pageable);
    
    // Search by title or description
    @Query("SELECT t FROM Task t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Task> searchTasks(@Param("search") String search, Pageable pageable);
    
    // Search with completion filter
    @Query("SELECT t FROM Task t WHERE " +
           "t.isCompleted = :completed AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> searchTasksByCompletion(
        @Param("search") String search,
        @Param("completed") Boolean completed,
        Pageable pageable
    );
}
```

### Step 2.7: Create Custom Exceptions

**File**: [`backend/src/main/java/com/taskmanagement/exception/TaskNotFoundException.java`](backend/src/main/java/com/taskmanagement/exception/TaskNotFoundException.java)

```java
package com.taskmanagement.exception;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Long id) {
        super("Task not found with id: " + id);
    }
}
```

**File**: [`backend/src/main/java/com/taskmanagement/exception/GlobalExceptionHandler.java`](backend/src/main/java/com/taskmanagement/exception/GlobalExceptionHandler.java)

```java
package com.taskmanagement.exception;

import com.taskmanagement.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleTaskNotFound(
            TaskNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponseDTO error = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        
        ErrorResponseDTO error = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        
        ErrorResponseDTO error = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred")
                .path(request.getRequestURI())
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### Step 2.8: Create Service Layer

**File**: [`backend/src/main/java/com/taskmanagement/service/TaskService.java`](backend/src/main/java/com/taskmanagement/service/TaskService.java)

```java
package com.taskmanagement.service;

import com.taskmanagement.dto.TaskRequestDTO;
import com.taskmanagement.dto.TaskResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    Page<TaskResponseDTO> getAllTasks(Pageable pageable);
    Page<TaskResponseDTO> getTasksByCompletion(Boolean completed, Pageable pageable);
    Page<TaskResponseDTO> searchTasks(String search, Boolean completed, Pageable pageable);
    TaskResponseDTO getTaskById(Long id);
    TaskResponseDTO createTask(TaskRequestDTO taskRequest);
    TaskResponseDTO updateTask(Long id, TaskRequestDTO taskRequest);
    TaskResponseDTO toggleTaskCompletion(Long id);
    void deleteTask(Long id);
}
```

**File**: [`backend/src/main/java/com/taskmanagement/service/TaskServiceImpl.java`](backend/src/main/java/com/taskmanagement/service/TaskServiceImpl.java)

```java
package com.taskmanagement.service;

import com.taskmanagement.dto.TaskRequestDTO;
import com.taskmanagement.dto.TaskResponseDTO;
import com.taskmanagement.entity.Task;
import com.taskmanagement.exception.TaskNotFoundException;
import com.taskmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {
    
    private final TaskRepository taskRepository;
    
    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> getTasksByCompletion(Boolean completed, Pageable pageable) {
        return taskRepository.findByIsCompleted(completed, pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> searchTasks(String search, Boolean completed, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return completed != null 
                ? getTasksByCompletion(completed, pageable)
                : getAllTasks(pageable);
        }
        
        if (completed != null) {
            return taskRepository.searchTasksByCompletion(search, completed, pageable)
                    .map(this::convertToDTO);
        }
        
        return taskRepository.searchTasks(search, pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public TaskResponseDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        return convertToDTO(task);
    }
    
    @Override
    public TaskResponseDTO createTask(TaskRequestDTO taskRequest) {
        Task task = Task.builder()
                .title(taskRequest.getTitle())
                .description(taskRequest.getDescription())
                .isCompleted(taskRequest.getIsCompleted() != null 
                    ? taskRequest.getIsCompleted() 
                    : false)
                .dueDate(taskRequest.getDueDate())
                .build();
        
        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }
    
    @Override
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO taskRequest) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setIsCompleted(taskRequest.getIsCompleted());
        task.setDueDate(taskRequest.getDueDate());
        
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }
    
    @Override
    public TaskResponseDTO toggleTaskCompletion(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        
        task.setIsCompleted(!task.getIsCompleted());
        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }
    
    @Override
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
    }
    
    private TaskResponseDTO convertToDTO(Task task) {
        return TaskResponseDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .isCompleted(task.getIsCompleted())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
```

### Step 2.9: Create Controller

**File**: [`backend/src/main/java/com/taskmanagement/controller/TaskController.java`](backend/src/main/java/com/taskmanagement/controller/TaskController.java)

```java
package com.taskmanagement.controller;

import com.taskmanagement.dto.TaskRequestDTO;
import com.taskmanagement.dto.TaskResponseDTO;
import com.taskmanagement.service.TaskService;
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
public class TaskController {
    
    private final TaskService taskService;
    
    @GetMapping
    public ResponseEntity<Page<TaskResponseDTO>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String search) {
        
        Sort sort = sortOrder.equalsIgnoreCase("asc") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<TaskResponseDTO> tasks = taskService.searchTasks(search, completed, pageable);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable Long id) {
        TaskResponseDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }
    
    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(
            @Valid @RequestBody TaskRequestDTO taskRequest) {
        TaskResponseDTO createdTask = taskService.createTask(taskRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequestDTO taskRequest) {
        TaskResponseDTO updatedTask = taskService.updateTask(id, taskRequest);
        return ResponseEntity.ok(updatedTask);
    }
    
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponseDTO> toggleTaskCompletion(@PathVariable Long id) {
        TaskResponseDTO updatedTask = taskService.toggleTaskCompletion(id);
        return ResponseEntity.ok(updatedTask);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Step 2.10: Create CORS Configuration

**File**: [`backend/src/main/java/com/taskmanagement/config/CorsConfig.java`](backend/src/main/java/com/taskmanagement/config/CorsConfig.java)

```java
package com.taskmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
```

---

## Phase 3: Backend Testing

### Step 3.1: Service Tests

**File**: [`backend/src/test/java/com/taskmanagement/service/TaskServiceTest.java`](backend/src/test/java/com/taskmanagement/service/TaskServiceTest.java)

```java
package com.taskmanagement.service;

import com.taskmanagement.dto.TaskRequestDTO;
import com.taskmanagement.dto.TaskResponseDTO;
import com.taskmanagement.entity.Task;
import com.taskmanagement.exception.TaskNotFoundException;
import com.taskmanagement.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    
    @Mock
    private TaskRepository taskRepository;
    
    @InjectMocks
    private TaskServiceImpl taskService;
    
    private Task task;
    private TaskRequestDTO taskRequest;
    
    @BeforeEach
    void setUp() {
        task = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .isCompleted(false)
                .dueDate(LocalDate.now().plusDays(7))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        taskRequest = TaskRequestDTO.builder()
                .title("Test Task")
                .description("Test Description")
                .isCompleted(false)
                .dueDate(LocalDate.now().plusDays(7))
                .build();
    }
    
    @Test
    void shouldCreateTask() {
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        
        TaskResponseDTO result = taskService.createTask(taskRequest);
        
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Task");
        verify(taskRepository, times(1)).save(any(Task.class));
    }
    
    @Test
    void shouldGetTaskById() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        
        TaskResponseDTO result = taskService.getTaskById(1L);
        
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(taskRepository, times(1)).findById(1L);
    }
    
    @Test
    void shouldThrowExceptionWhenTaskNotFound() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());
        
        assertThatThrownBy(() -> taskService.getTaskById(999L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("Task not found with id: 999");
    }
    
    @Test
    void shouldUpdateTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        
        TaskRequestDTO updateRequest = TaskRequestDTO.builder()
                .title("Updated Task")
                .description("Updated Description")
                .isCompleted(true)
                .dueDate(LocalDate.now().plusDays(14))
                .build();
        
        TaskResponseDTO result = taskService.updateTask(1L, updateRequest);
        
        assertThat(result).isNotNull();
        verify(taskRepository, times(1)).save(any(Task.class));
    }
    
    @Test
    void shouldToggleTaskCompletion() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        
        taskService.toggleTaskCompletion(1L);
        
        verify(taskRepository, times(1)).save(any(Task.class));
    }
    
    @Test
    void shouldDeleteTask() {
        when(taskRepository.existsById(1L)).thenReturn(true);
        doNothing().when(taskRepository).deleteById(1L);
        
        taskService.deleteTask(1L);
        
        verify(taskRepository, times(1)).deleteById(1L);
    }
}
```

### Step 3.2: Controller Tests

**File**: [`backend/src/test/java/com/taskmanagement/controller/TaskControllerTest.java`](backend/src/test/java/com