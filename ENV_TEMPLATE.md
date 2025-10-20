# Environment Variables Template

## Required Setup

Before running the deployment script, create a `.env` file in the `mnemo-frontend` directory with the following variables:

## Minimum Required Variables

```bash
# Node Environment
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://mnemo:your-secure-password@postgres:5432/mnemo_db

# Redis Configuration
REDIS_URL=redis://redis:6379
USE_REDIS_MEM0=true
MEM0_COLLECTION_NAME=mnemo-memories

# Authentication (Generate with: openssl rand -hex 32)
BETTER_AUTH_SECRET=your-64-character-secret-key-here
BETTER_AUTH_URL=http://your-domain.com

# OpenAI Configuration (REQUIRED for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Next.js Configuration
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=2048 --max-http-header-size=32768
UV_THREADPOOL_SIZE=16
```

## Optional Variables

### Google OAuth
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://your-domain.com/api/auth/callback/google
GOOGLE_API_KEY=your-google-api-key
```

### GitHub OAuth
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### WhatsApp Business API
```bash
META_WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
META_WHATSAPP_ACCESS_TOKEN=your-access-token
META_WEBHOOK_VERIFY_TOKEN=your-verify-token
META_APP_SECRET=your-app-secret
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token
```

### Other LLM APIs
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
MISTRAL_API_KEY=your-mistral-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### Neo4j (Knowledge Graph)
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
```

### Email Configuration
```bash
EMAIL_JS_SERVICE_ID=your-emailjs-service-id
EMAIL_JS_TEMPLATE_ID=your-emailjs-template-id
EMAIL_JS_PUBLIC_KEY=your-emailjs-public-key
```

## Quick Setup

### 1. Create .env file
```bash
cd mnemo-frontend
touch .env
chmod 600 .env
```

### 2. Generate secure secrets
```bash
# Generate BETTER_AUTH_SECRET
openssl rand -hex 32

# Generate PostgreSQL password
openssl rand -hex 16
```

### 3. Edit .env file
```bash
nano .env
# or
vim .env
```

### 4. Add minimum required variables
Copy the "Minimum Required Variables" section above and fill in your actual values.

### 5. Run deployment
```bash
./quick-deploy.sh
# or
./deploy-amazon-linux.sh
```

## Verification

After creating your `.env` file, verify it has the required variables:

```bash
# Check if required variables exist
grep -E "(DATABASE_URL|REDIS_URL|BETTER_AUTH_SECRET|OPENAI_API_KEY|NODE_ENV)" .env
```

## Security Notes

- ⚠️ **Never commit `.env` to version control**
- ⚠️ Set file permissions: `chmod 600 .env`
- ⚠️ Use strong, unique passwords
- ⚠️ Generate secrets with `openssl rand -hex 32`
- ⚠️ Keep backups in a secure location

## Troubleshooting

### Script says .env not found
```bash
# Make sure you're in the correct directory
pwd
# Should show: /path/to/mnemo-frontend

# Check if .env exists
ls -la .env

# If not, create it
touch .env
chmod 600 .env
# Then add your configuration
```

### Invalid .env format
- Ensure no spaces around `=` signs
- Quote values with spaces: `KEY="value with spaces"`
- No trailing spaces or comments on value lines

### Missing required variables
The deployment script will check for the `.env` file but won't validate individual variables. Make sure you have at minimum:
- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `OPENAI_API_KEY`
- `NODE_ENV`

## Example Complete .env File

```bash
# Node Environment
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://mnemo:super_secure_pass_123@postgres:5432/mnemo_db

# Redis Configuration
REDIS_URL=redis://redis:6379
USE_REDIS_MEM0=true
MEM0_COLLECTION_NAME=mnemo-memories

# Authentication
BETTER_AUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
BETTER_AUTH_URL=http://mnemo.example.com
BETTERAUTH_URL=http://mnemo.example.com

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-abc123xyz789

# Next.js Configuration
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=2048 --max-http-header-size=32768
UV_THREADPOOL_SIZE=16
```

Save this as `.env` and you're ready to deploy!


