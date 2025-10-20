# Dockerfile for Mnemo Production Deployment
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Set environment variables for build - use .env if available, otherwise use dummy values
# These will be overridden at runtime
ENV OPENAI_API_KEY=${OPENAI_API_KEY:-dummy-build-key-dummy-build-key-dummy-build-key}
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY:-dummy-build-key-dummy-build-key-dummy-build-key}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET:-dummy-build-secret-for-next-build-only-needs-to-be-long-enough}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL:-http://localhost:3000}
ENV DATABASE_URL=${DATABASE_URL:-postgresql://dummy:dummy@localhost:5432/dummy}
ENV USE_REDIS_MEM0=${USE_REDIS_MEM0:-false}
ENV NODE_ENV=production
ENV REDIS_URL=${REDIS_URL:-redis://localhost:6379}
ENV MEM0_COLLECTION_NAME=${MEM0_COLLECTION_NAME:-mnemo-memories}

# Google OAuth (build time)
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-dummy-google-client-id}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-dummy-google-client-secret}
ENV GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI:-http://localhost:3000/api/auth/callback/google}
ENV BETTERAUTH_URL=${BETTERAUTH_URL:-http://localhost:3000}

# GitHub OAuth (build time)
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-dummy-github-client-id}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-dummy-github-client-secret}

# WhatsApp Business API (build time)
ENV META_WHATSAPP_PHONE_NUMBER_ID=${META_WHATSAPP_PHONE_NUMBER_ID:-dummy-phone-id}
ENV META_WHATSAPP_ACCESS_TOKEN=${META_WHATSAPP_ACCESS_TOKEN:-dummy-access-token}
ENV META_WEBHOOK_VERIFY_TOKEN=${META_WEBHOOK_VERIFY_TOKEN:-dummy-verify-token}
ENV META_APP_SECRET=${META_APP_SECRET:-dummy-app-secret}
ENV WHATSAPP_BUSINESS_PHONE_NUMBER_ID=${WHATSAPP_BUSINESS_PHONE_NUMBER_ID:-dummy-phone-id}
ENV WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN:-dummy-access-token}
ENV WHATSAPP_VERIFY_TOKEN=${WHATSAPP_VERIFY_TOKEN:-dummy-verify-token}

# Build the application
RUN npm run build

# Production dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Install all dependencies - we need prisma CLI for runtime migrations
RUN \
  if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Generate Prisma client in prod-deps stage
COPY prisma ./prisma
RUN npx prisma generate

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder from the project as this is not included in standalone build
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy production node_modules
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy .prisma/client from prod-deps (where it was generated)
COPY --from=prod-deps --chown=nextjs:nodejs /app/.prisma ./.prisma

# Also keep the backup copy from builder for build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.prisma ./.prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy scheduler files
COPY --from=builder --chown=nextjs:nodejs /app/scheduler ./scheduler

# Copy startup script and make it executable
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
RUN chmod +x ./scripts/docker-entrypoint.sh

# Install netcat for health checks
USER root
RUN apk add --no-cache netcat-openbsd wget
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use entrypoint script for startup
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["node", "server.js"] 