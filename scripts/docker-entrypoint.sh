#!/bin/sh
set -e

echo "🚀 Starting Orbia application..."

# Function to check if external PostgreSQL is reachable
check_postgres() {
    echo "⏳ Checking external PostgreSQL connection..."
    # Extract host and port from DATABASE_URL
    if [ -n "$DATABASE_URL" ]; then
        echo "✅ External PostgreSQL configured via DATABASE_URL"
    else
        echo "❌ DATABASE_URL not configured!"
        exit 1
    fi
}

# Function to wait for Redis (internal or external)
wait_for_redis() {
    # Check if using internal Redis
    if [[ "$REDIS_URL" == *"redis:6379"* ]] || [[ -z "$REDIS_URL" ]]; then
        echo "⏳ Waiting for internal Redis to be ready..."
        while ! nc -z redis 6379; do
            sleep 1
        done
        echo "✅ Internal Redis is ready!"
    else
        echo "✅ Using external Redis: $REDIS_URL"
    fi
}

# Check external services
check_postgres
wait_for_redis

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case it's needed)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🎉 Starting the application..."
exec "$@" 