# EC2 Deployment Guide for Mnemo Frontend

## Quick Start

This guide will help you deploy the Mnemo frontend on a fresh Amazon Linux EC2 instance.

## Prerequisites

1. ✅ EC2 instance running Amazon Linux 2023
2. ✅ SSH access to your EC2 instance
3. ✅ Git repository already cloned to the instance
4. ❌ Security group configured (we'll remind you about this)

## Deployment Steps

### 1. SSH into your EC2 instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### 2. Navigate to the frontend directory

```bash
cd ~/path/to/mnemo/mnemo-frontend
# Or wherever you cloned the repo
```

### 3. Run the deployment script

```bash
./deploy-ec2-amazon-linux.sh
```

### 4. Configure environment variables

When prompted, update the `.env` file with your actual credentials:

```bash
nano .env
```

**Required variables:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `BETTER_AUTH_SECRET` - A long random string (min 32 characters)
- `DATABASE_URL` - Keep default if using docker-compose setup

**Optional variables:**
- Google OAuth credentials
- GitHub OAuth credentials
- WhatsApp Business API credentials

### 5. Configure EC2 Security Group

In AWS Console, add an inbound rule to your EC2 Security Group:

| Type       | Protocol | Port Range | Source    | Description        |
|------------|----------|------------|-----------|-------------------- |
| Custom TCP | TCP      | 3000       | 0.0.0.0/0 | Mnemo Frontend     |

For production with SSL, also add:
- Port 80 (HTTP)
- Port 443 (HTTPS)

### 6. Access your application

Once deployed, access your application at:
- **Public URL**: `http://YOUR_EC2_PUBLIC_IP:3000`
- **Health Check**: `http://YOUR_EC2_PUBLIC_IP:3000/api/health`

## What the Script Does

The deployment script automatically:

1. ✅ Updates system packages
2. ✅ Installs Docker
3. ✅ Installs Docker Compose
4. ✅ Creates a template `.env` file (if needed)
5. ✅ Builds the Docker image
6. ✅ Starts the application container
7. ✅ Runs health checks

## Useful Commands

### View application logs
```bash
sudo docker-compose -f docker-compose.frontend-only.yml logs -f
```

### Restart the application
```bash
sudo docker-compose -f docker-compose.frontend-only.yml restart
```

### Stop the application
```bash
sudo docker-compose -f docker-compose.frontend-only.yml down
```

### Rebuild and restart
```bash
sudo docker-compose -f docker-compose.frontend-only.yml up -d --build
```

### Check container status
```bash
sudo docker ps
```

### Enter the container (for debugging)
```bash
sudo docker exec -it mnemo-app sh
```

## Troubleshooting

### Container won't start

Check logs:
```bash
sudo docker-compose -f docker-compose.frontend-only.yml logs
```

### Can't access from browser

1. Check security group allows port 3000
2. Test locally first: `curl http://localhost:3000/api/health`
3. Verify container is running: `sudo docker ps`

### Build fails

1. Ensure you have enough disk space: `df -h`
2. Ensure you have enough memory: `free -h`
3. Try rebuilding without cache:
   ```bash
   sudo docker-compose -f docker-compose.frontend-only.yml build --no-cache
   ```

### Permission errors

If you see Docker permission errors, you may need to use `sudo` or log out and back in after Docker installation.

## Full Stack Deployment

If you need PostgreSQL, Redis, and the scheduler, use the full `docker-compose.yml` instead:

```bash
sudo docker-compose up -d --build
```

This will start:
- Frontend app (port 3000)
- PostgreSQL with pgvector (port 5433)
- Redis Stack (ports 6379, 8001)
- Scheduler service
- Nginx reverse proxy (ports 80, 443)

## Environment Variables Reference

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for authentication (32+ chars)
- `BETTER_AUTH_URL` - Base URL of your application
- `OPENAI_API_KEY` - OpenAI API key for AI features

### Optional
- `GOOGLE_API_KEY` - For Google services integration
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `GITHUB_CLIENT_ID` - For GitHub OAuth
- `GITHUB_CLIENT_SECRET` - For GitHub OAuth
- `USE_REDIS_MEM0` - Enable Redis for memory storage (true/false)
- `REDIS_URL` - Redis connection string
- WhatsApp Business API credentials (see `.env` template)

## Production Recommendations

1. **Use SSL/TLS**: Set up SSL certificates using the included `setup-ssl.sh` script
2. **Use proper secrets**: Never use default passwords or dummy keys
3. **Restrict Security Groups**: Limit access to specific IPs when possible
4. **Set up monitoring**: Consider using CloudWatch or similar
5. **Regular backups**: Back up your PostgreSQL data volume
6. **Update regularly**: Keep Docker images and system packages updated

## Support

For issues or questions:
- Check the logs first
- Review the main README.md
- Check PRODUCTION_DEBUGGING.md for common issues

## Quick Reference Card

```bash
# Deploy/Update
./deploy-ec2-amazon-linux.sh

# Check status
sudo docker ps

# View logs
sudo docker-compose -f docker-compose.frontend-only.yml logs -f

# Restart
sudo docker-compose -f docker-compose.frontend-only.yml restart

# Stop
sudo docker-compose -f docker-compose.frontend-only.yml down

# Rebuild
sudo docker-compose -f docker-compose.frontend-only.yml up -d --build
```

---

**Happy Deploying! 🚀**

