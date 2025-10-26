# PriceWise Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- BrightData account (for web scraping)
- Outlook/Hotmail email account

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:

   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string

   # BrightData Proxy Configuration
   BRIGHT_DATA_USERNAME=your_brightdata_username
   BRIGHT_DATA_PASSWORD=your_brightdata_password

   # Email Configuration
   EMAIL_USER=your_email@outlook.com
   EMAIL_PASSWORD=your_email_password

   # Application Configuration
   NODE_ENV=development
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Notes

- **NEVER** commit your `.env` file to version control
- Rotate credentials immediately if exposed
- Use strong, unique passwords for all services
- Enable 2FA on all accounts where possible

## MongoDB Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Copy the connection string to `MONGODB_URI`

## BrightData Setup

1. Sign up at [BrightData](https://brightdata.com/)
2. Create an unblocker zone
3. Copy your username and password to the `.env` file

## Email Setup

1. Use an Outlook/Hotmail account
2. Enable "Less secure app access" or use App Password
3. Add credentials to `.env` file

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure all environment variables are set in your hosting platform
3. Run `npm run build` to create an optimized production build
4. Deploy to Vercel, AWS, or your preferred platform

## Troubleshooting

- **MongoDB Connection Error**: Check your connection string and IP whitelist
- **Scraping Fails**: Verify BrightData credentials and account status
- **Email Not Sending**: Check email credentials and app password settings
