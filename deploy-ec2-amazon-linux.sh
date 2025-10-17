#!/bin/bash

#############################################
# Mnemo Frontend Deployment Script
# For Amazon Linux 2023 EC2 Instances
#############################################

set -e  # Exit on any error

echo "======================================"
echo "Mnemo Frontend EC2 Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get the directory where the script is located (should be mnemo-frontend)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_info "Working directory: $SCRIPT_DIR"

# Step 1: Update system packages
print_info "Updating system packages..."
sudo yum update -y

# Step 2: Install Docker
print_info "Installing Docker..."
if ! command_exists docker; then
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    print_info "Docker installed successfully"
else
    print_info "Docker is already installed"
fi

# Step 3: Install Docker Compose
print_info "Installing Docker Compose..."
if ! command_exists docker-compose; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    # Create symlink if needed
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    print_info "Docker Compose installed successfully"
else
    print_info "Docker Compose is already installed"
fi

# Verify installations
print_info "Verifying Docker installation..."
docker --version
docker-compose --version

# Step 4: Ensure docker service is running
print_info "Starting Docker service..."
sudo systemctl start docker
sudo systemctl status docker --no-pager || true

# Step 5: Create .env file if it doesn't exist
print_info "Setting up environment variables..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating a template..."
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://mnemo:mnemo_password@postgres:5432/mnemo_db

# Authentication
BETTER_AUTH_SECRET=change-this-to-a-long-random-secret-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
BETTERAUTH_URL=http://localhost:3000

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Google API Key (optional, for additional features)
GOOGLE_API_KEY=your-google-api-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Redis/Mem0 Configuration
USE_REDIS_MEM0=false
REDIS_URL=redis://localhost:6379
MEM0_COLLECTION_NAME=mnemo-memories

# WhatsApp Business API (optional)
META_WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
META_WHATSAPP_ACCESS_TOKEN=your-access-token
META_WEBHOOK_VERIFY_TOKEN=your-verify-token
META_APP_SECRET=your-app-secret
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Node Environment
NODE_ENV=production
EOF
    print_warning "Please edit .env file with your actual credentials before running the application"
    print_warning "Location: $SCRIPT_DIR/.env"
    echo ""
    read -p "Press Enter once you've updated the .env file, or press Ctrl+C to exit and update later..."
else
    print_info ".env file already exists"
fi

# Step 6: Stop any running containers
print_info "Stopping any existing containers..."
docker-compose -f docker-compose.frontend-only.yml down 2>/dev/null || true

# Step 7: Build and start the application
print_info "Building Docker images (this may take a few minutes)..."
sudo docker-compose -f docker-compose.frontend-only.yml build --no-cache

print_info "Starting the application..."
sudo docker-compose -f docker-compose.frontend-only.yml up -d

# Step 8: Wait for container to be healthy
print_info "Waiting for application to start..."
sleep 10

# Step 9: Check container status
print_info "Checking container status..."
sudo docker-compose -f docker-compose.frontend-only.yml ps

# Step 10: Show logs
print_info "Recent logs:"
sudo docker-compose -f docker-compose.frontend-only.yml logs --tail=50

# Step 11: Get instance IP
print_info "Getting instance IP address..."
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Unable to fetch")

echo ""
echo "======================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Your application should now be running!"
echo ""
echo "Access it at:"
echo "  - Local: http://localhost:3000"
if [ "$INSTANCE_IP" != "Unable to fetch" ]; then
    echo "  - Public: http://$INSTANCE_IP:3000"
fi
echo ""
echo "IMPORTANT: Make sure your EC2 Security Group allows inbound traffic on port 3000"
echo ""
echo "Useful commands:"
echo "  - View logs: sudo docker-compose -f docker-compose.frontend-only.yml logs -f"
echo "  - Restart: sudo docker-compose -f docker-compose.frontend-only.yml restart"
echo "  - Stop: sudo docker-compose -f docker-compose.frontend-only.yml down"
echo "  - Rebuild: sudo docker-compose -f docker-compose.frontend-only.yml up -d --build"
echo ""
echo "Container status:"
sudo docker ps --filter "name=mnemo-app"
echo ""

# Step 12: Check if port 3000 is accessible
print_info "Testing application health endpoint..."
sleep 5
if curl -f http://localhost:3000/api/health 2>/dev/null; then
    print_info "Application is responding! ✓"
else
    print_warning "Application health check failed. Check logs with: sudo docker-compose -f docker-compose.frontend-only.yml logs"
fi

echo ""
print_info "Note: If you need to access environment variables in the future, they are in: $SCRIPT_DIR/.env"

# Optional: Show security group reminder
echo ""
echo "======================================"
echo "Security Group Configuration Reminder"
echo "======================================"
echo ""
echo "To access your application externally, ensure your EC2 Security Group has:"
echo "  Type: Custom TCP"
echo "  Port: 3000"
echo "  Source: 0.0.0.0/0 (or your specific IP for better security)"
echo ""
echo "If you plan to use SSL/HTTPS later, also open:"
echo "  Port: 80 (HTTP)"
echo "  Port: 443 (HTTPS)"
echo ""

