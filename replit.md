# CodeMarket - Code Project Marketplace

## Overview

CodeMarket is a full-stack web application that serves as a marketplace for buying and selling verified code projects. The platform allows developers to upload, sell, and purchase code projects with automated verification systems and secure payment processing through Stripe integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL sessions with connect-pg-simple
- **File Uploads**: Multer middleware for handling file uploads
- **Development**: TSX for TypeScript execution in development

### Database & ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with full TypeScript support
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for database migrations and schema management

## Key Components

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with Node.js crypto (scrypt)
- Role-based access control (buyer, seller, both)
- Protected routes with authentication middleware

### Project Management
- Multi-role user system supporting buyers, sellers, and hybrid users
- Project categorization and technology tagging
- Automated verification system for uploaded projects
- File upload handling for code files and preview images
- Rating and review system for projects

### Payment Integration
- Stripe integration for secure payment processing
- Customer management and payment intent handling
- Purchase tracking and confirmation system
- Stripe webhooks for payment status updates

### User Interface
- Responsive design with mobile-first approach
- Modern component architecture with Radix UI
- Toast notifications for user feedback
- Modal dialogs for complex interactions
- Dashboard interface for both buyers and sellers

## Data Flow

### User Registration & Authentication
1. User submits registration form with role selection
2. Password is hashed using scrypt with salt
3. User session is created and stored in PostgreSQL
4. Stripe customer ID is generated and associated with user

### Project Upload Process
1. Seller uploads project files through dashboard
2. Form validation using Zod schemas
3. Files are processed and stored via Multer
4. Project metadata is saved to database
5. Verification process is initiated (currently manual)

### Purchase Workflow
1. Buyer initiates purchase from project details page
2. Stripe payment intent is created
3. Payment form is presented using Stripe Elements
4. Payment confirmation triggers purchase record creation
5. Buyer gains access to download project files

### Dashboard Analytics
1. Seller dashboard displays project performance metrics
2. Buyer dashboard shows purchase history
3. Real-time data fetching using React Query
4. Optimistic updates for improved UX

## External Dependencies

### Payment Processing
- **Stripe**: Payment processing, customer management, and webhooks
- **@stripe/stripe-js**: Client-side Stripe integration
- **@stripe/react-stripe-js**: React components for Stripe Elements

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSockets**: Real-time connection support for Neon

### File Storage
- **Multer**: File upload middleware
- **Local Storage**: Currently storing files locally (can be extended to cloud storage)

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development Environment
- Replit-based development with hot module replacement
- Vite dev server with Express API integration
- PostgreSQL database provisioned through Replit
- Environment variable management through Replit secrets

### Production Build
- Vite builds optimized client bundle
- ESBuild compiles server code for Node.js
- Static assets served through Express
- Session storage uses PostgreSQL connection pooling

### Environment Configuration
- Development: HMR enabled, debug logging, local file storage
- Production: Optimized builds, secure cookies, error handling
- Database: Connection pooling with Neon serverless

### Scaling Considerations
- Stateless server design for horizontal scaling
- Session storage in PostgreSQL for multi-instance support
- File storage ready for CDN integration
- Database connection pooling for high concurrency

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
- June 24, 2025. Complete marketplace implementation with:
  * Full authentication system with session-based auth
  * Project upload and management with file handling
  * Payment processing with dummy Stripe integration
  * User dashboards for buyers and sellers
  * Project browsing, searching, and filtering
  * Review and messaging systems
  * Database schema with PostgreSQL and Drizzle ORM
  * Sample data with 6 projects across different categories
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```