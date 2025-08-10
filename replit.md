# Carefully - AI-Powered Care Training Platform

## Overview

Carefully is an AI-powered training platform designed for care workers to practise real-world scenarios through interactive role-play simulations. The platform provides personalised feedback to help care workers build confidence, empathy, and decision-making skills in a safe environment. Key scenarios include dementia care, safeguarding, family conflict resolution, and end-of-life conversations.

The application is built as a full-stack web platform with a React frontend and Express backend, featuring AI-driven conversation simulations, progress tracking, and skills assessment.

## User Preferences

Preferred communication style: Simple, everyday language.

## Design System

**Colour Palette:**
- Primary Purple: #907AD6 (hsl(253, 56%, 66%))
- Secondary Cyan: #7FDEFF (hsl(192, 100%, 75%))
- Dark Navy: #2C2A4A (hsl(245, 32%, 25%))
- Light Purple: #DABFFF (hsl(267, 100%, 87%))
- Medium Purple: #4F518C (hsl(244, 19%, 40%))

Updated: August 8, 2025 - Implemented custom colour palette for brand consistency.
Updated: August 9, 2025 - Converted all content to British English spelling and grammar throughout the application.

## Recent Changes

**Database Migration (August 8, 2025):**
- Migrated from MemStorage to PostgreSQL database using Neon
- Implemented DatabaseStorage class with full CRUD operations
- Added Drizzle ORM relations for users, scenarios, userScenarios, and achievements
- Successfully pushed database schema and seeded with demo data
- All database operations are fully functional and type-safe
- Converted all user-facing content to British English spelling (personalised, practise, colour, etc.)

**Micro-Interactions Enhancement (August 10, 2025):**
- Implemented comprehensive CSS animation library with 20+ custom animation classes
- Added smooth hover effects including lift, glow, bounce, wobble, and pulse animations
- Enhanced navigation with playful micro-interactions and transition effects
- Updated StatCard components with floating animations and group hover states
- Enhanced ScenarioCard with sophisticated interactive feedback and staggered animations
- Added progress bar shine effects and interactive button ripple animations
- Implemented staggered fade-in animations for improved visual hierarchy
- All components now feature smooth 300ms transitions with cubic-bezier easing
- Platform UI is now significantly more engaging and playful while maintaining professionalism

**Performance Optimisation (August 10, 2025):**
- Enhanced query client with longer cache times and optimised retry logic
- Implemented comprehensive HTTP caching with ETag support for scenarios
- Added performance utilities including debounce, throttle, and virtual scrolling
- Created optimistic update hooks for immediate UI feedback
- Built lazy loading components and hooks for improved initial load times
- Added GPU-accelerated animations and reduced motion support
- Implemented data preloading and prefetching strategies
- Enhanced server responses with compression and proper cache headers
- Created performance monitoring and measurement tools

**Authentication System Completion (August 10, 2025):**
- Resolved OAuth callback session persistence issues
- Fixed session cookie configuration with proper path and domain settings
- Enhanced session debugging and logging for OAuth flow tracking
- Implemented explicit session saving during OAuth callback process
- Updated session middleware configuration for development environment
- Authentication flow now completes successfully: login → OAuth → callback → dashboard redirect
- Session cookies persist correctly between OAuth callback and frontend requests

**Smart Loading Animations (August 10, 2025):**
- Implemented comprehensive SmartLoading component with 6 contextual types
- Added intelligent loading states for AI thinking, scenario loading, feedback analysis, data sync, content loading, and voice processing
- Enhanced feedback display with staggered animations, hover effects, and skill breakdowns
- Created specialized loading components: AIThinkingLoader, ScenarioLoadingSpinner, FeedbackLoadingIndicator
- Improved voice recognition with animated microphone indicators
- Added contextual loading tips and rotating messages for user engagement
- Implemented skeleton loading components for dashboard and profile pages
- Enhanced user experience with meaningful visual feedback during wait times

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
- **PostgreSQL Storage**: Production-ready DatabaseStorage implementation with Drizzle ORM
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
- **Scenario Engine**: Dynamic scenario generation with personalised difficulty adjustment

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