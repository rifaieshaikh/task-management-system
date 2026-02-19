package com.taskmanagement.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Rate limiting interceptor to prevent API abuse
 * Implements sliding window algorithm with per-IP rate limiting
 */
@Component
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private final Map<String, Queue<Instant>> requestTimestamps = new ConcurrentHashMap<>();
    
    // Rate limit: 60 requests per minute per IP
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final Duration TIME_WINDOW = Duration.ofMinutes(1);
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = getClientIP(request);
        
        if (isRateLimitExceeded(clientIp)) {
            log.warn("Rate limit exceeded for IP: {}", clientIp);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again later.\",\"retryAfter\":60}"
            );
            return false;
        }
        
        // Add current request timestamp
        recordRequest(clientIp);
        
        // Add rate limit headers
        int remainingRequests = getRemainingRequests(clientIp);
        response.addHeader("X-Rate-Limit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
        response.addHeader("X-Rate-Limit-Remaining", String.valueOf(remainingRequests));
        response.addHeader("X-Rate-Limit-Reset", String.valueOf(Instant.now().plus(TIME_WINDOW).getEpochSecond()));
        
        return true;
    }
    
    /**
     * Check if rate limit is exceeded for the given IP
     */
    private boolean isRateLimitExceeded(String clientIp) {
        Queue<Instant> timestamps = requestTimestamps.computeIfAbsent(clientIp, k -> new ConcurrentLinkedQueue<>());
        
        // Remove old timestamps outside the time window
        Instant cutoff = Instant.now().minus(TIME_WINDOW);
        timestamps.removeIf(timestamp -> timestamp.isBefore(cutoff));
        
        return timestamps.size() >= MAX_REQUESTS_PER_MINUTE;
    }
    
    /**
     * Record a request for the given IP
     */
    private void recordRequest(String clientIp) {
        Queue<Instant> timestamps = requestTimestamps.computeIfAbsent(clientIp, k -> new ConcurrentLinkedQueue<>());
        timestamps.add(Instant.now());
        
        // Clean up old entries to prevent memory leaks
        Instant cutoff = Instant.now().minus(TIME_WINDOW);
        timestamps.removeIf(timestamp -> timestamp.isBefore(cutoff));
    }
    
    /**
     * Get remaining requests for the given IP
     */
    private int getRemainingRequests(String clientIp) {
        Queue<Instant> timestamps = requestTimestamps.get(clientIp);
        if (timestamps == null) {
            return MAX_REQUESTS_PER_MINUTE;
        }
        
        // Remove old timestamps
        Instant cutoff = Instant.now().minus(TIME_WINDOW);
        timestamps.removeIf(timestamp -> timestamp.isBefore(cutoff));
        
        return Math.max(0, MAX_REQUESTS_PER_MINUTE - timestamps.size());
    }
    
    /**
     * Extract client IP address from request
     * Handles proxy headers (X-Forwarded-For, X-Real-IP)
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xfHeader.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
