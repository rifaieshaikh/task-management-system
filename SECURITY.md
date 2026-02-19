# Security Best Practices - Task Management System

## Overview
This document outlines the security measures implemented in the Task Management System and provides guidelines for maintaining security in production environments.

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Input Validation & Sanitization](#input-validation--sanitization)
3. [SQL Injection Prevention](#sql-injection-prevention)
4. [CORS Configuration](#cors-configuration)
5. [Rate Limiting](#rate-limiting)
6. [Environment Variables](#environment-variables)
7. [HTTPS & TLS](#https--tls)
8. [Database Security](#database-security)
9. [Logging & Monitoring](#logging--monitoring)
10. [Dependency Management](#dependency-management)

---

## Authentication & Authorization

### Current Implementation
The current version does not include authentication. For production deployment, implement one of the following:

### Recommended Solutions

#### Option 1: Spring Security with JWT
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        return http.build();
    }
}
```

#### Option 2: OAuth 2.0 / OpenID Connect
- Use Spring Security OAuth2 Client
- Integrate with providers (Google, GitHub, Okta)
- Implement proper token validation

### Best Practices
- ✅ Use strong password hashing (BCrypt, Argon2)
- ✅ Implement password complexity requirements
- ✅ Add account lockout after failed attempts
- ✅ Use secure session management
- ✅ Implement proper logout functionality
- ✅ Add CSRF protection for state-changing operations

---

## Input Validation & Sanitization

### Implementation
The system uses [`ValidationUtils`](../backend/src/main/java/com/taskmanagement/util/ValidationUtils.java) for comprehensive input validation.

### Features
```java
// Title sanitization
String sanitizedTitle = validationUtils.sanitizeTitle(title);

// Description sanitization
String sanitizedDescription = validationUtils.sanitizeDescription(description);

// Search term sanitization
String sanitizedSearch = validationUtils.sanitizeSearchTerm(searchTerm);
```

### Validation Rules
- **Title**: Max 200 characters, no control characters
- **Description**: Max 2000 characters, no control characters
- **Search**: Max 100 characters, SQL injection pattern detection

### Best Practices
- ✅ Validate all user inputs on the server side
- ✅ Use Bean Validation annotations (@NotNull, @Size, @Pattern)
- ✅ Sanitize inputs before database operations
- ✅ Implement whitelist validation where possible
- ✅ Never trust client-side validation alone

---

## SQL Injection Prevention

### Implementation
Multiple layers of protection:

#### 1. Parameterized Queries
```java
@Query("SELECT t FROM Task t WHERE " +
       "LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
List<Task> searchByTitle(@Param("searchTerm") String searchTerm);
```

#### 2. Input Sanitization
```java
private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
    ".*([';\"\\-\\-]|(/\\*|\\*/)|" +
    "(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\\b)).*",
    Pattern.CASE_INSENSITIVE
);
```

#### 3. LIKE Character Escaping
```java
sanitized = sanitized.replace("\\", "\\\\")
                     .replace("%", "\\%")
                     .replace("_", "\\_");
```

### Best Practices
- ✅ Always use parameterized queries
- ✅ Never concatenate user input into SQL
- ✅ Use ORM frameworks (JPA/Hibernate)
- ✅ Implement input validation
- ✅ Use least privilege database accounts
- ✅ Regular security audits

---

## CORS Configuration

### Implementation
Secure CORS configuration in [`CorsConfig.java`](../backend/src/main/java/com/taskmanagement/config/CorsConfig.java):

```java
@Bean
public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();
    
    // Specific origins only
    config.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "https://yourdomain.com"
    ));
    
    // Explicit headers
    config.setAllowedHeaders(Arrays.asList(
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin"
    ));
    
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    
    source.registerCorsConfiguration("/api/**", config);
    return new CorsFilter(source);
}
```

### Best Practices
- ✅ Never use wildcard (*) in production
- ✅ Specify exact allowed origins
- ✅ List only required HTTP methods
- ✅ Explicitly define allowed headers
- ✅ Set appropriate max age
- ✅ Use allowCredentials carefully

---

## Rate Limiting

### Implementation
Custom rate limiting in [`RateLimitInterceptor.java`](../backend/src/main/java/com/taskmanagement/config/RateLimitInterceptor.java):

```java
private static final int MAX_REQUESTS_PER_MINUTE = 60;
private static final Duration TIME_WINDOW = Duration.ofMinutes(1);
```

### Features
- Sliding window algorithm
- Per-IP tracking
- Proxy support (X-Forwarded-For, X-Real-IP)
- Rate limit headers in response
- Automatic cleanup of old timestamps

### Configuration
```yaml
# Adjust in application.yml
rate-limit:
  max-requests: 60
  time-window: 1m
  enabled: true
```

### Best Practices
- ✅ Implement rate limiting on all public APIs
- ✅ Use different limits for different endpoints
- ✅ Consider authenticated vs anonymous users
- ✅ Add exponential backoff for repeated violations
- ✅ Monitor and adjust limits based on usage
- ✅ Implement distributed rate limiting for multiple instances

---

## Environment Variables

### Implementation
Secure environment variable management with validation scripts.

### Required Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanagement
DB_USERNAME=taskuser
DB_PASSWORD=<strong-password>

# Application
APP_PORT=8080
APP_ENV=production
JWT_SECRET=<256-bit-secret>

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Best Practices
- ✅ Never commit secrets to version control
- ✅ Use strong, randomly generated passwords
- ✅ Rotate secrets regularly
- ✅ Use secret management tools (Vault, AWS Secrets Manager)
- ✅ Validate environment variables on startup
- ✅ Use different secrets per environment
- ✅ Implement secret encryption at rest

### Setup Scripts
```bash
# Setup environment
./scripts/setup-env.sh

# Validate configuration
./scripts/validate-env.sh
```

---

## HTTPS & TLS

### Production Requirements
**HTTPS is mandatory for production deployments.**

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Best Practices
- ✅ Use TLS 1.2 or higher
- ✅ Implement HSTS
- ✅ Use strong cipher suites
- ✅ Renew certificates before expiration
- ✅ Use certificate pinning for mobile apps
- ✅ Implement proper certificate validation

---

## Database Security

### PostgreSQL Configuration

#### 1. Connection Security
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?ssl=true&sslmode=require
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

#### 2. User Privileges
```sql
-- Create dedicated user with limited privileges
CREATE USER taskuser WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE taskmanagement TO taskuser;
GRANT USAGE ON SCHEMA public TO taskuser;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO taskuser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO taskuser;

-- Revoke dangerous privileges
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE taskmanagement FROM PUBLIC;
```

#### 3. Connection Pooling
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

### Best Practices
- ✅ Use SSL/TLS for database connections
- ✅ Implement least privilege access
- ✅ Regular database backups
- ✅ Enable audit logging
- ✅ Use strong passwords
- ✅ Keep PostgreSQL updated
- ✅ Implement connection pooling
- ✅ Monitor database performance

---

## Logging & Monitoring

### Implementation
Structured logging with [`logback-spring.xml`](../backend/src/main/resources/logback-spring.xml):

```xml
<encoder class="net.logstash.logback.encoder.LogstashEncoder">
    <includeMdcKeyName>traceId</includeMdcKeyName>
    <includeMdcKeyName>spanId</includeMdcKeyName>
    <includeMdcKeyName>userId</includeMdcKeyName>
    <includeMdcKeyName>requestId</includeMdcKeyName>
</encoder>
```

### Security Events to Log
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ Input validation failures
- ✅ Rate limit violations
- ✅ SQL injection attempts
- ✅ Unusual access patterns
- ✅ Configuration changes
- ✅ Error conditions

### Best Practices
- ✅ Never log sensitive data (passwords, tokens, PII)
- ✅ Use structured logging (JSON)
- ✅ Implement log rotation
- ✅ Centralize logs
- ✅ Set up alerts for security events
- ✅ Regular log analysis
- ✅ Implement audit trails
- ✅ Secure log storage

### Monitoring
```yaml
# Prometheus metrics endpoint
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

---

## Dependency Management

### Current Dependencies
- Spring Boot 3.2.2
- PostgreSQL Driver 42.7.1
- Flyway 10.4.1
- Lombok 1.18.30

### Security Scanning
```bash
# Maven dependency check
mvn org.owasp:dependency-check-maven:check

# Update dependencies
mvn versions:display-dependency-updates
```

### Best Practices
- ✅ Keep dependencies updated
- ✅ Regular security scans
- ✅ Use dependency management tools
- ✅ Review security advisories
- ✅ Remove unused dependencies
- ✅ Use official repositories only
- ✅ Verify dependency signatures

---

## Security Checklist

### Pre-Production
- [ ] Implement authentication & authorization
- [ ] Configure HTTPS/TLS
- [ ] Set up environment variables
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up database SSL
- [ ] Configure security headers
- [ ] Implement CSRF protection
- [ ] Set up logging & monitoring
- [ ] Perform security audit
- [ ] Update all dependencies
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Implement disaster recovery plan

### Post-Deployment
- [ ] Monitor security logs
- [ ] Regular security scans
- [ ] Dependency updates
- [ ] Certificate renewal
- [ ] Access review
- [ ] Incident response plan
- [ ] Regular backups
- [ ] Performance monitoring

---

## Incident Response

### Steps
1. **Detect**: Monitor logs and alerts
2. **Contain**: Isolate affected systems
3. **Investigate**: Analyze logs and traces
4. **Remediate**: Fix vulnerabilities
5. **Recover**: Restore normal operations
6. **Review**: Post-incident analysis

### Contacts
- Security Team: security@yourdomain.com
- On-Call: +1-XXX-XXX-XXXX
- Incident Response: incidents@yourdomain.com

---

## Additional Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

### Tools
- OWASP Dependency-Check
- SonarQube
- Snyk
- Trivy
- ZAP (Zed Attack Proxy)

---

## Version History
- **v1.0** (2026-02-19): Initial security documentation
- Covers Phases 1-4 implementations
- Includes all current security measures

## Contact
For security concerns or to report vulnerabilities:
- Email: security@yourdomain.com
- Use responsible disclosure practices
