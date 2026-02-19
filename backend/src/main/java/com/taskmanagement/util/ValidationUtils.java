package com.taskmanagement.util;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Utility class for input validation and sanitization
 * Prevents SQL injection and other security vulnerabilities
 */
@Component
public class ValidationUtils {
    
    // Pattern to detect SQL injection attempts
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        ".*([';\"\\-\\-]|(/\\*|\\*/)|" +
        "(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\\b)).*",
        Pattern.CASE_INSENSITIVE
    );
    
    // Maximum lengths
    private static final int MAX_SEARCH_LENGTH = 100;
    private static final int MAX_TITLE_LENGTH = 200;
    private static final int MAX_DESCRIPTION_LENGTH = 2000;
    
    /**
     * Sanitize search term to prevent SQL injection
     * @param searchTerm The search term to sanitize
     * @return Sanitized search term
     * @throws IllegalArgumentException if search term contains malicious content
     */
    public String sanitizeSearchTerm(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return "";
        }
        
        // Trim and limit length
        String sanitized = searchTerm.trim();
        if (sanitized.length() > MAX_SEARCH_LENGTH) {
            sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
        }
        
        // Check for SQL injection patterns
        if (SQL_INJECTION_PATTERN.matcher(sanitized).matches()) {
            throw new IllegalArgumentException("Search term contains invalid characters");
        }
        
        // Escape special LIKE characters
        sanitized = sanitized
            .replace("\\", "\\\\")  // Escape backslash first
            .replace("%", "\\%")    // Escape percent
            .replace("_", "\\_");   // Escape underscore
        
        return sanitized;
    }
    
    /**
     * Validate and sanitize task title
     * @param title The title to sanitize
     * @return Sanitized title
     * @throws IllegalArgumentException if title is invalid
     */
    public String sanitizeTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        
        String sanitized = title.trim();
        
        // Remove control characters
        sanitized = sanitized.replaceAll("[\\p{Cntrl}]", "");
        
        if (sanitized.isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty after sanitization");
        }
        
        if (sanitized.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("Title must be less than " + MAX_TITLE_LENGTH + " characters");
        }
        
        return sanitized;
    }
    
    /**
     * Validate and sanitize task description
     * @param description The description to sanitize
     * @return Sanitized description or null if empty
     * @throws IllegalArgumentException if description is too long
     */
    public String sanitizeDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return null;
        }
        
        String sanitized = description.trim();
        
        // Remove control characters except newlines and tabs
        sanitized = sanitized.replaceAll("[\\p{Cntrl}&&[^\n\t]]", "");
        
        if (sanitized.length() > MAX_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException("Description must be less than " + MAX_DESCRIPTION_LENGTH + " characters");
        }
        
        return sanitized.isEmpty() ? null : sanitized;
    }
    
    /**
     * Check if a string contains potential SQL injection patterns
     * @param input The input to check
     * @return true if potentially malicious, false otherwise
     */
    public boolean containsSQLInjectionPattern(String input) {
        if (input == null || input.isEmpty()) {
            return false;
        }
        return SQL_INJECTION_PATTERN.matcher(input).matches();
    }
}
