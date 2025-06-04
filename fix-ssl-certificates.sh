#!/bin/bash

# SSL Certificate Fix Script for both domains
# This script fixes SSL certificate issues by ensuring proper domain-specific certificates

set -e

DOMAINS=("mnemo.ishaan812.com" "scattegories.ishaan812.com")
EMAIL="ishaan.shah@gmail.com"

echo "🔧 Fixing SSL certificates for domains: ${DOMAINS[*]}"

# Create backup of current ssl directory
if [ -d "ssl" ]; then
    echo "📁 Creating backup of current SSL directory..."
    cp -r ssl ssl_backup_$(date +%Y%m%d_%H%M%S)
fi

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Function to check if certificate exists and is valid for domain
check_certificate() {
    local domain=$1
    local cert_path="/etc/letsencrypt/live/$domain/fullchain.pem"
    
    if [ -f "$cert_path" ]; then
        # Check if certificate is valid and matches the domain
        if sudo openssl x509 -in "$cert_path" -noout -text | grep -q "Subject:.*CN.*$domain"; then
            echo "✅ Valid certificate found for $domain"
            return 0
        else
            echo "❌ Certificate exists but doesn't match $domain"
            return 1
        fi
    else
        echo "❌ No certificate found for $domain"
        return 1
    fi
}

# Function to setup SSL for a domain
setup_domain_ssl() {
    local domain=$1
    echo "🌐 Setting up SSL for $domain..."
    
    # Check current certificate status
    if check_certificate "$domain"; then
        echo "📋 Certificate for $domain is valid, copying to ssl directory..."
    else
        echo "🔄 Generating new certificate for $domain..."
        
        # Stop nginx temporarily to free up port 80
        echo "⏸️  Stopping nginx container..."
        docker compose stop nginx || true
        sleep 5
        
        # Generate new certificate
        echo "🔐 Generating SSL certificate for $domain..."
        sudo certbot certonly \
            --standalone \
            --email $EMAIL \
            --agree-tos \
            --no-eff-email \
            --force-renewal \
            -d $domain
            
        echo "✅ Certificate generated for $domain"
    fi
    
    # Copy certificates to ssl directory with domain-specific names
    echo "📋 Copying certificates for $domain..."
    sudo cp /etc/letsencrypt/live/$domain/fullchain.pem ssl/${domain}_fullchain.pem
    sudo cp /etc/letsencrypt/live/$domain/privkey.pem ssl/${domain}_privkey.pem
    sudo chown $(whoami):$(whoami) ssl/${domain}_fullchain.pem ssl/${domain}_privkey.pem
    
    echo "✅ SSL setup complete for $domain"
}

# Process each domain
for domain in "${DOMAINS[@]}"; do
    setup_domain_ssl "$domain"
done

# Create fallback certificates (using mnemo as primary)
echo "🔗 Setting up fallback certificate links..."
cp ssl/mnemo.ishaan812.com_fullchain.pem ssl/fullchain.pem
cp ssl/mnemo.ishaan812.com_privkey.pem ssl/privkey.pem

# Verify all certificate files exist
echo "🔍 Verifying certificate files..."
for domain in "${DOMAINS[@]}"; do
    if [ -f "ssl/${domain}_fullchain.pem" ] && [ -f "ssl/${domain}_privkey.pem" ]; then
        echo "✅ Certificate files exist for $domain"
    else
        echo "❌ Missing certificate files for $domain"
        exit 1
    fi
done

# Restart nginx with new certificates
echo "🔄 Restarting nginx with new certificates..."
docker compose up -d nginx

# Wait for nginx to start
echo "⏳ Waiting for nginx to start..."
sleep 10

# Test SSL connectivity
echo "🧪 Testing SSL connectivity..."
for domain in "${DOMAINS[@]}"; do
    echo "Testing $domain..."
    if timeout 10 curl -s -I "https://$domain" | head -1 | grep -q "200\|301\|302"; then
        echo "✅ $domain SSL is working correctly"
        
        # Test certificate validity
        echo "🔍 Checking certificate details for $domain..."
        echo | timeout 5 openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -subject -dates | head -3
        
    else
        echo "❌ $domain SSL test failed"
        
        # Show nginx logs for debugging
        echo "📋 Recent nginx logs for debugging:"
        docker compose logs nginx | tail -10
    fi
    echo ""
done

echo "🎉 SSL certificate fix complete!"
echo ""
echo "📋 Summary:"
echo "  - Certificates generated/updated for: ${DOMAINS[*]}"
echo "  - Nginx configuration supports domain-specific certificates"
echo "  - Auto-renewal should be configured (check with 'crontab -l')"
echo ""
echo "🔗 Your sites should be accessible at:"
for domain in "${DOMAINS[@]}"; do
    echo "  - https://$domain"
done

# Set up or update auto-renewal
echo "⚙️  Setting up certificate auto-renewal..."
# Remove existing certbot renewal entries to avoid duplicates
(crontab -l 2>/dev/null | grep -v "certbot renew" || true) | crontab -
# Add new renewal entry
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet && cd $(pwd) && docker compose restart nginx") | crontab -
echo "✅ Auto-renewal configured to run daily at 3 AM" 