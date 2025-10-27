# PriceWise - Amazon Price Tracker

A Next.js application that tracks Amazon product prices and notifies users when prices drop.

## Features

- 🔍 Scrape Amazon product details
- 📊 Track price history
- 📧 Email notifications for price drops
- 💾 MongoDB database storage
- 🎨 Modern UI with Tailwind CSS
- 🔒 Secure credential management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Scraping**: Axios + Cheerio + BrightData Proxy
- **Email**: Nodemailer
- **Styling**: Tailwind CSS

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PriceWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your credentials in `.env` (see SETUP.md for details)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Documentation

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [Security Policy](SECURITY.md) - Security best practices
- [Scraping Optimization](SCRAPING_OPTIMIZATION.md) - Scraping system details
- [Optimization Summary](OPTIMIZATION_SUMMARY.md) - Recent improvements

## Project Structure

```
PriceWise/
├── app/                  # Next.js app router pages
│   ├── api/             # API routes
│   ├── products/        # Product detail pages
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions
│   ├── actions/         # Server actions
│   ├── models/          # Mongoose models
│   ├── scraper/         # Web scraping logic
│   └── nodemailer/      # Email functionality
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Key Features Explained

### Price Tracking
- Scrapes product data from Amazon
- Stores price history in MongoDB
- Calculates lowest, highest, and average prices

### Email Notifications
- Welcome email when tracking starts
- Price drop alerts
- Back in stock notifications
- Threshold discount alerts

### Cron Job
- Automated price updates via `/api/cron`
- Checks all tracked products
- Sends notifications based on price changes

## Environment Variables

Required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `BRIGHT_DATA_USERNAME` - BrightData proxy username
- `BRIGHT_DATA_PASSWORD` - BrightData proxy password
- `EMAIL_USER` - Email account for sending notifications
- `EMAIL_PASSWORD` - Email account password

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Security

⚠️ **Important**: Never commit your `.env` file. All credentials should be kept secure.

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All security guidelines are followed
- Tests pass (when implemented)
- Documentation is updated

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Scraping powered by [BrightData](https://brightdata.com/)
