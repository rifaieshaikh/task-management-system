#!/bin/bash

# ============================================
# Environment Validation Script
# ============================================
# Validates that all required environment
# variables are set and meet security requirements
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_required_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        print_error "$var_name is not set"
        return 1
    fi
    return 0
}

check_password_strength() {
    local var_name=$1
    local var_value=${!var_name}
    local min_length=16
    
    if [ ${#var_value} -lt $min_length ]; then
        print_warning "$var_name is less than $min_length characters"
        return 1
    fi
    
    if [[ ! "$var_value" =~ [A-Z] ]] || [[ ! "$var_value" =~ [a-z] ]] || [[ ! "$var_value" =~ [0-9] ]]; then
        print_warning "$var_name should contain uppercase, lowercase, and numbers"
        return 1
    fi
    
    return 0
}

check_default_value() {
    local var_name=$1
    local var_value=${!var_name}
    local default_value=$2
    
    if [ "$var_value" == "$default_value" ]; then
        print_error "$var_name is still set to default value"
        return 1
    fi
    return 0
}

echo "============================================"
echo "Environment Validation"
echo "============================================"
echo ""

# Load .env file
if [ ! -f .env ]; then
    print_error ".env file not found"
    exit 1
fi

source .env

echo "Checking required variables..."
echo ""

# Database Configuration
check_required_var "POSTGRES_DB"
check_required_var "POSTGRES_USER"
check_required_var "POSTGRES_PASSWORD"

if check_required_var "POSTGRES_PASSWORD"; then
    check_default_value "POSTGRES_PASSWORD" "change_this_password_in_production"
    check_password_strength "POSTGRES_PASSWORD"
fi

# Security Configuration
check_required_var "JWT_SECRET"
if check_required_var "JWT_SECRET"; then
    check_default_value "JWT_SECRET" "change_this_secret_key_minimum_256_bits"
    if [ ${#JWT_SECRET} -lt 32 ]; then
        print_error "JWT_SECRET must be at least 32 characters"
    fi
fi

check_required_var "CORS_ALLOWED_ORIGINS"
if [ "$CORS_ALLOWED_ORIGINS" == "*" ]; then
    print_error "CORS_ALLOWED_ORIGINS should not be wildcard (*)"
fi

# Backend Configuration
check_required_var "SPRING_PROFILES_ACTIVE"

# Frontend Configuration
check_required_var "REACT_APP_API_URL"

# Production-specific checks
if [ "$SPRING_PROFILES_ACTIVE" == "prod" ]; then
    echo ""
    echo "Production environment detected. Running additional checks..."
    echo ""
    
    # Check for HTTPS
    if [[ ! "$REACT_APP_API_URL" =~ ^https:// ]]; then
        print_warning "REACT_APP_API_URL should use HTTPS in production"
    fi
    
    if [[ "$CORS_ALLOWED_ORIGINS" =~ localhost ]]; then
        print_warning "CORS_ALLOWED_ORIGINS contains localhost in production"
    fi
    
    # Check logging level
    if [ "$LOG_LEVEL" == "DEBUG" ] || [ "$LOG_LEVEL" == "TRACE" ]; then
        print_warning "LOG_LEVEL should be INFO or WARN in production"
    fi
    
    # Check Swagger
    if [ "$FEATURE_SWAGGER_UI" == "true" ]; then
        print_warning "Consider disabling Swagger UI in production"
    fi
fi

echo ""
echo "============================================"
echo "Validation Summary"
echo "============================================"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    print_error "Validation failed with $ERRORS error(s)"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    print_warning "Validation passed with $WARNINGS warning(s)"
    exit 0
else
    print_success "All validations passed!"
    exit 0
fi
