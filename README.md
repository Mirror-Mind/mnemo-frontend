# Orbia - Your WhatsApp Personal Assistant
Orbia is an AI-powered personal assistant that connects to your WhatsApp and integrates with your personal data services like Gmail, Google Calendar, Google Drive, and more to help you manage your life efficiently. Orbia allows to make accessing and searching through all of your productivity apps easier and through a simple easy to use interface (on whatsapp). Orbia functions differently from a normal chatbot since it nudges you first, rather than you always having to chat with it. It will have features like a Morning Briefing which will give you a run down of your entire day, dynamic reminders based on email nudges, active periodic nudging for various important tasks, automatically scheduling meetings based on emails etc. It can even give you an every morning podcast of various activities scheduled for your day!

We chose whatsapp as our first interface, since .Eventually, we want orbia to have various interfaces like a call interface, video interface and make it multilingual and as easy to use as possible by using various generative ui techniques using flows, interactive messages on whatsapp to be a one stop interface for all kinds of tasks and automate them for the user without ever downloading another app or traversing to a website.

## Features

- **WhatsApp Integration**: Manage your tasks, reminders, and information directly from WhatsApp
- **Morning Briefing**: Get a run down of your entire day, including your schedule, important tasks, and any other relevant information
- **Dynamic Reminders**: Get reminders for important tasks and events based on your email and calendar
- **Multi-Service Connectivity**: Connect all your productivity apps in one place
- **Calendar Management**: View, schedule, and modify appointments through simple text commands
- **Infinite Memory**: The agent has hybrid memory capabilities, combining long-term and short-term memory to offer effectively infinite memory to make the agent hyper personalised
- **Document Access**: Find and share your Google Drive documents quickly
- **GitHub Updates**: Stay on top of pull requests and issues
- **AI Assistant**: Powerful natural language processing to understand your requests


## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Orbia.git
cd Orbia
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the .env file with your credentials:
- WhatsApp Business API credentials
- Google OAuth credentials
- GitHub API tokens
- Redis configuration for production
- Other necessary API keys

### Environment Variables

#### Required Variables:
- `OPENAI_API_KEY`: OpenAI API key for LLM and embeddings
- `DATABASE_URL`: PostgreSQL database connection string
- `BETTER_AUTH_SECRET`: Secret for authentication
- `BETTER_AUTH_URL`: Base URL for authentication
- `PERPLEXITY_API_KEY`: Perplexity Sonar API key for real-time news intelligence in morning podcasts

#### WhatsApp Business API:
- `META_WHATSAPP_PHONE_NUMBER_ID`: WhatsApp Business phone number ID
- `META_WHATSAPP_ACCESS_TOKEN`: WhatsApp Business access token
- `META_WEBHOOK_VERIFY_TOKEN`: Webhook verification token

#### Production Redis Configuration for Mem0:
- `NODE_ENV`: Set to "production" for automatic Redis usage
- `USE_REDIS_MEM0`: Set to "true" to force Redis usage in development
- `REDIS_URL`: Redis connection URL (e.g., "redis://localhost:6379")
- `REDIS_USERNAME`: Redis username (optional)
- `REDIS_PASSWORD`: Redis password (optional)
- `MEM0_COLLECTION_NAME`: Collection name for memories (default: "orbia-memories")

#### Optional Service Integrations:
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth for Calendar/Drive
- `GITHUB_TOKEN`: GitHub API token for pull requests
- `GMAIL_CLIENT_ID` & `GMAIL_CLIENT_SECRET`: Gmail integration
- `ELEVENLABS_API_KEY`: ElevenLabs API key for text-to-speech in morning podcasts

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the app

## Authentication

Orbia uses NextAuth.js for secure user authentication and session management.

## Deployment

### Production Setup

For production deployment, Orbia automatically uses Redis for mem0 vector storage to ensure scalable and persistent memory management.

#### Required for Production:
1. **Redis Instance**: Set up a Redis instance (can use cloud providers like Upstash, Redis Cloud, or self-hosted)
2. **Environment Variables**: Configure Redis connection in your production environment
3. **Dependencies**: Redis package is already included in the project

#### Redis Setup Options:

**Option 1: Using Docker (Local/Self-hosted)**
```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

**Option 2: Cloud Redis (Upstash, Redis Cloud, etc.)**
- Sign up for a Redis cloud service
- Get your Redis URL and credentials
- Add them to your production environment variables

### Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/Orbia)

**Note**: When deploying to Vercel, make sure to:
1. Add all required environment variables in Vercel dashboard
2. Set `NODE_ENV=production` 
3. Configure your Redis URL from your cloud Redis provider

### Docker Deployment (Recommended for Production)

For a complete production setup with all services:

```bash
# Quick start with Docker
./deploy/deploy.sh deploy production

# Or manually with Docker Compose
docker-compose up -d
```

**Included Services:**
- **Orbia App**: Next.js application with Redis mem0 integration
- **Redis Stack**: Vector storage for mem0 + management GUI
- **Nginx**: Reverse proxy with SSL, rate limiting, and security headers
- **Scheduler**: Background tasks for Morning Briefings and reminders

**External Services Required:**
- **PostgreSQL Database**: Your external database (Neon, Supabase, AWS RDS, etc.)
- **Redis** (Optional): Can use external Redis or internal Docker Redis

**Features:**
- 🔄 Automatic database migrations on startup
- 🏥 Built-in health checks and monitoring
- 🔒 Production security configuration
- 📊 Redis Insight GUI for memory management
- 🚀 One-command deployment and management

See [deploy/README.md](deploy/README.md) for complete deployment guide.

## Connecting WhatsApp

1. Sign up for an account on our platform
2. Link your WhatsApp number through our secure process
3. Connect your Google, GitHub, and other accounts
4. Start interacting with your data through WhatsApp!

## Example Commands

- "What's on my calendar today?"
- "Remind me to call mom at 5pm"
- "Show me recent documents about the marketing plan"
- "Any new pull requests on my GitHub?"
- "Create a new event for tomorrow at 3pm titled Team Meeting"

## Technologies

- Next.js 15
- TypeScript
- Prisma
- WhatsApp Business API
- Google API
- GitHub API
- LangChain for NLP
- Shadcn UI for frontend

Orbia
=====

Your orbit of personal productivity. All your digital life, in one orbit. Orbia connects your calendar, files, email, and more—so you can get things done, fast. No new apps. Just chat.
