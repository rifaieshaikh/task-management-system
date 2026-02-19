package com.taskmanagement.service;

import com.taskmanagement.dto.TaskRequestDTO;
import com.taskmanagement.dto.TaskResponseDTO;
import com.taskmanagement.entity.Task;
import com.taskmanagement.exception.TaskNotFoundException;
import com.taskmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TaskServiceImpl implements TaskService {
    
    private final TaskRepository taskRepository;
    
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
        log.debug("Fetching task by id: {}", id);
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        return convertToDTO(task);
    }
    
    @Override
    public TaskResponseDTO createTask(TaskRequestDTO taskRequest) {
        log.debug("Creating new task: {}", taskRequest.getTitle());
        
        Task task = Task.builder()
                .title(taskRequest.getTitle())
                .description(taskRequest.getDescription())
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
    public TaskResponseDTO updateTask(Long id, TaskRequestDTO taskRequest) {
        log.debug("Updating task with id: {}", id);
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setIsCompleted(taskRequest.getIsCompleted());
        task.setDueDate(taskRequest.getDueDate());
        
        Task updatedTask = taskRepository.save(task);
        log.info("Updated task with id: {}", updatedTask.getId());
        return convertToDTO(updatedTask);
    }
    
    @Override
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
