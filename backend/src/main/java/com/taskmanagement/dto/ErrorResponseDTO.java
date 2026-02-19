package com.taskmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Error response object")
public class ErrorResponseDTO {
    
    @Schema(description = "Error timestamp", example = "2026-02-19T09:20:00Z")
    private LocalDateTime timestamp;
    
    @Schema(description = "HTTP status code", example = "400")
    private int status;
    
    @Schema(description = "Error type", example = "Bad Request")
    private String error;
    
    @Schema(description = "Error message", example = "Title is required")
    private String message;
    
    @Schema(description = "Request path", example = "/api/tasks")
    private String path;
}
