#!/bin/bash

# SSL Setup Script for mnemo.ishaan812.com
# This script helps set up Let's Encrypt SSL certificates

set -e

DOMAINS=("mnemo.ishaan812.com")
EMAIL="ishaan.shah@gmail.com"  # Replace with your actual email

echo "Setting up SSL certificates for domains: ${DOMAINS[@]}"

# Create directories
mkdir -p ssl
mkdir -p certbot-webroot

# Function to check if domain is accessible
check_domain_accessibility() {
    local domain=$1
    echo "Checking if $domain is accessible..."
    
    if curl -I --connect-timeout 10 --max-time 30 "http://$domain" >/dev/null 2>&1; then
        echo "✓ $domain is accessible via HTTP"
        return 0
    else
        echo "✗ $domain is not accessible via HTTP"
        return 1
    fi
}

# Function to check existing SSL certificate
check_existing_ssl() {
    local domain=$1
    echo "Checking existing SSL certificate for $domain..."
    
    if curl -I --connect-timeout 10 --max-time 30 "https://$domain" >/dev/null 2>&1; then
        echo "✓ $domain already has working SSL"
        return 0
    else
        echo "✗ $domain does not have working SSL"
        return 1
    fi
}

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

# Check current SSL status
echo "Checking current SSL status..."
for domain in "${DOMAINS[@]}"; do
    if check_existing_ssl "$domain"; then
        echo "SSL already configured for $domain"
    else
        echo "SSL needs to be set up for $domain"
    fi
done

# Stop nginx container to free up ports
echo "Stopping nginx container temporarily..."
docker-compose stop nginx || true

# Generate certificates
echo "Generating SSL certificates..."

# Try standalone mode first (when ports 80/443 are free)
if sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --expand \
    -d mnemo.ishaan812.com; then
    
    echo "✓ Certificates generated successfully using standalone mode"
    
    # Copy certificates to ssl directory
    echo "Copying certificates..."
    sudo cp /etc/letsencrypt/live/mnemo.ishaan812.com/fullchain.pem ssl/
    sudo cp /etc/letsencrypt/live/mnemo.ishaan812.com/privkey.pem ssl/
    sudo chown $(whoami):$(whoami) ssl/fullchain.pem ssl/privkey.pem
    
else
    echo "Standalone mode failed. Trying webroot mode..."
    
    # Start nginx without SSL first
    echo "Starting nginx in HTTP-only mode for webroot verification..."
    
    # Create a temporary nginx config for HTTP-only
    cp nginx.conf nginx.conf.backup
    
    # Start nginx container
    docker-compose up -d nginx
    
    # Wait for nginx to be ready
    sleep 10
    
    # Try webroot mode
    sudo certbot certonly \
        --webroot \
        --webroot-path=./certbot-webroot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --expand \
        -d mnemo.ishaan812.com
    
    if [ $? -eq 0 ]; then
        echo "✓ Certificates generated successfully using webroot mode"
        
        # Copy certificates to ssl directory
        echo "Copying certificates..."
        sudo cp /etc/letsencrypt/live/mnemo.ishaan812.com/fullchain.pem ssl/
        sudo cp /etc/letsencrypt/live/mnemo.ishaan812.com/privkey.pem ssl/
        sudo chown $(whoami):$(whoami) ssl/fullchain.pem ssl/privkey.pem
    else
        echo "❌ Certificate generation failed for both methods"
        echo "Please check:"
        echo "1. DNS records point to this server"
        echo "2. Ports 80 and 443 are accessible"
        echo "3. No firewall blocking access"
        exit 1
    fi
fi

# Restart nginx container with SSL
echo "Restarting nginx container with SSL configuration..."
docker-compose restart nginx

# Wait for nginx to start
sleep 10

# Verify SSL is working
echo "Verifying SSL certificates..."
for domain in "${DOMAINS[@]}"; do
    if check_existing_ssl "$domain"; then
        echo "✅ SSL is working for $domain"
    else
        echo "❌ SSL verification failed for $domain"
    fi
done

echo "🎉 SSL setup complete!"
echo "Your site should now be accessible at:"
echo "  - https://mnemo.ishaan812.com"

# Set up auto-renewal
echo "Setting up certificate auto-renewal..."
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 12 * * * /usr/bin/certbot renew --quiet && cd $(pwd) && docker-compose restart nginx") | crontab -

echo "✅ Auto-renewal configured to run daily at 12 PM"

# Show certificate info
echo ""
echo "Certificate information:"
sudo certbot certificates 
