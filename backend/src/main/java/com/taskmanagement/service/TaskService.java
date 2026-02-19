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
