# Cron Job Setup Guide

## Overview

The application now includes an automatic cron job that runs every hour to update product prices and send notifications.

## How It Works

### Development Mode

1. **Automatic Start**: Cron job starts automatically when you run `npm run dev`
2. **Schedule**: Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
3. **Action**: Calls `/api/cron` endpoint to update all product prices

### Cron Schedule

```
0 * * * *  = Every hour at minute 0
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```env
HF_TOKEN=your-huggingface-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Start Development Server

```bash
npm run dev
```

You should see in console:
```
Cron jobs started - running every hour
```

### 3. Manual Trigger

To manually trigger price updates:

```bash
curl http://localhost:3000/api/cron
```

Or visit in browser: `http://localhost:3000/api/cron`

## Production Deployment

### Option 1: Vercel Cron (Recommended)

Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 * * * *"
  }]
}
```

### Option 2: External Cron Service

Use services like:
- **Cron-job.org**: Free, reliable
- **EasyCron**: Feature-rich
- **AWS EventBridge**: For AWS deployments

Configure to call: `https://your-domain.com/api/cron`

### Option 3: Server-Side Cron

If deploying to VPS/dedicated server, the built-in node-cron will work automatically.

## What Happens During Cron Run

1. **Fetch All Products**: Gets all tracked products from database
2. **Scrape Prices**: Scrapes current price from Amazon for each product
3. **Update Database**: Adds new price to history, updates stats
4. **Send Notifications**: Emails users if:
   - Price drops to lowest ever
   - Product back in stock
   - Discount exceeds 40%

## Monitoring

### Check Cron Status

Visit: `http://localhost:3000/api/cron-init`

Response:
```json
{
  "message": "Cron jobs already running"
}
```

### View Logs

Check console for:
```
Running price update cron job...
Cron job completed: { message: "Scraping completed", ... }
```

## Customizing Schedule

Edit `lib/cron/scheduler.ts`:

```typescript
// Every 30 minutes
cron.schedule('*/30 * * * *', async () => { ... });

// Every 6 hours
cron.schedule('0 */6 * * *', async () => { ... });

// Daily at 9 AM
cron.schedule('0 9 * * *', async () => { ... });

// Every Monday at 10 AM
cron.schedule('0 10 * * 1', async () => { ... });
```

## Troubleshooting

### Cron Not Running

1. Check console for "Cron jobs started" message
2. Verify `NODE_ENV=development` in `.env`
3. Restart development server

### Cron Runs But Fails

1. Check `/api/cron` endpoint works manually
2. Verify database connection
3. Check BrightData credentials
4. Review console error logs

### Production Issues

1. Ensure `NEXT_PUBLIC_APP_URL` is set correctly
2. Use external cron service for serverless deployments
3. Check deployment platform supports long-running processes

## Best Practices

1. **Rate Limiting**: Don't run too frequently (respect Amazon's rate limits)
2. **Error Handling**: Monitor failed scrapes
3. **Logging**: Keep logs of cron runs
4. **Notifications**: Set up alerts for cron failures
5. **Backup**: Have manual trigger option

## Performance Considerations

- Each cron run processes ALL products
- Large product lists may take time
- Consider batching for 100+ products
- Monitor API rate limits

## Security

- Cron endpoint is public (consider adding authentication)
- Use environment variables for sensitive data
- Monitor for abuse/excessive calls
- Consider IP whitelisting for production
