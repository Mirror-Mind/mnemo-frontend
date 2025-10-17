# Mnemo Frontend - One-Click Amazon Linux Deployment 🚀

This directory contains everything you need to deploy the complete Mnemo frontend application stack on an Amazon Linux EC2 instance with a single command.

## 📋 Quick Start

### Option 1: Interactive Quick Deploy (Recommended)
```bash
./quick-deploy.sh
```

This will:
- Prompt you for domain and email
- Ask for your OpenAI API key
- Run the full deployment automatically

### Option 2: One-Line Deploy with Environment Variables
```bash
DOMAIN=your-domain.com EMAIL=your@email.com OPENAI_API_KEY=sk-your-key ./deploy-amazon-linux.sh
```

### Option 3: Simple Local Deploy
```bash
./deploy-amazon-linux.sh
```

That's it! ✨

## 🎯 What Gets Deployed

The deployment script automatically sets up:

- ✅ **Docker & Docker Compose** - Latest stable versions
- ✅ **PostgreSQL 17** with pgvector extension for vector storage
- ✅ **Redis Stack** with RediSearch and vector capabilities
- ✅ **Next.js Application** - The main Mnemo frontend
- ✅ **Scheduler Service** - For background jobs and cron tasks
- ✅ **Nginx** - Reverse proxy with SSL termination
- ✅ **SSL Certificates** - Self-signed or Let's Encrypt
- ✅ **Firewall Configuration** - Automatic port setup
- ✅ **Health Checks** - Automatic service monitoring

## 📦 Files Included

- `deploy-amazon-linux.sh` - Main deployment script (comprehensive)
- `quick-deploy.sh` - Interactive wrapper for easier deployment
- `AMAZON_LINUX_DEPLOYMENT.md` - Detailed deployment guide
- `README_DEPLOYMENT.md` - This file
- `docker-compose.yml` - Docker services configuration
- `nginx.conf` - Nginx configuration with SSL
- `Dockerfile` - Application container definition

## ⚙️ Prerequisites

### EC2 Instance Requirements
- **OS**: Amazon Linux 2 or Amazon Linux 2023
- **Instance Type**: t3.medium or larger (minimum 2 vCPU, 4GB RAM)
- **Storage**: 20GB+ EBS volume
- **Network**: Public IP address assigned

### Security Group Requirements
Configure your EC2 Security Group to allow:
- **Port 22**: SSH (for management)
- **Port 80**: HTTP
- **Port 443**: HTTPS
- **Port 3000**: Application (optional, for direct access)

### What You Need
1. SSH access to your EC2 instance
2. This repository cloned on the instance
3. (Optional) A domain name pointing to your EC2 public IP
4. (Optional) OpenAI API key for AI functionality

## 🚀 Deployment Process

### Step 1: Connect to EC2
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### Step 2: Clone Repository
```bash
git clone <your-repo-url> mnemo
cd mnemo/mnemo-frontend
```

### Step 3: Run Deployment
Choose one of the quick start options above.

### Step 4: Configure DNS (If Using Domain)
Point your domain's A record to your EC2 public IP:
```
Type: A
Name: your-domain.com
Value: [Your EC2 Public IP]
TTL: 300
```

### Step 5: Access Your Application
- **With Domain**: `https://your-domain.com`
- **Without Domain**: `http://[EC2-PUBLIC-IP]:3000`

## 🔧 Post-Deployment Configuration

### 1. Update API Keys

The deployment creates a `.env` file with defaults. Update it with your actual API keys:

```bash
nano .env
```

Required for full functionality:
- `OPENAI_API_KEY` - For AI features
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - For GitHub OAuth

After updating:
```bash
docker-compose restart
```

### 2. Verify Services

Check that all services are running:
```bash
docker-compose ps
```

Expected output: All services should show "Up" status

### 3. Test Application

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok"}` or similar

## 📊 Management Commands

### View Logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f app          # Application only
docker-compose logs -f postgres     # Database only
```

### Restart Services
```bash
docker-compose restart              # All services
docker-compose restart app          # Application only
```

### Stop/Start Services
```bash
docker-compose down                 # Stop all services
docker-compose up -d                # Start all services
```

### Update Application
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Security Notes

1. **Change Default Passwords**: The script generates secure random passwords, but you can customize them in `.env`
2. **SSL Certificates**: The script attempts Let's Encrypt for production domains, falls back to self-signed for localhost
3. **Firewall**: Configure EC2 Security Groups properly - only open necessary ports
4. **API Keys**: Never commit `.env` file with real API keys to version control

## 🐛 Troubleshooting

### Services Not Starting
```bash
docker-compose logs
docker-compose restart
```

### Can't Access Application
1. Check EC2 Security Group allows ports 80, 443, 3000
2. Verify services are running: `docker-compose ps`
3. Check logs: `docker-compose logs -f app`

### SSL Certificate Failed
```bash
# Manually obtain certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy to ssl directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
sudo chown -R $USER:$USER ssl/

# Restart nginx
docker-compose restart nginx
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

## 📚 Additional Documentation

- **Comprehensive Guide**: See `AMAZON_LINUX_DEPLOYMENT.md` for detailed documentation
- **Docker Compose**: See `docker-compose.yml` for service configuration
- **Nginx Config**: See `nginx.conf` for proxy and SSL settings

## 🔄 Backup and Recovery

### Quick Backup
```bash
# Backup database
docker exec mnemo-postgres pg_dump -U mnemo mnemo_db > backup-$(date +%Y%m%d).sql

# Backup environment
cp .env .env.backup
```

### Restore
```bash
# Restore database
cat backup.sql | docker exec -i mnemo-postgres psql -U mnemo mnemo_db
```

## 📈 Monitoring

### Check Resource Usage
```bash
docker stats                        # Container resource usage
free -h                            # Memory usage
df -h                              # Disk usage
```

### Application Health
```bash
curl http://localhost:3000/api/health
```

### Service Status
```bash
docker-compose ps
```

## 🆘 Getting Help

1. **Check Logs**: `docker-compose logs -f`
2. **Read Full Guide**: `AMAZON_LINUX_DEPLOYMENT.md`
3. **Check Service Status**: `docker-compose ps`
4. **Review Environment**: `cat .env` (be careful not to expose secrets)

## 📝 Environment Variables Reference

### Required
- `OPENAI_API_KEY` - OpenAI API key for AI functionality

### Auto-Generated (Secure Defaults)
- `POSTGRES_PASSWORD` - PostgreSQL password (random)
- `BETTER_AUTH_SECRET` - Authentication secret (random)

### Optional
- `DOMAIN` - Your domain name (default: localhost)
- `EMAIL` - Email for SSL certificates
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- Other API keys as needed

## 🎓 Tips for Production

1. **Use a Domain**: Always use a real domain for production
2. **Let's Encrypt SSL**: Ensure DNS is configured before deployment
3. **Monitoring**: Set up monitoring for your application
4. **Backups**: Schedule regular database backups
5. **Updates**: Keep Docker images and system packages updated
6. **Security**: Review and restrict access to sensitive ports

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review `AMAZON_LINUX_DEPLOYMENT.md` for detailed troubleshooting
3. Check GitHub issues
4. Contact support team

## 🙏 Contributing

Found a bug? Have a suggestion? Please open an issue or submit a pull request!

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Compatible With**: Amazon Linux 2, Amazon Linux 2023

Made with ❤️ for easy deployment

