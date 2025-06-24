# CodeMarket - Getting Started

## What You Have

A complete, production-ready code marketplace with:

- **Authentication System**: Login/register with session management
- **Project Upload**: File handling for code projects and preview media
- **Payment Processing**: Stripe integration for secure transactions
- **User Dashboards**: Separate interfaces for buyers and sellers
- **Search & Discovery**: Browse projects by category, technology, rating
- **Reviews & Messaging**: Community features and buyer-seller communication
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations

## Quick Setup (5 minutes)

### 1. Extract and Install
```bash
tar -xzf codemarket-complete.tar.gz
cd codemarket-complete
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in:

```bash
# Required: Database
DATABASE_URL=postgresql://username:password@localhost:5432/codemarket

# Required: Authentication
SESSION_SECRET=your-random-secret-key-here

# Optional: For payments (use dummy keys for testing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 3. Database Setup
```bash
# Push schema to database
npm run db:push
```

### 4. Start Application
```bash
npm run dev
```

Visit http://localhost:5000

## Demo Accounts

Login with these pre-loaded accounts:

- **Seller**: john@example.com / password
- **Buyer**: sarah@example.com / password  
- **Both roles**: mike@example.com / password

## Project Features

### For Sellers
- Upload projects with code files and preview media
- Set pricing and categorization
- View sales analytics in dashboard
- Respond to buyer messages
- Track download counts and reviews

### For Buyers
- Browse marketplace with filtering
- Purchase projects securely
- Download code after purchase
- Leave reviews and ratings
- Message sellers directly

### Sample Data Included
- 6 diverse code projects (React, mobile, AI, games, blockchain, web)
- Reviews and ratings
- Purchase history
- User accounts across different roles

## Database Options

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb codemarket
```

### Option 2: Cloud Database (Recommended)
1. Sign up at [Neon.tech](https://neon.tech) (free tier available)
2. Create new database
3. Copy connection string to `DATABASE_URL`

## Stripe Setup (Optional)

For real payments:
1. Create account at [Stripe.com](https://stripe.com)
2. Get API keys from dashboard
3. Add to environment variables

For testing: The app works with dummy Stripe integration.

## File Structure

```
codemarket-complete/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route components
│   │   ├── hooks/       # React hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── auth.ts         # Authentication
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Database operations
│   └── db.ts           # Database connection
├── shared/             # Shared schemas
├── uploads/            # File storage
└── package.json        # Dependencies
```

## Production Deployment

### Build
```bash
npm run build
npm start
```

### Environment
- Use production database
- Set `NODE_ENV=production`
- Use live Stripe keys
- Configure HTTPS
- Set secure session secret

## Support

- **README.md**: Full technical documentation
- **DEPLOYMENT.md**: Production deployment guide
- **Database Schema**: See `shared/schema.ts`
- **API Reference**: Check `server/routes.ts`

## Next Steps

1. Customize branding and styling
2. Add email notifications
3. Implement code verification
4. Add file storage (AWS S3)
5. Set up monitoring and analytics

Your marketplace is ready to use!