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
    
    // Check if task exists by title (case-insensitive)
    boolean existsByTitleIgnoreCase(String title);
    
    // Search by title or description
    @Query("SELECT t FROM Task t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Task> searchTasks(@Param("search") String search, Pageable pageable);
    
    // Search with completion filter
    @Query("SELECT t FROM Task t WHERE " +
           "t.isCompleted = :completed AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> searchTasksByCompletion(
        @Param("search") String search,
        @Param("completed") Boolean completed,
        Pageable pageable
    );
}
