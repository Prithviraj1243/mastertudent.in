# Overview

MasterStudent is a two-sided marketplace SaaS platform that connects top-performing students (toppers) who upload study notes with paying subscribers who can browse and download these notes. The platform includes a comprehensive review system where internal reviewers approve content before publication, subscription-based access control, and analytics for content creators.

The application is built as a full-stack TypeScript project with a React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and includes Stripe payment processing, file upload capabilities, and a role-based permission system supporting students, toppers, reviewers, and admins.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Form Handling**: React Hook Form with Zod validation
- **Payment Integration**: Stripe React components for subscription handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle with PostgreSQL as the database
- **Authentication**: Replit's OpenID Connect (OIDC) integration with Passport.js
- **Session Management**: Express sessions stored in PostgreSQL with connect-pg-simple
- **File Handling**: Multer middleware for file uploads with type validation
- **API Structure**: RESTful endpoints organized by feature domains

## Database Design
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle Kit for migrations and schema definitions
- **Key Entities**: Users, topper profiles, notes, review tasks, subscriptions, transactions, feedback, and analytics tables
- **Enums**: Role-based permissions, note statuses, review statuses, subscription states
- **Relationships**: Proper foreign key constraints and relational design for data integrity

## Authentication & Authorization
- **Authentication Provider**: Replit OIDC with automatic user provisioning
- **Session Storage**: Secure HTTP-only cookies with PostgreSQL session store
- **Role-Based Access Control**: Four distinct user roles (student, topper, reviewer, admin) with different permission levels
- **Route Protection**: Middleware-based authentication checks and role validation

## File Management
- **Upload Handling**: Multer with configurable file size limits (50MB) and type restrictions
- **Allowed File Types**: PDF, DOC, DOCX, JPG, JPEG, PNG for study materials
- **Storage Strategy**: Local filesystem storage with potential for cloud migration
- **File Validation**: Server-side type checking and security measures

## Payment Processing
- **Payment Provider**: Stripe with both one-time and subscription billing
- **Subscription Plans**: Monthly (₹59) and yearly (₹499) pricing tiers
- **Payment Security**: Secure tokenization and webhook handling
- **Customer Management**: Integrated Stripe customer records with user accounts

## Content Moderation
- **Review Workflow**: Multi-stage approval process for uploaded content
- **Quality Control**: Manual review by designated reviewers before publication
- **Status Tracking**: Comprehensive state management for content lifecycle
- **Feedback System**: Bidirectional communication between reviewers and uploaders

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Authentication**: Replit OIDC service for user identity management
- **Session Storage**: PostgreSQL-backed session management

## Payment Services
- **Stripe**: Complete payment processing including subscriptions, customer management, and webhook handling
- **Billing**: Automated recurring billing and payment failure handling

## Development Tools
- **Vite**: Frontend build tooling and development server
- **TypeScript**: Static type checking across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Drizzle Kit**: Database schema management and migrations

## UI Components & Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management with validation

## File Processing
- **Multer**: Multipart form data handling for file uploads
- **File Type Validation**: Server-side MIME type checking and extension validation