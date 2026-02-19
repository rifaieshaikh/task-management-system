#!/bin/bash

# ============================================
# Environment Setup Script
# ============================================
# This script helps set up environment variables
# for the Task Management System
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

generate_jwt_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

# Main script
print_header "Task Management System - Environment Setup"

# Check if .env already exists
if [ -f .env ]; then
    print_warning ".env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Setup cancelled. Existing .env file preserved."
        exit 0
    fi
    # Backup existing .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Backed up existing .env file"
fi

# Ask for environment type
echo ""
echo "Select environment type:"
echo "1) Development (local)"
echo "2) Docker (docker-compose)"
echo "3) Production"
read -p "Enter choice [1-3]: " env_choice

case $env_choice in
    1)
        ENV_TYPE="dev"
        TEMPLATE=".env.example"
        ;;
    2)
        ENV_TYPE="docker"
        TEMPLATE=".env.example"
        ;;
    3)
        ENV_TYPE="prod"
        TEMPLATE=".env.production.example"
        print_warning "Production environment selected. Ensure you review all security settings!"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Copy template
if [ ! -f "$TEMPLATE" ]; then
    print_error "Template file $TEMPLATE not found!"
    exit 1
fi

cp "$TEMPLATE" .env
print_success "Created .env from $TEMPLATE"

# Generate secure passwords
echo ""
print_header "Generating Secure Credentials"

DB_PASSWORD=$(generate_password)
JWT_SECRET=$(generate_jwt_secret)

print_success "Generated database password"
print_success "Generated JWT secret"

# Update .env file with generated values
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/change_this_password_in_production/$DB_PASSWORD/" .env
    sed -i '' "s/REPLACE_WITH_SECURE_PASSWORD_FROM_SECRET_MANAGER/$DB_PASSWORD/" .env
    sed -i '' "s/change_this_secret_key_minimum_256_bits/$JWT_SECRET/" .env
    sed -i '' "s/REPLACE_WITH_SECURE_JWT_SECRET_FROM_SECRET_MANAGER/$JWT_SECRET/" .env
else
    # Linux
    sed -i "s/change_this_password_in_production/$DB_PASSWORD/" .env
    sed -i "s/REPLACE_WITH_SECURE_PASSWORD_FROM_SECRET_MANAGER/$DB_PASSWORD/" .env
    sed -i "s/change_this_secret_key_minimum_256_bits/$JWT_SECRET/" .env
    sed -i "s/REPLACE_WITH_SECURE_JWT_SECRET_FROM_SECRET_MANAGER/$JWT_SECRET/" .env
fi

# Set environment-specific values
case $env_choice in
    1)
        # Development
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/SPRING_PROFILES_ACTIVE=docker/SPRING_PROFILES_ACTIVE=dev/" .env
            sed -i '' "s/DB_HOST=postgres/DB_HOST=localhost/" .env
        else
            sed -i "s/SPRING_PROFILES_ACTIVE=docker/SPRING_PROFILES_ACTIVE=dev/" .env
            sed -i "s/DB_HOST=postgres/DB_HOST=localhost/" .env
        fi
        ;;
    2)
        # Docker - no changes needed
        ;;
    3)
        # Production - prompt for domain
        echo ""
        read -p "Enter your production domain (e.g., yourdomain.com): " DOMAIN
        if [ -n "$DOMAIN" ]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/yourdomain.com/$DOMAIN/g" .env
            else
                sed -i "s/yourdomain.com/$DOMAIN/g" .env
            fi
            print_success "Updated domain to $DOMAIN"
        fi
        ;;
esac

# Display summary
echo ""
print_header "Setup Complete!"
echo ""
echo "Environment Type: $ENV_TYPE"
echo "Configuration file: .env"
echo ""
print_warning "IMPORTANT: Review and update the .env file as needed"
echo ""

if [ "$env_choice" == "3" ]; then
    print_warning "Production Checklist:"
    echo "  [ ] Review all configuration values"
    echo "  [ ] Update domain names"
    echo "  [ ] Configure SSL certificates"
    echo "  [ ] Set up backup configuration"
    echo "  [ ] Configure email settings"
    echo "  [ ] Review CORS origins"
    echo "  [ ] Set up monitoring and alerting"
    echo "  [ ] Store secrets in secret manager"
    echo ""
fi

print_success "Generated credentials:"
echo "  Database Password: $DB_PASSWORD"
echo "  JWT Secret: $JWT_SECRET"
echo ""
print_warning "Save these credentials securely!"
echo ""

# Create .gitignore entry if not exists
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo ".env" >> .gitignore
    print_success "Added .env to .gitignore"
fi

# Set proper permissions
chmod 600 .env
print_success "Set secure permissions on .env file (600)"

echo ""
print_header "Next Steps"
echo ""
echo "1. Review the .env file: nano .env"
echo "2. Start the application:"
if [ "$env_choice" == "1" ]; then
    echo "   cd backend && mvn spring-boot:run"
    echo "   cd frontend && npm start"
elif [ "$env_choice" == "2" ]; then
    echo "   docker-compose up -d"
elif [ "$env_choice" == "3" ]; then
    echo "   docker-compose -f docker-compose.prod.yml up -d"
fi
echo ""
print_success "Setup script completed successfully!"
