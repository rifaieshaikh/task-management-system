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
