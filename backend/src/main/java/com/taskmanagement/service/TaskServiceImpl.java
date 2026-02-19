package com.taskmanagement.service;

import com.taskmanagement.dto.TaskRequestDTO;
import com.taskmanagement.dto.TaskResponseDTO;
import com.taskmanagement.entity.Task;
import com.taskmanagement.exception.TaskNotFoundException;
import com.taskmanagement.repository.TaskRepository;
import com.taskmanagement.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class TaskServiceImpl implements TaskService {
    
    private final TaskRepository taskRepository;
    private final ValidationUtils validationUtils;
    
    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> getAllTasks(Pageable pageable) {
        log.debug("Fetching all tasks with pagination: {}", pageable);
        return taskRepository.findAll(pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> getTasksByCompletion(Boolean completed, Pageable pageable) {
        log.debug("Fetching tasks by completion status: {} with pagination: {}", completed, pageable);
        return taskRepository.findByIsCompleted(completed, pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDTO> searchTasks(String search, Boolean completed, Pageable pageable) {
        log.debug("Searching tasks with search: '{}', completed: {}, pagination: {}", search, completed, pageable);
        
        if (search == null || search.trim().isEmpty()) {
            return completed != null
                ? getTasksByCompletion(completed, pageable)
                : getAllTasks(pageable);
        }
        
        // Sanitize search term to prevent SQL injection
        String sanitizedSearch = validationUtils.sanitizeSearchTerm(search);
        log.debug("Sanitized search term: '{}'", sanitizedSearch);
        
        if (completed != null) {
            return taskRepository.searchTasksByCompletion(sanitizedSearch, completed, pageable)
                    .map(this::convertToDTO);
        }
        
        return taskRepository.searchTasks(sanitizedSearch, pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public TaskResponseDTO getTaskById(Long id) {
        log.debug("Fetching task by id: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        return convertToDTO(task);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskResponseDTO createTask(TaskRequestDTO taskRequest) {
        log.debug("Creating new task: {}", taskRequest.getTitle());
        
        // Sanitize and validate inputs
        String sanitizedTitle = validationUtils.sanitizeTitle(taskRequest.getTitle());
        String sanitizedDescription = taskRequest.getDescription() != null
            ? validationUtils.sanitizeDescription(taskRequest.getDescription())
            : null;
        
        // Business logic validation: Check for duplicate titles
        if (taskRepository.existsByTitleIgnoreCase(sanitizedTitle)) {
            log.warn("Attempted to create task with duplicate title: {}", sanitizedTitle);
            throw new IllegalArgumentException("A task with this title already exists");
        }
        
        // Business logic validation: Due date cannot be in the past
        if (taskRequest.getDueDate() != null && taskRequest.getDueDate().isBefore(LocalDate.now())) {
            log.warn("Attempted to create task with past due date: {}", taskRequest.getDueDate());
            throw new IllegalArgumentException("Due date cannot be in the past");
        }
        
        Task task = Task.builder()
                .title(sanitizedTitle)
                .description(sanitizedDescription)
                .isCompleted(taskRequest.getIsCompleted() != null
                    ? taskRequest.getIsCompleted()
                    : false)
                .dueDate(taskRequest.getDueDate())
                .build();
        
        Task savedTask = taskRepository.save(task);
        log.info("Created task with id: {}", savedTask.getId());
        return convertToDTO(savedTask);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO taskRequest) {
        log.debug("Updating task with id: {}", id);
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        
        // Sanitize and validate inputs
        String sanitizedTitle = validationUtils.sanitizeTitle(taskRequest.getTitle());
        String sanitizedDescription = taskRequest.getDescription() != null
            ? validationUtils.sanitizeDescription(taskRequest.getDescription())
            : null;
        
        // Business logic validation: Check for duplicate titles (excluding current task)
        if (!task.getTitle().equalsIgnoreCase(sanitizedTitle) &&
            taskRepository.existsByTitleIgnoreCase(sanitizedTitle)) {
            log.warn("Attempted to update task {} with duplicate title: {}", id, sanitizedTitle);
            throw new IllegalArgumentException("A task with this title already exists");
        }
        
        // Business logic validation: Due date cannot be in the past
        if (taskRequest.getDueDate() != null && taskRequest.getDueDate().isBefore(LocalDate.now())) {
            log.warn("Attempted to update task {} with past due date: {}", id, taskRequest.getDueDate());
            throw new IllegalArgumentException("Due date cannot be in the past");
        }
        
        task.setTitle(sanitizedTitle);
        task.setDescription(sanitizedDescription);
        task.setIsCompleted(taskRequest.getIsCompleted());
        task.setDueDate(taskRequest.getDueDate());
        
        Task updatedTask = taskRepository.save(task);
        log.info("Updated task with id: {}", updatedTask.getId());
        return convertToDTO(updatedTask);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskResponseDTO toggleTaskCompletion(Long id) {
        log.debug("Toggling completion status for task with id: {}", id);
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        
        task.setIsCompleted(!task.getIsCompleted());
        Task updatedTask = taskRepository.save(task);
        log.info("Toggled completion status for task with id: {} to: {}",
                updatedTask.getId(), updatedTask.getIsCompleted());
        return convertToDTO(updatedTask);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTask(Long id) {
        log.debug("Deleting task with id: {}", id);
        
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException(id);
        }
        
        taskRepository.deleteById(id);
        log.info("Deleted task with id: {}", id);
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
