# CodeMarket - Code Project Marketplace

A full-stack web application that serves as a marketplace for buying and selling verified code projects. Built with React, Node.js, TypeScript, and PostgreSQL.

## Features

### Core Functionality
- **User Authentication**: Session-based authentication with role-based access (buyer, seller, both)
- **Project Management**: Upload, verify, and manage code projects with file handling
- **Payment Processing**: Secure payment system with Stripe integration
- **Search & Discovery**: Browse projects with filtering by category, price, rating
- **Reviews & Ratings**: Community-driven project quality assessment
- **Messaging System**: Direct communication between buyers and sellers
- **Dashboard**: Separate interfaces for buyers and sellers to manage their activities

### Technical Features
- **Automatic Verification**: Projects are verified before listing (mock implementation)
- **File Upload**: Handle ZIP files for code and images/videos for previews
- **Real-time Updates**: Live data with React Query for optimal UX
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation across frontend and backend

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **Tailwind CSS** + **shadcn/ui** for styling
- **Radix UI** for accessible components
- **Vite** for build tooling

### Backend
- **Node.js** with **Express.js**
- **TypeScript** with ES modules
- **Passport.js** for authentication
- **Multer** for file uploads
- **Session-based** authentication

### Database & ORM
- **PostgreSQL** (Neon serverless compatible)
- **Drizzle ORM** with TypeScript support
- **Session storage** in PostgreSQL

### Payment & External Services
- **Stripe** for payment processing
- **File storage** (local, easily extensible to cloud)

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── auth.ts            # Authentication setup
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema with Drizzle
└── uploads/               # File upload directory
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd code-marketplace
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create environment variables for:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with sk_)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key (starts with pk_)
- `SESSION_SECRET` - Random string for session encryption

4. **Database Setup**
```bash
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at http://localhost:5000

### Sample Data
The project includes sample data with:
- 3 demo users (john@example.com, sarah@example.com, mike@example.com)
- 6 sample projects across different categories
- Reviews and purchase history
- Password for all demo accounts: `password`

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Projects
- `GET /api/projects` - List projects (with filtering)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Upload new project (authenticated)

### Purchases
- `POST /api/create-payment-intent` - Create payment intent
- `POST /api/confirm-purchase` - Confirm purchase
- `GET /api/purchases` - User's purchases
- `GET /api/purchases/:projectId` - Check if project purchased

### Reviews & Communication
- `POST /api/reviews` - Add project review
- `GET /api/reviews/:projectId` - Get project reviews
- `POST /api/messages` - Send message to seller
- `GET /api/messages/:projectId` - Get project messages
- `POST /api/reports` - Report unresponsive seller

### Dashboard
- `GET /api/dashboard/seller` - Seller dashboard data
- `GET /api/dashboard/buyer` - Buyer dashboard data

## Key Components

### Authentication System
- Session-based authentication with Passport.js
- Secure password hashing with scrypt
- Role-based access control
- Protected routes and middleware

### File Upload System
- Multer middleware for handling multipart uploads
- Support for ZIP files (code) and images/videos (previews)
- File validation and size limits
- Secure file serving

### Payment Flow
1. User initiates purchase
2. Stripe payment intent created
3. Frontend handles payment with Stripe Elements
4. Backend confirms payment and creates purchase record
5. User gains access to download code

### Database Schema
- `users` - User accounts with roles
- `projects` - Code projects with metadata
- `purchases` - Purchase transactions
- `reviews` - Project reviews and ratings
- `messages` - Buyer-seller communication
- `reports` - Dispute reporting system

## Deployment

### Production Checklist
- [ ] Set up production PostgreSQL database
- [ ] Configure Stripe live keys
- [ ] Set secure session secret
- [ ] Configure file storage (AWS S3, etc.)
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Set up monitoring and logging

### Build for Production
```bash
npm run build
npm start
```

## Development

### Adding New Features
1. Define database schema in `shared/schema.ts`
2. Update storage interface in `server/storage.ts`
3. Add API routes in `server/routes.ts`
4. Create frontend components in `client/src/`
5. Run database migration: `npm run db:push`

### Code Verification System
The current implementation includes a mock verification system. To implement real verification:

1. Create verification service that:
   - Extracts uploaded ZIP files
   - Runs the code in a sandboxed environment
   - Compares output with submitted preview
   - Updates project verification status

2. Consider using Docker containers for safe code execution
3. Implement timeout and resource limits
4. Add support for different programming languages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation in `/docs`
- Review sample code and API examples
- Examine the database schema in `shared/schema.ts`

---

Built with ❤️ using modern web technologies