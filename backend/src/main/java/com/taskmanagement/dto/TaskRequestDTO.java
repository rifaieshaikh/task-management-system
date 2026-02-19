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
