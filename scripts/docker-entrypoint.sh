#!/bin/sh
set -e

echo "🚀 Starting Mnemo application..."

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

# Run database migrations (optional - may have already run or may not have prisma CLI available)
echo "🔄 Running database migrations..."
if command -v npx &> /dev/null; then
    npx prisma migrate deploy || echo "⚠️  Migration failed or already applied, continuing..."
    echo "🔧 Generating Prisma client..."
    npx prisma generate || echo "⚠️  Prisma generation failed, continuing..."
else
    echo "⚠️  Prisma CLI not available, skipping migrations..."
fi

# Start the application
echo "🎉 Starting the application..."
exec "$@" 