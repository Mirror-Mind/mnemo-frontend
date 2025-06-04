#!/bin/bash

# SSL Status Check Script for mnemo.ishaan812.com and scattegories.ishaan812.com
# This script checks the current SSL status of both domains

set -e

DOMAINS=("mnemo.ishaan812.com" "scattegories.ishaan812.com")

echo "🔍 Checking SSL status for domains..."
echo ""

# Function to check SSL certificate
check_ssl_status() {
    local domain=$1
    echo "Checking $domain..."
    
    # Check HTTP accessibility
    if curl -I --connect-timeout 10 --max-time 30 "http://$domain" >/dev/null 2>&1; then
        echo "  ✓ HTTP accessible"
    else
        echo "  ✗ HTTP not accessible"
    fi
    
    # Check HTTPS accessibility and certificate
    if curl -I --connect-timeout 10 --max-time 30 "https://$domain" >/dev/null 2>&1; then
        echo "  ✅ HTTPS working"
        
        # Get certificate details
        cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Could not get certificate info")
        if [[ "$cert_info" != "Could not get certificate info" ]]; then
            echo "  📄 Certificate details:"
            echo "$cert_info" | sed 's/^/    /'
        fi
    else
        echo "  ❌ HTTPS not working"
        
        # Try to get more details about the failure
        error_details=$(curl -I --connect-timeout 10 --max-time 30 "https://$domain" 2>&1 || true)
        echo "  🔍 Error details: $error_details" | head -1
    fi
    
    echo ""
}

# Check each domain
for domain in "${DOMAINS[@]}"; do
    check_ssl_status "$domain"
done

# Check if Docker containers are running
echo "🐳 Docker container status:"
docker compose ps | grep -E "(nginx|app)" || echo "No relevant containers running"

echo ""
echo "📋 Summary:"
echo "If SSL is not working for either domain, run: ./setup-ssl.sh"
echo "Make sure your DNS records point to this server and ports 80/443 are open." 