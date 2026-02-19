# Docker Configuration Guide

This guide covers the Docker setup for the task management system.

---

## Docker Files

### Root docker-compose.yml

**File**: [`docker-compose.yml`](docker-compose.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: taskdb
    environment:
      POSTGRES_DB: taskdb
      POSTGRES_USER: taskuser
      POSTGRES_PASSWORD: taskpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - task-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskuser -d taskdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Spring Boot Application
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: task-backend
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/taskdb
      SPRING_DATASOURCE_USERNAME: taskuser
      SPRING_DATASOURCE_PASSWORD: taskpass
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - task-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend React Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost:8080/api
    container_name: task-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - task-network

volumes:
  postgres_data:
    driver: local

networks:
  task-network:
    driver: bridge
```

### Backend Dockerfile

**File**: [`backend/Dockerfile`](backend/Dockerfile)

```dockerfile
# Multi-stage build for Spring Boot application

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

**File**: [`frontend/Dockerfile`](frontend/Dockerfile)

```dockerfile
# Multi-stage build for React application

# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build argument for API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built app from build stage
COPY --from=build /app/build .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**File**: [`frontend/nginx.conf`](frontend/nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## Docker Commands Reference

### Development Workflow

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Execute commands in running container
docker-compose exec backend sh
docker-compose exec postgres psql -U taskuser -d taskdb

# View running containers
docker-compose ps

# Restart specific service
docker-compose restart backend
```

### Database Management

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U taskuser -d taskdb

# Backup database
docker-compose exec postgres pg_dump -U taskuser taskdb > backup.sql

# Restore database
docker-compose exec -T postgres psql -U taskuser taskdb < backup.sql

# View database tables
docker-compose exec postgres psql -U taskuser -d taskdb -c "\dt"

# View task data
docker-compose exec postgres psql -U taskuser -d taskdb -c "SELECT * FROM tasks;"
```

### Troubleshooting

```bash
# Check service health
docker-compose ps

# View detailed container info
docker inspect task-backend

# Check network connectivity
docker-compose exec backend ping postgres

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup (use with caution)
docker system prune -a --volumes
```

---

## Environment Variables

### Backend Environment Variables

Create [`backend/.env`](backend/.env) for local development:

```env
SPRING_PROFILES_ACTIVE=dev
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/taskdb
SPRING_DATASOURCE_USERNAME=taskuser
SPRING_DATASOURCE_PASSWORD=taskpass
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables

Create [`frontend/.env`](frontend/.env) for local development:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

Create [`frontend/.env.production`](frontend/.env.production) for production:

```env
REACT_APP_API_URL=/api
```

---

## Docker Compose Profiles (Optional Enhancement)

You can add profiles for different environments:

```yaml
# In docker-compose.yml
services:
  backend:
    profiles: ["dev", "prod"]
    # ... rest of config

  backend-debug:
    extends: backend
    profiles: ["debug"]
    environment:
      JAVA_TOOL_OPTIONS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
    ports:
      - "8080:8080"
      - "5005:5005"
```

Usage:
```bash
# Start with dev profile
docker-compose --profile dev up

# Start with debug profile
docker-compose --profile debug up
```

---

## Production Considerations

### 1. Security Enhancements

```yaml
# Use secrets instead of environment variables
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
```

### 2. Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 3. Logging Configuration

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Health Checks

Already included in the main docker-compose.yml file.

### 5. SSL/TLS Configuration

For production, use a reverse proxy like Traefik or Nginx with Let's Encrypt:

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your-email@example.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
```

---

## CI/CD Integration

### GitHub Actions Example

**File**: [`.github/workflows/docker-build.yml`](.github/workflows/docker-build.yml)

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: yourusername/task-backend:latest
    
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: yourusername/task-frontend:latest
```

---

## Monitoring and Observability

### Add Prometheus and Grafana (Optional)

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - task-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - task-network

volumes:
  prometheus_data:
  grafana_data:
```

---

## Quick Start Guide

### First Time Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database: localhost:5432

4. **Stop the application**
   ```bash
   docker-compose down
   ```

### Development Mode

For development, you might want to run services individually:

```bash
# Start only database
docker-compose up postgres

# Run backend locally (in another terminal)
cd backend
mvn spring-boot:run

# Run frontend locally (in another terminal)
cd frontend
npm start
```

This allows for hot-reloading during development.

---

## Verification Steps

After starting with `docker-compose up`, verify:

1. **Check all containers are running**
   ```bash
   docker-compose ps
   ```
   All services should show "Up" status.

2. **Check backend health**
   ```bash
   curl http://localhost:8080/actuator/health
   ```
   Should return: `{"status":"UP"}`

3. **Check database connection**
   ```bash
   docker-compose exec postgres psql -U taskuser -d taskdb -c "SELECT 1;"
   ```

4. **Access frontend**
   Open browser to http://localhost:3000

5. **Test API**
   ```bash
   curl http://localhost:8080/api/tasks
   ```

---

This Docker setup provides a complete containerized environment for development, testing, and production deployment.
