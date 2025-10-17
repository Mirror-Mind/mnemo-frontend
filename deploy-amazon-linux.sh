#!/bin/bash

################################################################################
# Mnemo Frontend Deployment Script for Amazon Linux EC2
# This script deploys the complete mnemo-frontend stack with:
# - Docker & Docker Compose
# - Nginx with SSL
# - PostgreSQL with pgvector
# - Redis with vector support
# - Scheduler service
# - Next.js application
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DOMAIN="${DOMAIN:-localhost}"
EMAIL="${EMAIL:-admin@example.com}"
APP_DIR="$(pwd)"

log_info "Starting Mnemo Frontend Deployment on Amazon Linux..."
log_info "Domain: $DOMAIN"
log_info "Email: $EMAIL"
log_info "Application Directory: $APP_DIR"

################################################################################
# Step 1: System Update
################################################################################
log_info "Step 1/10: Updating system packages..."
sudo yum update -y
log_success "System packages updated"

################################################################################
# Step 2: Install Required System Packages
################################################################################
log_info "Step 2/10: Installing system dependencies..."
if command -v dnf >/dev/null 2>&1; then
    PM="dnf"
    INSTALL_OPTS="-y --allowerasing"
else
    PM="yum"
    INSTALL_OPTS="-y"
fi

# Avoid installing 'curl' to prevent conflicts with curl-minimal on Amazon Linux
# Use certbot in standalone mode; nginx plugin is not required
sudo $PM install $INSTALL_OPTS \
    git \
    wget \
    vim \
    htop \
    openssl \
    certbot

log_success "System dependencies installed"

################################################################################
# Step 3: Install Docker
################################################################################
log_info "Step 3/10: Installing Docker..."

# Remove old Docker versions if they exist
sudo yum remove -y docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine \
    podman \
    runc 2>/dev/null || true

# Install Docker
sudo yum install -y docker

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

# Verify Docker installation
docker --version
log_success "Docker installed successfully"

################################################################################
# Step 4: Install Docker Compose
################################################################################
log_info "Step 4/10: Installing Docker Compose..."

# Install Docker Compose v2
DOCKER_COMPOSE_VERSION="v2.24.6"
if command -v curl >/dev/null 2>&1; then
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
else
    sudo wget -O /usr/local/bin/docker-compose "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)"
fi
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify Docker Compose installation
docker-compose --version
log_success "Docker Compose installed successfully"

################################################################################
# Step 5: Configure Firewall
################################################################################
log_info "Step 5/10: Configuring firewall..."

# Check if firewalld is installed and running
if systemctl is-active --quiet firewalld; then
    log_info "Firewalld is active, configuring rules..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --permanent --add-port=3000/tcp
    sudo firewall-cmd --permanent --add-port=6379/tcp
    sudo firewall-cmd --permanent --add-port=5433/tcp
    sudo firewall-cmd --reload
    log_success "Firewall rules configured"
else
    log_warning "Firewalld not active, skipping firewall configuration"
    log_warning "Make sure to configure EC2 Security Group to allow ports 80, 443, 3000"
fi

################################################################################
# Step 6: Create SSL Directories and Self-Signed Certificates
################################################################################
log_info "Step 6/10: Setting up SSL certificates..."

mkdir -p "$APP_DIR/ssl"
mkdir -p "$APP_DIR/certbot-webroot"

# Check if SSL certificates already exist
if [ -f "$APP_DIR/ssl/fullchain.pem" ] && [ -f "$APP_DIR/ssl/privkey.pem" ]; then
    log_info "SSL certificates already exist, skipping generation"
else
    log_info "Generating self-signed SSL certificate for initial setup..."
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$APP_DIR/ssl/privkey.pem" \
        -out "$APP_DIR/ssl/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    
    sudo chown -R $USER:$USER "$APP_DIR/ssl"
    log_success "Self-signed SSL certificate created"
fi

################################################################################
# Step 7: Verify Environment File
################################################################################
log_info "Step 7/10: Verifying environment configuration..."

# Check if .env file exists
if [ ! -f "$APP_DIR/.env" ]; then
    log_error ".env file not found!"
    log_error "Please create a .env file with your configuration before running this script."
    log_info ""
    log_info "Required environment variables:"
    log_info "  - DATABASE_URL=postgresql://mnemo:password@postgres:5432/mnemo_db"
    log_info "  - REDIS_URL=redis://redis:6379"
    log_info "  - BETTER_AUTH_SECRET=<your-secret>"
    log_info "  - OPENAI_API_KEY=<your-key>"
    log_info "  - NODE_ENV=production"
    log_info ""
    log_info "You can copy from example.env or another environment file."
    exit 1
fi

log_success ".env file found"

# Verify .env has proper permissions
chmod 600 "$APP_DIR/.env"
log_success "Environment file permissions set to 600"

################################################################################
# Step 8: Pull Docker Images
################################################################################
log_info "Step 8/10: Pulling Docker images (this may take a while)..."

cd "$APP_DIR"

# Login to new docker group without logout
newgrp docker << EONG
docker-compose pull || true
EONG

log_success "Docker images pulled"

################################################################################
# Step 9: Build and Start Services
################################################################################
log_info "Step 9/10: Building and starting Docker containers..."

cd "$APP_DIR"

# Stop any existing containers
newgrp docker << EONG
docker-compose down 2>/dev/null || true

# Build and start services
log_info "Building Docker images..."
docker-compose build --no-cache

log_info "Starting services..."
docker-compose up -d

# Wait for services to be healthy
log_info "Waiting for services to be ready..."
sleep 30

# Check service status
docker-compose ps
EONG

log_success "Docker containers started"

################################################################################
# Step 10: Setup Let's Encrypt SSL (if domain is not localhost)
################################################################################
if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ]; then
    log_info "Step 10/10: Setting up Let's Encrypt SSL..."
    
    log_info "Stopping nginx temporarily to obtain certificates..."
    newgrp docker << EONG
    docker-compose stop nginx
EONG
    
    # Try to obtain Let's Encrypt certificate
    log_info "Attempting to obtain Let's Encrypt certificate..."
    if sudo certbot certonly \
        --standalone \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --preferred-challenges http \
        -d "$DOMAIN" \
        --non-interactive; then
        
        log_success "Let's Encrypt certificate obtained"
        
        # Copy certificates to ssl directory
        sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$APP_DIR/ssl/"
        sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$APP_DIR/ssl/"
        sudo chown -R $USER:$USER "$APP_DIR/ssl"
        
        # Set up auto-renewal cron job
        (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 12 * * * /usr/bin/certbot renew --quiet && cd $APP_DIR && docker-compose restart nginx") | crontab -
        
        log_success "SSL certificate auto-renewal configured"
    else
        log_warning "Failed to obtain Let's Encrypt certificate"
        log_warning "Using self-signed certificate. To get a real certificate:"
        log_warning "1. Ensure your domain DNS points to this server"
        log_warning "2. Ensure ports 80 and 443 are open in EC2 Security Group"
        log_warning "3. Run: sudo certbot certonly --standalone -d $DOMAIN"
    fi
    
    # Restart nginx with SSL
    newgrp docker << EONG
    docker-compose start nginx
EONG
    
else
    log_info "Step 10/10: Skipping Let's Encrypt (domain is localhost)"
    log_info "Using self-signed certificate for local development"
fi

################################################################################
# Post-Deployment Verification
################################################################################
log_info "Verifying deployment..."

sleep 10

# Check if containers are running
newgrp docker << EONG
RUNNING_CONTAINERS=\$(docker-compose ps --filter "status=running" --services | wc -l)
TOTAL_CONTAINERS=\$(docker-compose ps --services | wc -l)

echo "Running containers: \$RUNNING_CONTAINERS / \$TOTAL_CONTAINERS"

if [ "\$RUNNING_CONTAINERS" -lt 4 ]; then
    log_warning "Some containers are not running. Checking logs..."
    docker-compose logs --tail=50
fi
EONG

# Test application health
log_info "Testing application health..."
sleep 5

if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
    log_success "Application health check passed!"
else
    log_warning "Application health check failed. This may be normal during first startup."
    log_info "Check logs with: docker-compose logs -f app"
fi

################################################################################
# Display Summary
################################################################################
echo ""
echo "=========================================================================="
log_success "🎉 Mnemo Frontend Deployment Complete!"
echo "=========================================================================="
echo ""
log_info "Application URLs:"
echo "  HTTP:  http://$DOMAIN"
echo "  HTTPS: https://$DOMAIN"
echo "  Health: http://$DOMAIN:3000/api/health"
echo ""
log_info "Redis Insight (for debugging):"
echo "  http://$DOMAIN:8001"
echo ""
log_info "PostgreSQL:"
echo "  Host: localhost:5433"
echo "  Database: mnemo_db"
echo "  Username: mnemo"
echo "  Password: (configured in your .env file)"
echo ""
log_info "Useful Commands:"
echo "  View logs:           docker-compose logs -f"
echo "  View app logs:       docker-compose logs -f app"
echo "  Restart services:    docker-compose restart"
echo "  Stop services:       docker-compose down"
echo "  Start services:      docker-compose up -d"
echo "  Check status:        docker-compose ps"
echo ""
log_warning "IMPORTANT NEXT STEPS:"
echo "1. Verify your .env file has all required API keys"
echo "2. Configure EC2 Security Group to allow ports 80, 443, and 3000"
echo "3. If using a domain, ensure DNS A record points to this server's public IP"
echo "4. Monitor logs: docker-compose logs -f"
echo ""
log_info "To monitor the application:"
echo "  docker-compose logs -f app"
echo ""
log_info "Deployment script location: $0"
echo "=========================================================================="

# Save deployment info
cat > "$APP_DIR/deployment-info.txt" << EOF
Mnemo Deployment Information
============================
Date: $(date)
Server: $(hostname)
Domain: $DOMAIN

Environment File: $APP_DIR/.env
SSL Certificates: $APP_DIR/ssl/
Docker Compose: $APP_DIR/docker-compose.yml

Public IP: $(curl -s ifconfig.me || echo "Unable to determine")

EC2 Security Group Requirements:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3000 (Application - optional for direct access)
- Port 22 (SSH)

Health Check URL: http://$DOMAIN:3000/api/health

Note: All secrets and passwords are stored in your .env file
EOF

log_success "Deployment info saved to $APP_DIR/deployment-info.txt"

# Print public IP
PUBLIC_IP=$(curl -s ifconfig.me || echo "Unable to determine")
if [ "$PUBLIC_IP" != "Unable to determine" ]; then
    echo ""
    log_info "Your server's public IP address is: $PUBLIC_IP"
    log_info "Access your application at: http://$PUBLIC_IP or https://$PUBLIC_IP"
fi

echo ""
log_success "Deployment completed successfully! 🚀"
echo ""

