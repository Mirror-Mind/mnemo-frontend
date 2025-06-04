#!/bin/bash

# SSL Status Check Script
# Quick script to check SSL certificate status for both domains

DOMAINS=("mnemo.ishaan812.com" "scattegories.ishaan812.com")

echo "🔍 SSL Status Check for domains: ${DOMAINS[*]}"
echo "================================================"

check_ssl_status() {
    local domain=$1
    echo "🌐 Checking $domain..."
    
    # Test HTTPS connectivity
    if timeout 10 curl -s -I "https://$domain" >/dev/null 2>&1; then
        echo "✅ HTTPS connectivity: WORKING"
        
        # Get certificate details
        cert_info=$(echo | timeout 5 openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo "📋 Certificate details:"
            echo "$cert_info" | sed 's/^/   /'
            
            # Check expiration
            expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d'=' -f2)
            if [ -n "$expiry_date" ]; then
                expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry_date" +%s 2>/dev/null)
                current_timestamp=$(date +%s)
                days_until_expiry=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
                
                if [ $days_until_expiry -gt 30 ]; then
                    echo "🟢 Certificate expires in $days_until_expiry days (Good)"
                elif [ $days_until_expiry -gt 7 ]; then
                    echo "🟡 Certificate expires in $days_until_expiry days (Renew soon)"
                else
                    echo "🔴 Certificate expires in $days_until_expiry days (URGENT)"
                fi
            fi
        else
            echo "⚠️  Could not retrieve certificate details"
        fi
        
    else
        echo "❌ HTTPS connectivity: FAILED"
        
        # Try HTTP to see if server is up
        if timeout 5 curl -s -I "http://$domain" >/dev/null 2>&1; then
            echo "   ℹ️  HTTP works, but HTTPS is broken"
        else
            echo "   ℹ️  Server appears to be down"
        fi
    fi
    
    echo "------------------------------------------------"
}

# Check each domain
for domain in "${DOMAINS[@]}"; do
    check_ssl_status "$domain"
done

echo "🏁 SSL status check complete!"
echo ""
echo "💡 If any domains show issues:"
echo "   1. Run './fix-ssl-certificates.sh' on your server"
echo "   2. Check nginx logs: 'docker compose logs nginx'"
echo "   3. Verify DNS settings point to your server" 