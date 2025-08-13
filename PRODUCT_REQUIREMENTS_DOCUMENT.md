# Carefully - Product Requirements Document (PRD)

**Version:** 2.0  
**Last Updated:** January 2025  
**Document Owner:** Product Team  

## Executive Summary

Carefully is an advanced AI-powered care training platform that delivers immersive, personalised learning experiences through interactive roleplay scenarios and intelligent skill development tools. The platform transforms traditional care training from passive, one-size-fits-all approaches to dynamic, scenario-based simulations that build confidence, empathy, and decision-making skills in real-world care situations.

### Core Value Proposition
- **Human-centred skills training** that transforms care quality through personalised, bite-sized simulations
- **Multi-role support** for Care Workers, Recruiters, L&D Managers, and Super Administrators
- **AI-driven feedback system** using OpenAI GPT-4o for real-time conversation analysis and improvement suggestions
- **Comprehensive assessment tools** for both training and recruitment purposes

---

## Product Overview

### Vision Statement
To close the care skills gap by providing every care worker with confident, competent, and compassionate training through AI-powered simulations that mirror real-world scenarios.

### Mission Statement
Carefully delivers bite-sized, feedback-rich skills simulations that help care teams communicate better, think faster, and provide more confident, compassionate care — without leaving the rota.

### Target Audience

#### Primary Users
1. **Care Workers** - Front-line staff requiring practical skills training
2. **Recruiters** - HR professionals assessing candidate readiness and cultural fit
3. **L&D Managers** - Training coordinators managing organisational learning programs
4. **Super Administrators** - System administrators with full platform access

#### Target Markets
- **Care Groups & Providers** - Multi-site operators with CQC audit pressure
- **Local Authorities & ICS** - Training at scale for diverse workforces
- **Recruitment Agencies** - Behavioural assessments for day-one readiness

---

## Core Features & Functionality

### 1. AI-Powered Training Simulations

#### 1.1 Interactive Roleplay Scenarios
- **Real-time AI conversations** with virtual residents, relatives, and colleagues
- **Scenario categories:** Dementia care, safeguarding, family conflict resolution, end-of-life conversations
- **Adaptive difficulty** that adjusts based on user performance and experience level
- **Context-aware AI responses** that maintain scenario consistency and realism

#### 1.2 Scenario Library
- **Pre-built scenarios** covering essential care situations
- **Difficulty levels:** Beginner, Intermediate, Advanced, Adaptive
- **Estimated completion time:** 5-60 minutes per scenario
- **Learning objectives** clearly defined for each scenario
- **Cultural context support** for diverse care environments
- **Visual aids and non-verbal cues** integration

#### 1.3 Intelligent Feedback System
- **Real-time analysis** of empathy, tone, clarity, and decision-making
- **AI-generated feedback** using OpenAI GPT-4o
- **Alternative response suggestions** for improvement
- **Contextual hints** during conversations
- **Performance scoring** on 0-100 scale with detailed breakdown

### 2. Multi-Role User System

#### 2.1 Care Worker Features
- **Personalised dashboard** with progress tracking and recommendations
- **Skill level monitoring** across multiple competencies
- **Achievement system** with badges and streaks
- **Training preferences** customisation (duration, difficulty, focus areas)
- **Emotional state tracking** (confidence, stress, empathy, resilience)
- **Reflection prompts** for deeper learning integration

#### 2.2 Recruiter Features
- **Candidate management system** with comprehensive profiles
- **Assessment monitoring** with progress tracking and results viewing
- **Skills analysis dashboard** showing competency gaps and strengths
- **Recruitment funnel tracking** from application to hire
- **Behavioural assessment tools** using scenario-based evaluations
- **Assessment reminders** and candidate communication tools
- **Recruiter-specific profile** with company and personal information

#### 2.3 L&D Manager Features
- **Team performance analytics** with individual and group insights
- **Learning path management** for structured skill development
- **Organisational metrics** and progress reporting
- **Curriculum customisation** based on organisational needs
- **Benchmark comparisons** across teams and time periods
- **Training compliance tracking** aligned with CQC requirements

#### 2.4 Super Administrator Features
- **User management** with role assignment and permissions
- **Role switching capabilities** for testing different user experiences
- **System-wide analytics** and performance monitoring
- **Content management** for scenarios and learning materials
- **Platform configuration** and customisation tools

### 3. Comprehensive Onboarding System

#### 3.1 Role-Specific Onboarding Flows
- **Care Worker Onboarding:** Experience assessment, learning goals, training preferences
- **Recruiter Onboarding:** Company details, recruitment preferences, hiring goals
- **L&D Manager Onboarding:** Organisation setup, training responsibilities, success metrics

#### 3.2 Profile Completion System
- **Progressive disclosure** of features based on profile completion
- **Guided setup process** with clear progress indicators
- **Personalisation options** for interface and content preferences

### 4. Advanced Analytics & Progress Tracking

#### 4.1 Individual Progress Tracking
- **Skill progression charts** with visual progress indicators
- **Completion statistics** (scenarios completed, time spent, streak tracking)
- **Performance trends** over time with improvement insights
- **Achievement unlocks** based on milestones and competencies

#### 4.2 Organisational Analytics
- **Team performance dashboards** with filterable metrics
- **Skills gap analysis** identifying training needs
- **Training ROI metrics** showing improvement outcomes
- **Compliance reporting** for regulatory requirements

### 5. Community & Social Features

#### 5.1 Discussion Forums
- **Category-based discussions** (General, Scenario Help, Wellbeing, Professional Development)
- **Peer support system** for shared experiences and advice
- **Expert moderation** for quality content and guidance
- **Topic creation and management** with voting and engagement metrics

#### 5.2 Emotional Support Tools
- **Wellbeing check-ins** integrated with training sessions
- **Stress and confidence tracking** with trend analysis
- **Mental health resources** and self-care guidance
- **Peer connection features** for professional support networks

### 6. Assessment & Certification System

#### 6.1 Competency-Based Assessments
- **Scenario-based evaluations** measuring real-world readiness
- **Skills certification** upon completion of learning paths
- **Evidence generation** for regulatory compliance (CQC alignment)
- **Portfolio building** for career development

#### 6.2 Recruitment Assessment Tools
- **Pre-employment screening** using behavioural scenarios
- **Cultural fit assessment** measuring values alignment
- **Skills gap identification** for targeted training recommendations
- **Performance prediction** based on assessment outcomes

---

## Technical Architecture

### Frontend Technology Stack
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with shadcn/ui component library
- **State Management:** TanStack React Query for server state
- **Routing:** Wouter for lightweight client-side routing
- **Build Tool:** Vite for optimised development and production builds
- **Authentication:** Replit OpenID Connect integration

### Backend Technology Stack
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript for type safety
- **Database:** PostgreSQL with Drizzle ORM
- **AI Integration:** OpenAI GPT-4o API for conversational AI
- **Session Management:** Express sessions with PostgreSQL store
- **API Architecture:** RESTful endpoints with full type safety

### Database Schema
- **Users Table:** Profile information, role assignments, preferences, progress tracking
- **Scenarios Table:** Training content, difficulty levels, learning objectives
- **User Scenarios Table:** Individual progress tracking and completion data
- **Achievements Table:** Gamification system with badges and milestones
- **Reactions Table:** Feedback and engagement tracking
- **Emotional States Table:** Wellbeing monitoring over time
- **Forum Tables:** Community discussion and support features

### AI & Machine Learning
- **Conversational AI:** OpenAI GPT-4o for realistic scenario interactions
- **Feedback Analysis:** Automated assessment of communication quality
- **Personalisation Engine:** Adaptive content recommendation based on performance
- **Natural Language Processing:** Response analysis for empathy and clarity scoring

### Security & Compliance
- **Authentication:** Secure OpenID Connect with session management
- **Data Protection:** GDPR-compliant data handling and storage
- **Role-Based Access Control:** Granular permissions by user role
- **Audit Trails:** Complete logging for compliance and debugging

---

## User Experience & Design

### Design System
- **Color Palette:** Primary Purple (#907AD6), Secondary Cyan (#7FDEFF), Dark Navy (#2C2A4A)
- **Typography:** Inter font family for readability and accessibility
- **Component Library:** Consistent shadcn/ui components with custom theming
- **Responsive Design:** Mobile-first approach with progressive enhancement

### User Interface Principles
- **Clarity:** Clean, uncluttered interfaces focused on task completion
- **Accessibility:** WCAG compliant with keyboard navigation and screen reader support
- **Performance:** Fast loading with optimised images and lazy loading
- **Progressive Disclosure:** Information revealed based on user needs and context

### Mobile Experience
- **PWA Ready:** Installable web application with offline capabilities
- **Touch Optimised:** Large touch targets and gesture-friendly interactions
- **Mobile Navigation:** Collapsible menus and thumb-friendly layouts
- **Performance:** Optimised for various device capabilities and network conditions

---

## Integration Requirements

### Authentication Integration
- **Replit OpenID Connect:** Seamless single sign-on experience
- **Multi-domain Support:** Flexible deployment across different domains
- **Session Management:** Secure, scalable session handling with automatic renewal

### Third-Party Services
- **OpenAI API:** GPT-4o integration for conversational AI and feedback analysis
- **Database Service:** Neon PostgreSQL for scalable, managed database hosting
- **File Storage:** Cloud-based asset management for images and media content

### API Specifications
- **RESTful Design:** Standard HTTP methods with JSON payloads
- **Type Safety:** Full TypeScript types shared between frontend and backend
- **Error Handling:** Comprehensive error responses with user-friendly messages
- **Caching Strategy:** HTTP caching with ETag support for performance optimisation

---

## Performance & Scalability

### Performance Targets
- **Page Load Time:** Under 2 seconds for initial page load
- **Time to Interactive:** Under 3 seconds for full interactivity
- **API Response Time:** Under 500ms for standard requests
- **AI Response Time:** Under 5 seconds for conversational AI responses

### Scalability Considerations
- **Database Optimisation:** Indexed queries and efficient data structures
- **Caching Strategy:** Multi-level caching for frequently accessed data
- **Load Balancing:** Horizontal scaling capability for increased user load
- **Resource Optimisation:** Image compression and lazy loading for performance

### Monitoring & Analytics
- **Performance Monitoring:** Real-time application performance tracking
- **Error Tracking:** Comprehensive error logging and alerting
- **User Analytics:** Behaviour tracking for product improvement insights
- **System Health:** Infrastructure monitoring and alerting

---

## Security & Privacy

### Data Protection
- **GDPR Compliance:** User data rights and privacy controls
- **Data Encryption:** At-rest and in-transit encryption for sensitive information
- **Data Retention:** Configurable policies for data lifecycle management
- **Backup & Recovery:** Regular backups with disaster recovery procedures

### Security Measures
- **Input Validation:** Comprehensive validation of all user inputs
- **SQL Injection Prevention:** Parameterised queries and ORM protection
- **Cross-Site Scripting (XSS) Protection:** Content Security Policy and sanitisation
- **Authentication Security:** Secure token handling and session management

### Privacy Controls
- **User Consent:** Clear consent mechanisms for data collection
- **Data Portability:** Export capabilities for user data
- **Right to Deletion:** Complete data removal upon user request
- **Transparency:** Clear privacy policy and data usage explanations

---

## Quality Assurance & Testing

### Testing Strategy
- **Unit Testing:** Component-level testing for individual functions
- **Integration Testing:** API endpoint and database interaction testing
- **End-to-End Testing:** Complete user journey validation
- **Performance Testing:** Load testing and stress testing for scalability

### Quality Metrics
- **Code Coverage:** Minimum 80% code coverage for critical paths
- **Bug Tracking:** Systematic issue tracking and resolution
- **User Acceptance Testing:** Regular feedback collection and validation
- **Accessibility Testing:** WCAG compliance verification

### Continuous Integration
- **Automated Testing:** Test suite execution on code changes
- **Code Quality Checks:** Linting and formatting validation
- **Security Scanning:** Automated vulnerability detection
- **Performance Regression Testing:** Performance impact monitoring

---

## Deployment & DevOps

### Deployment Strategy
- **Replit Platform:** Native deployment on Replit infrastructure
- **Environment Management:** Separate development, staging, and production environments
- **Database Migrations:** Automated schema updates with rollback capabilities
- **Asset Management:** Optimised asset delivery with CDN integration

### Monitoring & Maintenance
- **Application Monitoring:** Real-time performance and error tracking
- **Database Monitoring:** Query performance and resource utilisation
- **User Feedback Integration:** Continuous improvement based on user input
- **Regular Updates:** Scheduled maintenance and feature releases

---

## Success Metrics & KPIs

### User Engagement Metrics
- **Daily Active Users:** Platform engagement and retention tracking
- **Session Duration:** Average time spent in training sessions
- **Scenario Completion Rates:** Success rates for different training modules
- **Feature Adoption:** Usage rates for different platform features

### Learning Effectiveness Metrics
- **Skill Improvement:** Measurable progress in competency assessments
- **Confidence Scores:** Self-reported confidence levels over time
- **Knowledge Retention:** Long-term retention of training content
- **Real-World Application:** Transfer of skills to actual care situations

### Business Impact Metrics
- **Customer Satisfaction:** Net Promoter Score and user satisfaction surveys
- **Training ROI:** Cost savings and efficiency improvements
- **Compliance Achievement:** Regulatory requirement fulfillment rates
- **User Growth:** Platform adoption and expansion metrics

---

## Future Roadmap & Enhancements

### Short-Term Enhancements (3-6 months)
- **Mobile App Development:** Native iOS and Android applications
- **Advanced Analytics:** Enhanced reporting and dashboard customisation
- **Content Expansion:** Additional scenario categories and cultural contexts
- **Integration APIs:** Third-party LMS and HR system integrations

### Medium-Term Features (6-12 months)
- **Virtual Reality Integration:** Immersive VR training experiences
- **Advanced AI Tutoring:** Personalised AI mentoring and coaching
- **Multi-Language Support:** Localisation for international markets
- **Advanced Certification:** Industry-recognised certification programs

### Long-Term Vision (12+ months)
- **Predictive Analytics:** AI-powered predictive modeling for training needs
- **Augmented Reality Features:** AR-enhanced practical training scenarios
- **Global Marketplace:** Content marketplace for user-generated scenarios
- **Enterprise Integration Suite:** Complete workforce development platform

---

## Conclusion

Carefully represents a significant advancement in care worker training, combining cutting-edge AI technology with proven educational methodologies to deliver meaningful, measurable improvements in care quality. The platform's comprehensive feature set, robust technical architecture, and focus on real-world application position it as a leader in the digital transformation of care training.

Through its multi-role support system, advanced analytics, and personalised learning experiences, Carefully addresses the critical skills gap in the care sector while providing measurable value to organisations and individual users alike. The platform's commitment to accessibility, security, and continuous improvement ensures long-term viability and user satisfaction.

---

**Document History**
- v1.0 - Initial release (November 2024)
- v2.0 - Comprehensive update with multi-role functionality and recruiter system (January 2025)

**Contributors**
- Product Team
- Engineering Team
- User Research Team
- Quality Assurance Team