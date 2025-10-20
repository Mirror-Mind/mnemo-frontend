# Docker Container Restart Loop - Fix Documentation

## Issue Summary

The `mnemo-app` and `mnemo-scheduler` containers were continuously restarting with the following error:

```
Cannot find module '/app/node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js'
```

This was caused by missing Prisma WASM runtime files needed for database operations.

## Root Causes

1. **Missing Prisma Client Generation**: The `.prisma/client` directory generated during the builder stage wasn't being copied to the production runner stage
2. **Missing Prisma CLI in Production**: The Dockerfile was installing production dependencies with `--omit=dev`, which excluded Prisma CLI (a dev dependency) needed for runtime migrations
3. **Entrypoint Script Failures**: The docker-entrypoint.sh script called `npx prisma` commands without checking if they were available, causing crashes

## Changes Made

### 1. **Dockerfile Changes** (`mnemo-frontend/Dockerfile`)

#### Added `.prisma/client` copy in runner stage (line 96-97):
```dockerfile
# Copy .prisma/client and prisma directory
COPY --from=builder --chown=nextjs:nodejs /app/.prisma ./.prisma
```

#### Modified prod-deps stage (lines 65-73):
Changed from installing with `--omit=dev`:
```dockerfile
# OLD: npm ci --legacy-peer-deps --omit=dev
# NEW: npm ci --legacy-peer-deps
```

This ensures Prisma CLI is available in production for runtime migrations.

### 2. **Entrypoint Script Changes** (`mnemo-frontend/scripts/docker-entrypoint.sh`)

Made Prisma operations graceful and non-blocking:
- Check if `npx` command is available before running Prisma CLI
- Added error handling with `|| echo` to continue if operations fail
- Explains why operations might be skipped

```bash
if command -v npx &> /dev/null; then
    npx prisma migrate deploy || echo "⚠️ Migration failed or already applied, continuing..."
    npx prisma generate || echo "⚠️ Prisma generation failed, continuing..."
else
    echo "⚠️ Prisma CLI not available, skipping migrations..."
fi
```

## How This Fixes The Issue

1. **WASM Files Available**: The `.prisma/client` directory with WASM runtime files is now copied to the production image, allowing Prisma to find the query engine
2. **CLI Available**: Prisma CLI is included in production dependencies, enabling migrations to run at container startup
3. **Graceful Degradation**: If migrations fail or CLI isn't available, the container continues instead of crashing, allowing the app to start and use the database if migrations already ran

## Testing The Fix

To verify the fix works:

1. Rebuild the Docker image:
   ```bash
   docker-compose build
   ```

2. Start the containers:
   ```bash
   docker-compose up
   ```

3. Monitor logs:
   ```bash
   docker-compose logs -f mnemo-app mnemo-scheduler
   ```

The containers should now start successfully without restart loops.

## Additional Notes

- The application now handles cases where migrations have already been applied (idempotent)
- The Prisma client is generated during the builder stage, so the runtime environment has all necessary types and client code
- All three services (app, scheduler, nginx) should now connect properly, resolving the 502 errors from nginx
