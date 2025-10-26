# Deployment Guide

## Environment Variables Required

Add these environment variables to your deployment platform:

```
BRIGHT_DATA_USERNAME=your-brightdata-username
BRIGHT_DATA_PASSWORD=your-brightdata-password
MONGODB_URI=your-mongodb-connection-string
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-email-password
HF_TOKEN=your-huggingface-token
```

## Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Add environment variables:
   - Go to Project Settings → Environment Variables
   - Add all variables listed above
   - Apply to Production, Preview, and Development
4. Deploy

## Netlify Deployment

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Import your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables:
   - Go to Site Settings → Environment Variables
   - Add all variables listed above
5. Install Next.js plugin:
   - Go to Plugins → Search for "@netlify/plugin-nextjs"
   - Install the plugin
6. Deploy

## Troubleshooting

### Vercel Issues
- If scraping fails: Check BrightData credentials
- If build fails: Check MongoDB connection string
- Function timeout: Already set to 30s in vercel.json

### Netlify Issues
- If UI not visible: Ensure @netlify/plugin-nextjs is installed
- If images not loading: Check next.config.js has unoptimized: true
- Build errors: Check all environment variables are set

### Common Issues
- **Email not working**: Email is optional, app will work without it
- **Scraping timeout**: BrightData proxy may be slow, wait 15-20 seconds
- **MongoDB connection**: Ensure IP whitelist includes 0.0.0.0/0 in MongoDB Atlas

## Getting Your Credentials

1. **BrightData**: Sign up at [brightdata.com](https://brightdata.com) and get proxy credentials
2. **MongoDB**: Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Email**: Use Outlook/Hotmail email credentials
4. **HuggingFace**: Get API token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
