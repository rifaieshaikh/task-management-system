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
