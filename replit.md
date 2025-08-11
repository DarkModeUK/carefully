# Carefully - AI-Powered Care Training Platform

## Overview
Carefully is an AI-powered training platform that uses interactive role-play simulations to train care workers for real-world scenarios. It provides personalised feedback to enhance confidence, empathy, and decision-making skills. The platform includes scenarios for dementia care, safeguarding, family conflict resolution, and end-of-life conversations. It is a full-stack web application with a React frontend and Express backend, featuring AI-driven conversations, progress tracking, and skills assessment.

## Recent Changes (January 2025)
- **Super Admin Functionality**: Added comprehensive super admin role with user management and role-switching capabilities for testing different user experiences
- **Recruiter System Expansion**: Built complete recruiter functionality including:
  - Comprehensive candidate management with add/edit/status tracking
  - Assessment monitoring with progress tracking and results viewing
  - Recruiter-specific profile with personal and company information
  - Enhanced recruiter dashboard with candidate pipeline analytics
- **Multi-Role Onboarding System**: Created comprehensive onboarding flows for all user roles:
  - Care Worker: Experience assessment, learning goals, and training preferences
  - Recruiter: Company details, recruitment preferences, and hiring goals
  - L&D Manager: Organization setup, training responsibilities, and success metrics
- **Database Schema Updates**: Added super admin role support, candidate management tables, and profile enhancement fields
- **Enhanced Navigation**: Implemented role-specific navigation with separate profile pages for different user types

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, utilising functional components and hooks. Styling is handled by Tailwind CSS with shadcn/ui for a consistent design system. Server state management and caching are managed by TanStack React Query, while Wouter provides lightweight client-side routing. Vite is used for fast development and optimized production builds. The UI features comprehensive CSS animations and micro-interactions for an engaging experience.

### Backend Architecture
The backend uses Node.js with Express, providing a RESTful API with full type safety via TypeScript. It integrates with OpenAI GPT-4o for conversational AI and feedback analysis. Session management is handled by Express sessions with a PostgreSQL session store.

### Database Design
Drizzle ORM is used for type-safe database queries and migrations with PostgreSQL as the production database. The schema includes tables for users, scenarios, user progress (UserScenarios), and achievements. Key entities are Users (profile, role, skill levels), Scenarios (training content, objectives, difficulty), UserScenarios (individual attempt tracking), and Achievements (gamification).

### AI and Training Features
The platform features real-time role-play with AI characters using OpenAI's GPT-4o. An automated feedback system analyses empathy, tone, clarity, and decision-making. Progress tracking is skill-based with visual indicators. The scenario engine allows for dynamic scenario generation with personalised difficulty adjustment based on user performance. AI contextual awareness ensures responses and feedback are relevant to scenario details. An advanced learning enhancement system provides real-time feedback, contextual hints, conversation analysis, and alternative response suggestions.

### User Role System
A comprehensive role-based user system supports Care Worker, Recruiter, and L&D Manager roles, with dynamic navigation and dedicated dashboards for each role. This includes candidate pipeline management, team performance analytics, and skill development tracking.

### Design System
The application uses a custom colour palette: Primary Purple (#907AD6), Secondary Cyan (#7FDEFF), Dark Navy (#2C2A4A), Light Purple (#DABFFF), and Medium Purple (#4F518C). All content consistently uses British English spelling and grammar.

### Performance and Loading
The system includes extensive performance optimisations such as query client enhancements, HTTP caching with ETag support, and various utilities (debounce, throttle, virtual scrolling). Optimistic updates, lazy loading, GPU-accelerated animations, data preloading, and server compression are implemented. Smart loading components provide contextual feedback during wait times.

## External Dependencies

### Core Dependencies
- **OpenAI API**: Utilized for GPT-4o conversational AI and feedback analysis.
- **Neon Database**: Provides serverless PostgreSQL for production data storage.
- **Radix UI**: Used for accessible component primitives in the design system.

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Font Awesome**: Icon library.
- **Inter Font**: Primary typography system.

### Utilities
- **React Hook Form**: Handles form validation and management.
- **Date-fns**: Used for date manipulation and formatting.
- **Class Variance Authority**: For type-safe CSS class composition.
- **Zod**: Provides runtime type validation and schema definition.