# Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Task Management System to production environments.

## Prerequisites
- Docker & Docker Compose installed
- PostgreSQL 16+ (if not using Docker)
- Node.js 18+ (for frontend build)
- Java 21+ (for backend)
- SSL/TLS certificates
- Domain name configured

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Monitoring Setup](#monitoring-setup)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/task-management-system.git
cd task-management-system
```

### 2. Configure Environment Variables
```bash
# Copy example files
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

### 3. Required Variables
```bash
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=taskmanagement
DB_USERNAME=taskuser
DB_PASSWORD=<strong-password>

# Application
APP_PORT=8080
APP_ENV=production
SPRING_PROFILES_ACTIVE=prod

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Logging
LOG_LEVEL=INFO
LOG_PATH=/var/log/taskmanagement
```

### 4. Validate Configuration
```bash
./scripts/validate-env.sh
```

---

## Database Setup

### Option 1: Managed Database (Recommended)
Use managed PostgreSQL services:
- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- DigitalOcean Managed Databases

### Option 2: Self-Hosted PostgreSQL

#### Install PostgreSQL 16
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database and User
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database
CREATE DATABASE taskmanagement;

-- Create user
CREATE USER taskuser WITH ENCRYPTED PASSWORD 'your-strong-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE taskmanagement TO taskuser;
GRANT USAGE ON SCHEMA public TO taskuser;
GRANT CREATE ON SCHEMA public TO taskuser;

-- Exit
\q
```

#### Configure PostgreSQL
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/16/main/postgresql.conf

# Recommended settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

#### Enable SSL
```bash
# Generate self-signed certificate (or use Let's Encrypt)
sudo openssl req -new -x509 -days 365 -nodes -text \
  -out /etc/postgresql/16/main/server.crt \
  -keyout /etc/postgresql/16/main/server.key

# Set permissions
sudo chmod 600 /etc/postgresql/16/main/server.key
sudo chown postgres:postgres /etc/postgresql/16/main/server.*

# Enable SSL in postgresql.conf
ssl = on
ssl_cert_file = '/etc/postgresql/16/main/server.crt'
ssl_key_file = '/etc/postgresql/16/main/server.key'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Backend Deployment

### Option 1: JAR Deployment

#### 1. Build Application
```bash
cd backend
./mvnw clean package -DskipTests
```

#### 2. Create Systemd Service
```bash
sudo nano /etc/systemd/system/taskmanagement.service
```

```ini
[Unit]
Description=Task Management System Backend
After=network.target postgresql.service

[Service]
Type=simple
User=taskmanagement
WorkingDirectory=/opt/taskmanagement
ExecStart=/usr/bin/java \
  -Xms512m \
  -Xmx1024m \
  -XX:+UseG1GC \
  -Dspring.profiles.active=prod \
  -jar /opt/taskmanagement/backend.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### 3. Deploy
```bash
# Create user
sudo useradd -r -s /bin/false taskmanagement

# Create directory
sudo mkdir -p /opt/taskmanagement
sudo mkdir -p /var/log/taskmanagement

# Copy JAR
sudo cp target/task-management-*.jar /opt/taskmanagement/backend.jar

# Set permissions
sudo chown -R taskmanagement:taskmanagement /opt/taskmanagement
sudo chown -R taskmanagement:taskmanagement /var/log/taskmanagement

# Start service
sudo systemctl daemon-reload
sudo systemctl start taskmanagement
sudo systemctl enable taskmanagement

# Check status
sudo systemctl status taskmanagement
```

### Option 2: Docker Deployment
See [Docker Deployment](#docker-deployment) section.

---

## Frontend Deployment

### Option 1: Nginx Static Files

#### 1. Build Frontend
```bash
cd frontend
npm ci
npm run build
```

#### 2. Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/taskmanagement
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # Root directory
    root /var/www/taskmanagement;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

#### 4. Deploy
```bash
# Copy build files
sudo mkdir -p /var/www/taskmanagement
sudo cp -r build/* /var/www/taskmanagement/

# Set permissions
sudo chown -R www-data:www-data /var/www/taskmanagement

# Enable site
sudo ln -s /etc/nginx/sites-available/taskmanagement /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 5. Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Docker Deployment

### 1. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Configure Environment
```bash
# Copy production compose file
cp docker-compose.prod.yml docker-compose.yml

# Edit environment variables
nano .env.production
```

### 3. Deploy
```bash
# Build and start services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### 4. Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Remove old images
docker image prune -f
```

---

## Monitoring Setup

### 1. Prometheus
```bash
# Create directories
sudo mkdir -p /opt/monitoring/prometheus
sudo mkdir -p /opt/monitoring/grafana

# Copy configuration
sudo cp monitoring/prometheus.yml /opt/monitoring/prometheus/

# Start Prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /opt/monitoring/prometheus:/etc/prometheus \
  prom/prometheus
```

### 2. Grafana
```bash
# Start Grafana
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana

# Access: http://your-server:3000
# Default credentials: admin/admin
```

### 3. Configure Dashboards
1. Add Prometheus data source
2. Import Spring Boot dashboard (ID: 4701)
3. Import PostgreSQL dashboard (ID: 9628)
4. Create custom dashboards for business metrics

---

## Post-Deployment

### 1. Health Checks
```bash
# Backend health
curl https://yourdomain.com/api/actuator/health

# Database health
curl https://yourdomain.com/api/actuator/health/db

# Frontend
curl https://yourdomain.com
```

### 2. Smoke Tests
```bash
# Create task
curl -X POST https://yourdomain.com/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing deployment"}'

# Get tasks
curl https://yourdomain.com/api/tasks
```

### 3. Setup Backups
```bash
# Database backup script
sudo nano /opt/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="taskmanagement_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U taskuser -d taskmanagement > "$BACKUP_DIR/$FILENAME"
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

```bash
# Make executable
sudo chmod +x /opt/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /opt/scripts/backup-db.sh
```

### 4. Setup Monitoring Alerts
Configure alerts for:
- High error rates
- Slow response times
- Database connection issues
- High memory/CPU usage
- Disk space warnings

---

## Troubleshooting

### Backend Issues

#### Service Won't Start
```bash
# Check logs
sudo journalctl -u taskmanagement -f

# Check Java version
java -version

# Check port availability
sudo netstat -tulpn | grep 8080
```

#### Database Connection Failed
```bash
# Test connection
psql -h localhost -U taskuser -d taskmanagement

# Check PostgreSQL status
sudo systemctl status postgresql

# Check firewall
sudo ufw status
```

### Frontend Issues

#### 404 Errors
```bash
# Check Nginx configuration
sudo nginx -t

# Check file permissions
ls -la /var/www/taskmanagement

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### API Calls Failing
```bash
# Check backend status
curl http://localhost:8080/api/actuator/health

# Check Nginx proxy configuration
sudo nano /etc/nginx/sites-available/taskmanagement
```

### Docker Issues

#### Container Won't Start
```bash
# Check logs
docker compose logs backend

# Check resources
docker stats

# Restart services
docker compose restart
```

#### Database Migration Failed
```bash
# Check Flyway logs
docker compose logs backend | grep Flyway

# Manual migration
docker compose exec backend ./mvnw flyway:migrate
```

---

## Rollback Procedure

### 1. Identify Issue
```bash
# Check logs
sudo journalctl -u taskmanagement -n 100

# Check metrics
curl http://localhost:9090/metrics
```

### 2. Rollback Code
```bash
# Git rollback
git log --oneline
git checkout <previous-commit>

# Rebuild
docker compose up -d --build
```

### 3. Rollback Database
```bash
# Restore from backup
gunzip /opt/backups/database/taskmanagement_YYYYMMDD_HHMMSS.sql.gz
psql -h localhost -U taskuser -d taskmanagement < taskmanagement_YYYYMMDD_HHMMSS.sql
```

---

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Environment variables secured
- [ ] Database SSL enabled
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Backups automated
- [ ] Monitoring configured
- [ ] Logs centralized
- [ ] Access controls implemented
- [ ] Dependencies updated

---

## Support

For deployment issues:
- Email: support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- GitHub Issues: https://github.com/yourusername/task-management-system/issues

---

## Version History
- **v1.0** (2026-02-19): Initial deployment guide
