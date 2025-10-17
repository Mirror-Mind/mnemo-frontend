#!/bin/bash

################################################################################
# Quick Deploy Script for Mnemo on Amazon Linux EC2
# This is a simplified wrapper around the main deployment script
################################################################################

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              MNEMO FRONTEND DEPLOYMENT                        ║
║              Amazon Linux EC2 Quick Setup                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo "This script will deploy the complete Mnemo stack including:"
echo "  • Docker & Docker Compose"
echo "  • PostgreSQL with pgvector"
echo "  • Redis with vector support"
echo "  • Next.js application"
echo "  • Scheduler service"
echo "  • Nginx with SSL"
echo ""

# Check if we're on Amazon Linux
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" != "amzn" ]]; then
        echo -e "${YELLOW}Warning: This script is designed for Amazon Linux.${NC}"
        echo "Your OS: $PRETTY_NAME"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Prompt for configuration
echo -e "${GREEN}Configuration:${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo ""
    echo "Please create a .env file with your configuration before running deployment."
    echo "Required environment variables:"
    echo "  - DATABASE_URL"
    echo "  - REDIS_URL"
    echo "  - BETTER_AUTH_SECRET"
    echo "  - OPENAI_API_KEY"
    echo "  - NODE_ENV=production"
    echo ""
    exit 1
fi

echo -e "${GREEN}.env file found ✓${NC}"
echo ""

# Domain
read -p "Enter your domain name (or press Enter for localhost): " DOMAIN
DOMAIN=${DOMAIN:-localhost}

# Email
if [ "$DOMAIN" != "localhost" ]; then
    read -p "Enter your email (for SSL certificates): " EMAIL
    if [ -z "$EMAIL" ]; then
        echo "Email is required for SSL certificates"
        exit 1
    fi
else
    EMAIL="admin@example.com"
fi

# Confirm
echo ""
echo -e "${GREEN}Configuration Summary:${NC}"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  .env file: Found ✓"
echo ""
read -p "Proceed with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Export variables and run main deployment script
export DOMAIN
export EMAIL

echo ""
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

# Run the main deployment script
if [ -f "./deploy-amazon-linux.sh" ]; then
    ./deploy-amazon-linux.sh
else
    echo "Error: deploy-amazon-linux.sh not found in current directory"
    exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

if [ "$DOMAIN" != "localhost" ]; then
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Ensure EC2 Security Group allows ports 80, 443"
echo "2. Configure DNS A record for $DOMAIN to point to this server"
echo "3. Wait 5-30 minutes for DNS propagation"
echo "4. Access your application at: https://$DOMAIN"
echo ""
else
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "Unable to determine")
    if [ "$PUBLIC_IP" != "Unable to determine" ]; then
        echo "1. Ensure EC2 Security Group allows ports 80, 443, 3000"
        echo "2. Access your application at: http://$PUBLIC_IP:3000"
        echo ""
    fi
fi

echo ""

