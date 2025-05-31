#!/bin/bash

# SSL Setup Script for orbia.ishaan812.com
# This script helps set up Let's Encrypt SSL certificates

set -e

DOMAIN="orbia.ishaan812.com"
EMAIL="ishaan.shah@gmail.com"  # Replace with your actual email

echo "Setting up SSL certificates for $DOMAIN"

# Create directories
mkdir -p ssl
mkdir -p certbot-webroot

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update && sudo apt install -y certbot
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install certbot
    else
        echo "Please install certbot manually for your OS"
        exit 1
    fi
fi

# Stop nginx container to free up port 80
echo "Stopping nginx container temporarily..."
docker compose stop nginx

# Generate certificates using standalone mode
echo "Generating SSL certificates..."
sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Copy certificates to ssl directory
echo "Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
sudo chown $(whoami):$(whoami) ssl/fullchain.pem ssl/privkey.pem

# Start nginx container
echo "Starting nginx container..."
docker compose up -d nginx

echo "SSL setup complete!"
echo "Your site should now be accessible at https://$DOMAIN"

# Set up auto-renewal
echo "Setting up certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx") | crontab -

echo "Auto-renewal configured to run daily at 12 PM" 
