# Carefully - AI-Powered Care Training Platform

## Overview

Carefully is an AI-powered training platform designed for care workers to practice real-world scenarios through interactive role-play simulations. The platform provides personalized feedback to help care workers build confidence, empathy, and decision-making skills in a safe environment. Key scenarios include dementia care, safeguarding, family conflict resolution, and end-of-life conversations.

The application is built as a full-stack web platform with a React frontend and Express backend, featuring AI-driven conversation simulations, progress tracking, and skills assessment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Component-based UI using functional components and hooks
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Node.js with Express**: RESTful API server handling authentication, scenarios, and user data
- **TypeScript**: Full type safety across the entire backend codebase
- **In-Memory Storage**: Demo implementation using MemStorage class for rapid prototyping
- **AI Integration**: OpenAI GPT-4o integration for conversational AI and feedback analysis
- **Session Management**: Express sessions with PostgreSQL session store ready for production

### Database Design
- **Drizzle ORM**: Type-safe database queries and migrations
- **PostgreSQL**: Production database with tables for users, scenarios, user progress, and achievements
- **Schema**: Shared type definitions between frontend and backend using Drizzle-Zod integration

Key entities:
- **Users**: Profile, role, skill levels, and progress tracking
- **Scenarios**: Training scenarios with context, objectives, and difficulty levels
- **UserScenarios**: Progress tracking for individual scenario attempts
- **Achievements**: Gamification system for user engagement

### AI and Training Features
- **Conversational AI**: Real-time role-play with AI characters using OpenAI's GPT-4o
- **Feedback System**: Automated analysis of empathy, tone, clarity, and decision-making
- **Progress Tracking**: Skill-based progression with visual progress indicators
- **Scenario Engine**: Dynamic scenario generation with personalized difficulty adjustment

### Development and Deployment
- **Development**: Hot-reload development server with Vite integration
- **Build Process**: Separate client and server builds with ESBuild for server bundling
- **Environment**: Configurable for development, staging, and production environments
- **Error Handling**: Comprehensive error boundaries and API error handling

## External Dependencies

### Core Dependencies
- **OpenAI API**: GPT-4o model for conversational AI and feedback analysis
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Radix UI**: Accessible component primitives for the design system

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Replit Integration**: Development environment optimizations and error overlays
- **ESBuild**: Fast JavaScript bundling for production builds

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Font Awesome**: Icon library for consistent iconography
- **Inter Font**: Primary typography system via Google Fonts

### Utilities
- **React Hook Form**: Form validation and management
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Type-safe CSS class composition
- **Zod**: Runtime type validation and schema definition