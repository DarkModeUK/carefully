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

**Smart Loading Animations (August 10, 2025):**
- Implemented comprehensive SmartLoading component with 6 contextual types
- Added intelligent loading states for AI thinking, scenario loading, feedback analysis, data sync, content loading, and voice processing
- Enhanced feedback display with staggered animations, hover effects, and skill breakdowns
- Created specialized loading components: AIThinkingLoader, ScenarioLoadingSpinner, FeedbackLoadingIndicator
- Improved voice recognition with animated microphone indicators
- Added contextual loading tips and rotating messages for user engagement
- Implemented skeleton loading components for dashboard and profile pages
- Enhanced user experience with meaningful visual feedback during wait times

**Progress Page Data Accuracy Enhancement (August 10, 2025):**
- Completely overhauled score calculation algorithm to eliminate random or fallback scores
- Implemented authentic user-performance-based scoring using AI feedback metrics (empathy, communication, professionalism, problem-solving)
- Added engagement-based scoring for scenarios without AI feedback, considering response count and time investment
- Removed fallback score calculations from results page - now only displays authentic completion data
- Enhanced individual skills breakdown showing actual performance metrics from user interactions
- Improved feedback messaging to reflect real user engagement patterns and performance levels
- Score calculation now considers response quality, engagement level, and time appropriateness
- Minimum scores properly reflect minimal engagement rather than artificial score inflation

**Comprehensive Scenario Content Enhancement (August 10, 2025):**
- Enhanced all basic scenarios with detailed patient backgrounds including personal history, family context, and specific circumstances
- Expanded learning objectives to provide comprehensive skill development goals (5+ objectives per scenario)
- Added realistic character details including age, profession, family relationships, and relevant medical/social history
- Improved scenario contexts to include specific situational challenges and emotional complexity
- Updated End of Life, Family Conflict Resolution, and Medication Refusal scenarios with rich, authentic narratives
- All scenarios now provide detailed context for meaningful role-play and skill development
- Enhanced educational value through comprehensive learning outcomes aligned with care worker competency requirements



**Multi-Role User System Implementation (August 10, 2025):**
- Implemented comprehensive role-based user system supporting Care Worker, Recruiter, and L&D Manager roles
- Created role-specific navigation system that dynamically shows relevant menu items based on user role
- Built dedicated Recruiter Dashboard with candidate pipeline management, filtering, and assessment tracking
- Developed L&D Manager Dashboard featuring team performance analytics, skill development tracking, and wellbeing insights
- Enhanced user schema with role enumeration supporting care_worker, recruiter, and ld_manager roles
- Implemented role-specific API endpoints for candidate management, team analytics, and performance tracking
- Added role-based routing system with dedicated dashboard routes for each user type
- Created comprehensive analytics and reporting features for management roles
- Integrated real user data from database for candidate and team member displays
- Built responsive design system that adapts to different role requirements and workflows
- Added role switcher component for easy testing between different user experiences
- Removed redundant reflection dashboard as functionality overlapped with progress page

**Full Recruiter Feature Implementation (August 10, 2025):**
- Built comprehensive recruiter dashboard with three main tabs: Candidate Pipeline, Assessment Center, and Analytics
- Implemented advanced candidate management with search, filtering by status/role/skill, and detailed candidate cards
- Created assessment center with completion rates, average time tracking, pass rate monitoring, and live assessment queue
- Added analytics dashboard with skills performance analysis, recruitment funnel visualization, and key performance metrics
- Built candidate detail modal with skill breakdowns, progress tracking, and action buttons for advancement/rejection
- Enhanced recruiter API endpoints with full CRUD operations for candidate management and status updates
- Implemented comprehensive recruitment analytics including skills analysis and funnel tracking
- Added export functionality and candidate creation capabilities for complete recruitment workflow
- Integrated visual progress bars, status badges, and performance indicators throughout the interface
- Created responsive design with hover animations and smooth transitions for enhanced user experience

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