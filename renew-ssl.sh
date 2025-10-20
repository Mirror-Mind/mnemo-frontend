#!/bin/bash

# SSL Renewal Script for mnemo.ishaan812.com
# This script renews SSL certificates and restarts nginx

set -e

echo "🔄 Starting SSL certificate renewal process..."

# Check if containers are running
if ! docker-compose ps | grep -q "nginx.*Up"; then
    echo "⚠️ Nginx container is not running. Starting containers..."
    docker-compose up -d
    sleep 10
fi

# Create backup of current certificates
if [ -d "ssl" ]; then
    echo "📦 Creating backup of current certificates..."
    cp -r ssl ssl-backup-$(date +%Y%m%d-%H%M%S)
fi

# Renew certificates
echo "🔄 Renewing SSL certificates..."
if sudo certbot renew --quiet; then
    echo "✅ Certificate renewal successful"
    
    # Copy renewed certificates
    echo "📋 Copying renewed certificates..."
    sudo cp /etc/letsencrypt/live/mnemo.ishaan812.com/fullchain.pem ssl/
    sudo cp /etc/letsencrypt/live/mnemo.ishaan812.com/privkey.pem ssl/
    sudo chown $(whoami):$(whoami) ssl/fullchain.pem ssl/privkey.pem
    
    # Restart nginx to load new certificates
    echo "🔄 Restarting nginx with new certificates..."
    docker-compose restart nginx
    
    echo "✅ SSL renewal completed successfully!"
    
    # Verify certificates are working
    sleep 10
    echo "🔍 Verifying renewed certificates..."
    
    if curl -I --connect-timeout 10 --max-time 30 "https://mnemo.ishaan812.com" >/dev/null 2>&1; then
        echo "  ✅ mnemo.ishaan812.com SSL is working"
    else
        echo "  ❌ mnemo.ishaan812.com SSL verification failed"
    fi
    
else
    echo "❌ Certificate renewal failed"
    echo "Check the logs above for details"
    exit 1
fi

echo ""
echo "📊 Current certificate status:"
sudo certbot certificates 