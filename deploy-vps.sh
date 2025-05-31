#!/bin/bash

# Orbia VPS Deployment Script
# Run this on a fresh Ubuntu 22.04+ VPS

set -e

echo "🚀 Starting Orbia deployment on VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose V2
echo "📋 Installing Docker Compose..."
sudo apt install -y docker-compose-plugin

# Install other essentials
echo "🛠️ Installing essential tools..."
sudo apt install -y git curl wget nginx-utils

# Set up firewall
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Clone repository (you'll need to replace with your repo)
echo "📥 Cloning repository..."
git clone <your-repo-url> orbia
cd orbia

# Set up environment file
echo "⚙️ Setting up environment..."
cp .env.example .env
echo "Please edit .env with your actual values:"
echo "- OPENAI_API_KEY=your_actual_key"
echo "- BETTER_AUTH_SECRET=your_secure_secret"
echo "- Database credentials"
nano .env

# Start services
echo "🏁 Starting Docker services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker compose ps

# Show logs
echo "📝 Recent logs:"
docker compose logs --tail=20

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: http://$(curl -s ifconfig.me)"
echo "🔍 Monitor with: docker compose logs -f"
echo "🛑 Stop with: docker compose down"

# Optional: Set up SSL with Let's Encrypt
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔐 Setting up SSL..."
    sudo apt install -y certbot
    # You'll need to configure your domain first
    echo "Please configure your domain DNS to point to this server first"
    echo "Then run: sudo certbot --nginx -d your-domain.com"
fi 