# CodeMarket Deployment Guide

## Quick Start

1. **Extract the project files**
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (copy from .env.example)
4. **Set up PostgreSQL database**
5. **Push database schema**: `npm run db:push`
6. **Start the application**: `npm run dev`

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/codemarket

# Authentication
SESSION_SECRET=your-secret-key

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

## Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb codemarket`
3. Update DATABASE_URL in environment

### Option 2: Cloud Database (Recommended)
1. Sign up for Neon (https://neon.tech) or similar
2. Create new database
3. Copy connection string to DATABASE_URL

## Stripe Setup

1. Create Stripe account at https://stripe.com
2. Go to https://dashboard.stripe.com/apikeys
3. Copy publishable key (pk_test_...) to VITE_STRIPE_PUBLIC_KEY
4. Copy secret key (sk_test_...) to STRIPE_SECRET_KEY

## Sample Data

The project includes sample data:
- Demo users: john@example.com, sarah@example.com, mike@example.com
- Password for all: `password`
- 6 sample projects with reviews and purchases

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Considerations
- Use live Stripe keys in production
- Set NODE_ENV=production
- Use secure session secret
- Enable HTTPS/SSL
- Configure file storage (AWS S3, etc.)

## File Structure

```
code-marketplace/
├── client/           # React frontend
├── server/           # Express backend  
├── shared/           # Shared schemas
├── package.json      # Dependencies
├── README.md         # Full documentation
└── .env.example      # Environment template
```

## Support

Check README.md for detailed documentation and API reference.