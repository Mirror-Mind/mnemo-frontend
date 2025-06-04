# SSL Setup Guide for mnemo.ishaan812.com and scattegories.ishaan812.com

This guide helps you set up and maintain SSL certificates for both domains using Let's Encrypt.

## Quick Start

### 1. Check Current SSL Status
```bash
./check-ssl-status.sh
```

### 2. Set Up SSL Certificates (First Time)
```bash
./setup-ssl.sh
```

### 3. Renew SSL Certificates
```bash
./renew-ssl.sh
```

## Prerequisites

Before running the SSL setup:

1. **DNS Configuration**: Ensure both domains point to your server:
   ```bash
   nslookup mnemo.ishaan812.com
   nslookup scattegories.ishaan812.com
   ```

2. **Ports Open**: Make sure ports 80 and 443 are accessible:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **Docker Running**: Ensure Docker containers are running:
   ```bash
   docker compose up -d
   ```

## SSL Certificate Files

The SSL setup creates the following structure:
```
ssl/
├── fullchain.pem    # Full certificate chain
└── privkey.pem      # Private key

certbot-webroot/     # Webroot for Let's Encrypt verification
```

## Nginx Configuration

The `nginx.conf` is already configured to handle both domains with SSL:

- **mnemo.ishaan812.com**: Main Mnemo application
- **scattegories.ishaan812.com**: Scattegories game application

Both domains share the same SSL certificate for cost efficiency.

## Troubleshooting

### Common Issues

1. **Domains not accessible**:
   - Check DNS propagation: `dig mnemo.ishaan812.com`
   - Verify server is reachable: `ping mnemo.ishaan812.com`

2. **Certificate generation fails**:
   - Ensure ports 80/443 are not blocked by firewall
   - Check if another web server is running on these ports
   - Verify domain ownership

3. **SSL not working after setup**:
   - Check nginx logs: `docker compose logs nginx`
   - Verify certificate files exist: `ls -la ssl/`
   - Restart nginx: `docker compose restart nginx`

### Manual Certificate Check
```bash
# Check certificate expiration
openssl x509 -in ssl/fullchain.pem -text -noout | grep "Not After"

# Test SSL connection
openssl s_client -connect mnemo.ishaan812.com:443 -servername mnemo.ishaan812.com
```

## Auto-Renewal

The setup script automatically configures a cron job for certificate renewal:
```bash
# View current cron jobs
crontab -l

# Manual renewal test
sudo certbot renew --dry-run
```

## Security Notes

- Certificates are valid for 90 days
- Auto-renewal runs daily at 12 PM
- Always backup certificates before renewal
- Monitor certificate expiration

## File Descriptions

- `setup-ssl.sh`: Initial SSL certificate setup for both domains
- `check-ssl-status.sh`: Check current SSL status without making changes
- `renew-ssl.sh`: Renew existing SSL certificates
- `nginx.conf`: Nginx configuration with SSL settings for both domains
- `docker-compose.yml`: Docker setup with SSL volume mounts

## Support

If you encounter issues:
1. Check the logs: `docker compose logs`
2. Verify DNS settings
3. Ensure firewall allows HTTP/HTTPS traffic
4. Check Let's Encrypt rate limits 