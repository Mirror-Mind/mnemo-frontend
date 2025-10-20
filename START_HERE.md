# 🚀 START HERE - Mnemo Frontend Deployment

> **Complete one-script deployment for Amazon Linux EC2**

## ⚡ Ultra Quick Start (30 seconds)

```bash
cd /path/to/mnemo-frontend
./quick-deploy.sh
```

That's literally it! The script will:
1. Ask you a few questions
2. Deploy everything automatically
3. Give you a working application

## 📦 What You Got

I've created a **complete deployment package** with 6 files:

```
mnemo-frontend/
├── 🔥 quick-deploy.sh                    ← START HERE (Interactive)
├── 🚀 deploy-amazon-linux.sh             ← Main deployment script
├── 📖 DEPLOYMENT_SUMMARY.md              ← Overview (read this next)
├── 📘 README_DEPLOYMENT.md               ← Quick guide
├── 📕 AMAZON_LINUX_DEPLOYMENT.md         ← Complete guide
└── 📋 DEPLOY_QUICK_REFERENCE.txt         ← Command cheat sheet
```

## 🎯 Choose Your Path

### 🟢 Path 1: Complete Beginner
```bash
1. Read DEPLOYMENT_SUMMARY.md       (5 minutes)
2. Run ./quick-deploy.sh            (Follow prompts)
3. Keep DEPLOY_QUICK_REFERENCE.txt handy
```

### 🟡 Path 2: Quick Deploy
```bash
1. Run ./quick-deploy.sh            (Interactive)
   OR
   DOMAIN=your-domain.com EMAIL=you@email.com ./deploy-amazon-linux.sh
2. Done!
```

### 🔴 Path 3: Power User
```bash
1. Read AMAZON_LINUX_DEPLOYMENT.md  (Full details)
2. Customize docker-compose.yml if needed
3. Run deploy-amazon-linux.sh with custom env vars
```

## 📚 File Guide

| File | Size | Purpose | When to Use |
|------|------|---------|-------------|
| **START_HERE.md** | - | You're reading it! | Right now |
| **quick-deploy.sh** | 4.5KB | Interactive deployment | First time deploying |
| **deploy-amazon-linux.sh** | 15KB | Main deployment script | Auto-runs or manual |
| **DEPLOYMENT_SUMMARY.md** | 10KB | Complete overview | Read after this |
| **README_DEPLOYMENT.md** | 8.1KB | Quick reference | Day-to-day use |
| **AMAZON_LINUX_DEPLOYMENT.md** | 8.8KB | Detailed guide | Troubleshooting |
| **DEPLOY_QUICK_REFERENCE.txt** | 11KB | Command cheatsheet | Keep open nearby |

## 🎬 3-Minute Deployment

```bash
# Step 1: SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Step 2: Clone repo (if not done)
git clone <repo-url> mnemo
cd mnemo/mnemo-frontend

# Step 3: Deploy
./quick-deploy.sh

# That's it! ✨
```

## ✅ Pre-Deployment Checklist

- [ ] Amazon Linux 2 or 2023 EC2 instance
- [ ] Minimum: t3.medium (2 vCPU, 4GB RAM)
- [ ] 20GB+ storage
- [ ] Public IP assigned
- [ ] Security Group allows ports: 22, 80, 443, 3000
- [ ] (Optional) Domain DNS pointing to EC2
- [ ] (Optional) OpenAI API key ready

**Don't have these?** See `AMAZON_LINUX_DEPLOYMENT.md` for setup help.

## 🚀 What Gets Deployed

```
┌────────────────────────────────────────┐
│   Your Complete Application Stack      │
├────────────────────────────────────────┤
│ ✅ Docker & Docker Compose            │
│ ✅ PostgreSQL 17 + pgvector            │
│ ✅ Redis Stack (vector support)        │
│ ✅ Next.js App (mnemo-frontend)        │
│ ✅ Scheduler (background jobs)         │
│ ✅ Nginx + SSL                         │
│ ✅ Let's Encrypt (or self-signed)      │
│ ✅ Firewall configuration              │
│ ✅ Health monitoring                   │
└────────────────────────────────────────┘
```

**Deployment time:** ~10-15 minutes

## 🎮 Essential Commands

```bash
# Deploy
./quick-deploy.sh

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Restart
docker-compose restart

# Update config
nano .env && docker-compose restart
```

**More commands?** See `DEPLOY_QUICK_REFERENCE.txt`

## 🌟 Post-Deployment (Important!)

After deployment succeeds:

1. **Edit `.env` file** with your real API keys
   ```bash
   nano .env
   # Add your OPENAI_API_KEY and other keys
   ```

2. **Restart services**
   ```bash
   docker-compose restart
   ```

3. **Access your app**
   - With domain: `https://your-domain.com`
   - Without: `http://[EC2-IP]:3000`

4. **Verify everything works**
   ```bash
   docker-compose ps              # All services "Up"
   curl http://localhost:3000/api/health  # Returns OK
   ```

## 🔍 Quick Verification

```bash
# All services running?
docker-compose ps
# Should show 5 services: app, postgres, redis, scheduler, nginx

# App healthy?
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}

# Check logs
docker-compose logs --tail=50
# Should show no errors
```

## ❓ Need Help?

### Quick Issues

**Services not starting?**
```bash
docker-compose logs
docker-compose restart
```

**Can't access app?**
1. Check EC2 Security Group (ports 80, 443, 3000)
2. Check firewall: `sudo firewall-cmd --list-all`
3. Check logs: `docker-compose logs -f app`

**SSL failed?**
- Make sure DNS points to your server
- Wait 5-30 minutes for DNS propagation
- Ensure ports 80/443 are accessible

### Detailed Help

- **Quick commands:** `DEPLOY_QUICK_REFERENCE.txt`
- **Common issues:** `README_DEPLOYMENT.md`
- **Everything:** `AMAZON_LINUX_DEPLOYMENT.md`

## 🎯 Success Looks Like

```bash
$ docker-compose ps

NAME                IMAGE              STATUS
mnemo-app          mnemo-app:latest   Up (healthy)
mnemo-postgres     pgvector:pg17      Up (healthy)
mnemo-redis        redis-stack:7.4    Up (healthy)
mnemo-scheduler    mnemo-app:latest   Up
mnemo-nginx        nginx:1.26         Up (healthy)
```

```bash
$ curl http://localhost:3000/api/health
{"status":"ok"}
```

🎉 **You're live!**

## 📞 Support Resources

1. 📋 **Quick Reference:** `DEPLOY_QUICK_REFERENCE.txt`
2. 📘 **Quick Guide:** `README_DEPLOYMENT.md`
3. 📕 **Full Guide:** `AMAZON_LINUX_DEPLOYMENT.md`
4. 📖 **Overview:** `DEPLOYMENT_SUMMARY.md`

## 🚦 Current Status

After running the deployment script, check:

```bash
# Find your deployment info
cat deployment-info.txt

# Your passwords are here
# Your configuration is here
# Your access URLs are here
```

## 💡 Pro Tips

- **First time?** Use `./quick-deploy.sh` (interactive)
- **Automating?** Use `deploy-amazon-linux.sh` with env vars
- **Troubleshooting?** Check logs: `docker-compose logs -f`
- **Keep handy:** `DEPLOY_QUICK_REFERENCE.txt`

## 🎓 Learning Path

```
1. START_HERE.md (you are here)
        ↓
2. Run ./quick-deploy.sh
        ↓
3. Read DEPLOYMENT_SUMMARY.md
        ↓
4. Bookmark DEPLOY_QUICK_REFERENCE.txt
        ↓
5. Read AMAZON_LINUX_DEPLOYMENT.md (when needed)
```

## 🔥 Ready to Deploy?

### Option 1: Interactive (Recommended for first time)
```bash
./quick-deploy.sh
```

### Option 2: One Command
```bash
DOMAIN=your-domain.com \
EMAIL=your@email.com \
OPENAI_API_KEY=sk-your-key \
./deploy-amazon-linux.sh
```

### Option 3: Simple (localhost, configure later)
```bash
./deploy-amazon-linux.sh
```

---

## 🎉 That's It!

You now have:
- ✅ Complete deployment scripts
- ✅ Comprehensive documentation
- ✅ Quick reference guides
- ✅ Troubleshooting help
- ✅ Best practices
- ✅ Everything you need!

**Just run:** `./quick-deploy.sh`

---

*Questions? See `AMAZON_LINUX_DEPLOYMENT.md` or `DEPLOY_QUICK_REFERENCE.txt`*

**Happy Deploying! 🚀**


