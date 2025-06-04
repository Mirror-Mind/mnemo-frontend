#!/bin/bash

# SSL Setup Script for both mnemo.ishaan812.com and scattegories.ishaan812.com
# This script helps set up Let's Encrypt SSL certificates for both domains

set -e

DOMAINS=("mnemo.ishaan812.com" "scattegories.ishaan812.com")
EMAIL="ishaan.shah@gmail.com"  # Replace with your actual email

echo "Setting up SSL certificates for domains: ${DOMAINS[*]}"

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

# Function to setup SSL for a domain
setup_ssl_for_domain() {
    local domain=$1
    echo "Setting up SSL for $domain..."
    
    # Check if certificate already exists and is valid
    if sudo certbot certificates | grep -q "$domain"; then
        echo "Certificate for $domain already exists. Checking if renewal is needed..."
        sudo certbot renew --cert-name $domain --dry-run
        if [ $? -eq 0 ]; then
            echo "Certificate for $domain is valid and doesn't need renewal"
            return 0
        fi
    fi
    
    # Stop nginx container to free up port 80 temporarily
    echo "Stopping nginx container temporarily for $domain certificate generation..."
    docker compose stop nginx || true
    
    # Generate certificates using standalone mode
    echo "Generating SSL certificates for $domain..."
    sudo certbot certonly \
        --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d $domain
    
    # Copy certificates to ssl directory with domain-specific names
    echo "Copying certificates for $domain..."
    sudo cp /etc/letsencrypt/live/$domain/fullchain.pem ssl/${domain}_fullchain.pem
    sudo cp /etc/letsencrypt/live/$domain/privkey.pem ssl/${domain}_privkey.pem
    sudo chown $(whoami):$(whoami) ssl/${domain}_fullchain.pem ssl/${domain}_privkey.pem
    
    echo "SSL setup complete for $domain!"
}

# Setup SSL for both domains
for domain in "${DOMAINS[@]}"; do
    setup_ssl_for_domain "$domain"
done

# Copy the primary domain certificates to the default names expected by nginx
echo "Setting up default certificate links..."
sudo cp ssl/mnemo.ishaan812.com_fullchain.pem ssl/fullchain.pem
sudo cp ssl/mnemo.ishaan812.com_privkey.pem ssl/privkey.pem

# Start nginx container
echo "Starting nginx container..."
docker compose up -d nginx

echo "SSL setup complete for all domains!"
echo "Your sites should now be accessible at:"
for domain in "${DOMAINS[@]}"; do
    echo "  - https://$domain"
done

# Set up auto-renewal
echo "Setting up certificate auto-renewal..."
# Remove any existing certbot renewal cron jobs to avoid duplicates
crontab -l 2>/dev/null | grep -v "certbot renew" | crontab -
# Add new renewal cron job
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && cd $(pwd) && docker compose restart nginx") | crontab -

echo "Auto-renewal configured to run daily at 12 PM"

# Test SSL connectivity
echo "Testing SSL connectivity..."
for domain in "${DOMAINS[@]}"; do
    echo "Testing $domain..."
    if curl -s -I "https://$domain" > /dev/null 2>&1; then
        echo "✅ $domain SSL is working correctly"
    else
        echo "❌ $domain SSL test failed - you may need to wait a few minutes for DNS propagation"
    fi
done 
