# Production Debugging Guide - WhatsApp Bot Timeouts

## Issue Summary
WhatsApp messages work on localhost but timeout in production (DigitalOcean VPS) for messages requiring longer AI processing.

## Changes Made

### 1. Updated Bot Route (`app/api/bot/route.ts`)
- ✅ Replaced Next.js 15 `after()` with production-compatible background processing
- ✅ Added timeout wrapper (4 minutes) for AI processing
- ✅ Enhanced logging for debugging
- ✅ Added error reaction handling
- ✅ Set `maxDuration = 300` seconds

### 2. Docker Configuration (`docker-compose.yml`)
- ✅ Increased healthcheck timeouts
- ✅ Added Node.js optimizations:
  - `NODE_OPTIONS=--max-old-space-size=2048 --max-http-header-size=32768`
  - `UV_THREADPOOL_SIZE=16`
- ✅ Added resource limits (2GB memory, 1 CPU)

### 3. Nginx Configuration (`nginx.conf`)
- ✅ Added specific `/api/bot` location block
- ✅ Extended timeouts (15 minutes)
- ✅ Disabled proxy buffering for immediate webhook response

### 4. Vercel Configuration (`vercel.json`)
- ✅ Set 5-minute timeout for bot and agent endpoints

## Debugging Steps

### Step 1: Check Debug Endpoint
Visit: `https://your-domain.com/api/debug`

This will show:
- Node.js environment info
- Memory usage
- Background processing capabilities
- waitUntil support

### Step 2: Monitor Docker Logs
```bash
# Follow all logs
docker compose logs -f

# Just the app logs
docker compose logs -f app

# Filter for WhatsApp Bot logs
docker compose logs -f app | grep "WhatsApp Bot"
```

### Step 3: Check Container Resources
```bash
# Check container stats
docker stats orbia-app

# Check if container is hitting limits
docker compose exec app sh -c "cat /proc/meminfo | grep MemAvailable"
```

### Step 4: Test Background Processing
```bash
# Test if setImmediate is working
docker compose exec app node -e "
setImmediate(() => console.log('setImmediate works'));
setTimeout(() => console.log('setTimeout works'), 100);
console.log('Sync works');
"
```

## Potential Issues & Solutions

### Issue 1: Container Resource Limits
**Symptoms:** Processing starts but fails/times out
**Solution:** Increase memory/CPU limits in docker-compose.yml

### Issue 2: Network/DNS Resolution
**Symptoms:** External API calls (OpenAI, etc.) timeout
**Solution:** Check DNS resolution inside container:
```bash
docker compose exec app nslookup api.openai.com
```

### Issue 3: Environment Variables
**Symptoms:** API keys not working in production
**Solution:** Verify .env file is properly loaded:
```bash
docker compose exec app printenv | grep OPENAI
```

### Issue 4: Database Connection Pool
**Symptoms:** Database timeouts during processing
**Solution:** Check Prisma connection pool:
```bash
# Add to your .env
DATABASE_URL="postgresql://user:pass@host:port/db?connection_limit=20&pool_timeout=20"
```

### Issue 5: Node.js Event Loop Blocking
**Symptoms:** Processing hangs indefinitely
**Solution:** Already implemented with Promise.race timeout

## Advanced Debugging

### Enable Detailed Logging
Add to `docker-compose.yml` app environment:
```yaml
- DEBUG=*
- NODE_ENV=production
- PRISMA_CLI_QUERY_ENGINE_TYPE=binary
```

### Test WhatsApp Processing Manually
```bash
# Send a test message to your webhook
curl -X POST https://your-domain.com/api/bot \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "id": "test-123",
            "type": "text",
            "from": "1234567890",
            "text": {"body": "test message"}
          }]
        }
      }]
    }]
  }'
```

### Monitor System Resources on VPS
```bash
# CPU usage
top -p $(pgrep -f "node.*server.js")

# Memory usage
ps aux | grep node

# Disk I/O
iotop -p $(pgrep -f "node.*server.js")

# Network connections
netstat -tulpn | grep :3000
```

## Emergency Fallback

If issues persist, revert to synchronous processing for critical messages:

```typescript
// In app/api/bot/route.ts, replace background processing with:
if (messageBody.includes("urgent") || messageBody.includes("help")) {
  // Process synchronously for urgent messages
  await sendMessageReaction(message.from, message.id, "🤔");
  await processWhatsAppMessage(body);
  return NextResponse.json({ status: "processed" }, { status: 200 });
}
```

## Next Steps

1. Deploy updated configuration
2. Check `/api/debug` endpoint
3. Monitor logs for WhatsApp Bot messages
4. Test with a complex AI query
5. Report findings for further optimization

## Contact Support

If issues persist after following this guide:
1. Collect `/api/debug` output
2. Provide docker logs for a failed message
3. Include VPS specifications and load metrics 