# PriceWise - Complete Local Setup Guide

This guide will help you set up and run the PriceWise Amazon Price Tracker on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git**
- **MongoDB** (local installation) OR **MongoDB Atlas** account (cloud)

## Quick Setup (Automated)

For Linux/macOS users, we provide an automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

For Windows users, use Git Bash or WSL to run the script, or follow the manual setup below.

## Manual Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd PriceWise
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### Step 3: Set Up Environment Variables

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Open `.env` and configure the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# BrightData Proxy Configuration (for web scraping)
BRIGHT_DATA_USERNAME=your_brightdata_username
BRIGHT_DATA_PASSWORD=your_brightdata_password

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Optional: Hugging Face Token (if using AI features)
HF_TOKEN=your_huggingface_token
```

### Step 4: Configure Required Services

#### A. MongoDB Setup

**Option 1: MongoDB Atlas (Cloud - Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<username>`, `<password>`, and `<database>` in your `.env` file

**Option 2: Local MongoDB**

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Linux/macOS
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```
3. Use local connection string in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pricewise
   ```

#### B. BrightData Proxy Setup

1. Sign up at [BrightData](https://brightdata.com/)
2. Create a new proxy zone (Unblocker recommended)
3. Copy your username and password
4. Add them to your `.env` file

**Note**: BrightData offers a free trial. This is required for scraping Amazon without getting blocked.

#### C. Email Configuration (Gmail)

1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Google Account → Security
   - Select "2-Step Verification"
   - Scroll to "App passwords"
   - Generate a new app password
4. Use the generated password in `.env` as `EMAIL_PASSWORD`

**Alternative Email Providers**:
- Outlook: Use your regular password
- SendGrid/Mailgun: Use their SMTP credentials

### Step 5: Verify Configuration

Create a test script to verify your setup:

```bash
node -e "require('dotenv').config(); console.log('MongoDB:', process.env.MONGODB_URI ? '✓' : '✗'); console.log('BrightData:', process.env.BRIGHT_DATA_USERNAME ? '✓' : '✗'); console.log('Email:', process.env.EMAIL_USER ? '✓' : '✗');"
```

### Step 6: Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### Step 7: Test the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Paste an Amazon product URL (e.g., `https://www.amazon.com/dp/B08N5WRWNW`)
3. Click "Track" to start tracking the product
4. Check your email for a welcome notification

## Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Verify MongoDB is running
- Check your connection string in `.env`
- Ensure network access is allowed in MongoDB Atlas

**2. Scraping Fails**
```
Error: Request failed with status code 503
```
**Solution**:
- Verify BrightData credentials
- Check your BrightData account has active credits
- Ensure proxy zone is configured correctly

**3. Email Not Sending**
```
Error: Invalid login
```
**Solution**:
- Use App Password for Gmail (not regular password)
- Enable "Less secure app access" for other providers
- Verify EMAIL_USER and EMAIL_PASSWORD are correct

**4. Port Already in Use**
```
Error: Port 3000 is already in use
```
**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

**5. Module Not Found Errors**
```
Error: Cannot find module 'xyz'
```
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `BRIGHT_DATA_USERNAME` | Yes | BrightData proxy username | `brd-customer-xxxxx-zone-unblocker` |
| `BRIGHT_DATA_PASSWORD` | Yes | BrightData proxy password | `xxxxxxxxxx` |
| `EMAIL_USER` | Yes | Email address for notifications | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Yes | Email password or app password | `your-app-password` |
| `HF_TOKEN` | No | Hugging Face API token | `hf_xxxxxxxxxxxxx` |

## Project Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build optimized production bundle
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint to check code quality
```

## Testing the Cron Job

The cron job automatically updates prices for all tracked products. To test manually:

1. Add a product to track
2. Visit: `http://localhost:3000/api/cron`
3. Check the response and your email for notifications

## Database Schema

The application uses MongoDB with the following collections:

- **products**: Stores product details and price history
- **users**: Stores user email subscriptions (implicit)

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Use App Passwords** - Don't use your main email password
3. **Rotate credentials** - Change passwords periodically
4. **Limit MongoDB access** - Use IP whitelist in MongoDB Atlas
5. **Use environment-specific configs** - Different credentials for dev/prod

## Next Steps

- Read [README.md](README.md) for feature overview
- Check [SECURITY.md](SECURITY.md) for security guidelines
- Review [SCRAPING_OPTIMIZATION.md](SCRAPING_OPTIMIZATION.md) for scraping details

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the error logs in your terminal
3. Verify all environment variables are set correctly
4. Ensure all services (MongoDB, BrightData) are active

## System Requirements

- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for dependencies
- **Internet**: Required for MongoDB Atlas and BrightData

## Development Tips

1. **Hot Reload**: Changes to code automatically refresh the browser
2. **API Testing**: Use tools like Postman or Thunder Client
3. **Database GUI**: Use MongoDB Compass to view your data
4. **Logs**: Check terminal for detailed error messages

---

**Happy Tracking! 🚀**
