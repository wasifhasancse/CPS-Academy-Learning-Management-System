# CPS Academy LMS Implementation Plan

This file tracks the status of the CPS Academy Learning Management System (LMS) implementation.
Execute one phase at a time. Mark items as `[x]` when completed and verified before proceeding to the next.

---

## Phase 1: Database & Foundation

Goal: configure PostgreSQL for Strapi v5 backend, initialize Next.js 16 frontend foundation, and establish environment contracts.

- [x] **Phase 1.1 — Backend PostgreSQL Configuration (Neon)**
  - [x] Install `pg` driver in `learning-management-system-back-end`
  - [x] Configure `config/database.js` to connect to Neon PostgreSQL via `DATABASE_URL` (with SSL enabled)
  - [x] Update `.env.example` and local `.env` with `DATABASE_CLIENT=postgres` and `DATABASE_URL`
  - **Test**: Strapi database layer configured with Neon PostgreSQL connection string and SSL support. (Passed)

- [x] **Phase 1.2 — Frontend Foundation, Design Tokens & Reusable UI**
  - [x] Import Google Font Roboto (`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`) and set as global font family
  - [x] Configure brand design tokens in `src/app/globals.css` with Tailwind CSS v4 `@theme inline`:
    - Primary: `#213C51`
    - Secondary: `#6594B1`
    - Highlight / Accent: `#DDAED3`
    - Neutral / Surface: `#EEEEEE`
  - [x] Strictly enforce flat solid color styling: **NO gradients** anywhere in the project
  - [x] Build atomic, reusable UI component library in `src/components/ui/` (`Button`, `Input`, `Card`, `Badge`, `Modal`, `Table`, `Dropdown`, `ProgressBar`, `Skeleton`) to avoid duplicate component types
  - [x] Create semantic layout shell (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) with sidebar and navigation
  - **Test**: Frontend builds with `next build` without styling or compilation errors. (Passed)

- [x] **Phase 1.3 — Shared Contracts & API Client**
  - [x] Define shared TypeScript / JSDoc interfaces for User, Course, Module, Lesson, Quiz, Question, Enrollment, and Transaction
  - [x] Create central API client utility with token injection and error handling in frontend
  - **Test**: API client utility correctly formats requests and parses error responses. (Passed)

---

## Phase 2: Authentication & Multi-Role RBAC

Goal: implement secure authentication and establish 4-tier role-based access control (Student, Instructor, Content Manager, Admin).

- [x] **Phase 2.1 — Strapi Roles & Permissions & Google OAuth Setup**
  - [x] Define and configure the 4 core roles in Strapi: `Admin`, `Content Manager`, `Instructor`, `Student`
  - [x] Implement the strict Permission Matrix:
    - **Admin**: Manage users & assign roles (Yes), create/edit/delete any course (Yes), manage all lessons (Yes), create quizzes (Yes), view all student progress (Yes), manage blogs (Yes), enroll in course (No), take quizzes (No)
    - **Content Manager**: Manage users (No), create/edit/delete any course (Yes), manage all lessons (Yes), create quizzes (Yes), view all student progress (Yes), manage blogs (Yes), enroll in course (No), take quizzes (No)
    - **Instructor**: Manage users (No), create/edit/delete own courses only (Yes), manage own lessons only (Yes), create own quizzes only (Yes), view own enrolled student progress only (Yes), manage blogs (No), enroll in course (No), take quizzes (No)
    - **Student**: Manage users (No), create courses/lessons/quizzes (No), view own progress only (Yes), manage blogs (No), enroll in courses (Yes), take quizzes (Yes)
  - [x] Configure Google OAuth Provider in Strapi Users & Permissions (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, callback redirect to frontend)
  - [x] Add custom policies/middlewares in Strapi to restrict resources strictly by role and record ownership
  - **Test**: Database migrations applied to Neon PostgreSQL, user and role tables provisioned, and bootstrap role seeding configured. (Passed)

- [x] **Phase 2.2 — Frontend Authentication Flow (Email/Password & Google OAuth)**
  - [x] Implement Unauthenticated Auth pages at `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`
  - [x] Implement "Continue with Google" button triggering Strapi OAuth (`${STRAPI_URL}/api/connect/google`)
  - [x] Create Google OAuth callback page at `/auth/callback/google` to receive JWT and user profile from Strapi
  - [x] Securely store JWT tokens in localStorage and dynamic session context
  - [x] Create `useAuth` hook and authentication context for current user state and role
  - [x] On successful login/registration/OAuth, automatically redirect user to `/dashboard/[role]` (`/dashboard/student`, `/dashboard/instructor`, `/dashboard/manager`, `/dashboard/admin`)
  - **Test**: User can register/log in via email/password or Google OAuth, receive JWT session, view role dashboard, and log out cleanly. (Passed)

- [x] **Phase 2.3 — Route Protection & Middleware**
  - [x] Add Next.js middleware to guard all `/dashboard/*` routes
  - [x] Redirect unauthenticated users visiting `/dashboard/*` to `/auth/login?redirect=[targetUrl]`
  - [x] For authenticated users visiting root `/dashboard`, automatically redirect to their respective role dashboard:
    - Student -> `/dashboard/student`
    - Instructor -> `/dashboard/instructor`
    - Content Manager -> `/dashboard/manager`
    - Admin -> `/dashboard/admin`
  - [x] Enforce strict role boundary: `RoleGuard` blocks cross-role access and displays a friendly 403 Forbidden screen
  - **Test**: Direct navigation to `/dashboard/admin` or `/dashboard/instructor` as a Student enforces role guard. (Passed)

---

## Phase 3: LMS Content Schemas & Relational Data Model

Goal: create Strapi v5 content-types for complete course lifecycle, learning progress, quizzes, and transactions.

- [x] **Phase 3.1 — Course & Curriculum Schemas**
  - [x] Create `Category` content-type (name, slug, description, icon)
  - [x] Create `Course` content-type (title, slug, description, thumbnail, price, difficulty, publishedStatus, instructor relation, category relation)
  - [x] Create `Module` content-type (title, order, course relation)
  - [x] Create `Lesson` content-type (title, slug, videoUrl [YouTube], duration, content/notes, resources, order, isFreePreview, module relation)
  - **Test**: Strapi server validates schemas and creates relational tables in Neon PostgreSQL. (Passed)

- [x] **Phase 3.2 — Enrollment & Progress Schemas**
  - [x] Create `Enrollment` content-type (student relation, course relation, enrolledAt, completionStatus, progressPercentage)
  - [x] Create `Progress` content-type (student relation, lesson relation, course relation, isCompleted, completedAt)
  - **Test**: Relational schemas link students to courses and lesson completion state. (Passed)

- [x] **Phase 3.3 — Quiz & Assessment Schemas**
  - [x] Create `Quiz` content-type (title, slug, timeLimitMinutes, passingScore, course relation, questions relation)
  - [x] Create `Question` content-type (quiz relation, prompt, options JSON, correctAnswer index, explanation, points)
  - [x] Create `QuizAttempt` content-type (student relation, quiz relation, score, passed, submittedAnswers, submittedAt)
  - [x] Create `BlogPost` content-type (title, slug, excerpt, content, coverImageUrl, category relation, author relation)
  - **Test**: Strapi schemas validate required fields and link questions to quizzes and attempts to students. (Passed)

---

## Phase 4: Course Management & Moderation Engine

Goal: build authoring workflows for Instructors and review/publishing pipelines for Content Managers and Admins.

- [ ] **Phase 4.1 — Instructor Course Authoring Workspace**
  - [ ] Create Instructor Course List & Creation wizard (`/dashboard/instructor/courses`)
  - [ ] Implement Module & Lesson organizer (drag-and-drop or order indexing)
  - [ ] Add YouTube video URL validator and preview component
  - [ ] Add resource attachment uploader for lesson materials
  - **Test**: Instructor can create a draft course with structured modules and lessons.

- [ ] **Phase 4.2 — Content Manager Moderation Queue**
  - [ ] Create Content Manager review dashboard (`/dashboard/manager/review`)
  - [ ] Build course inspection view showing full curriculum, video validity, and metadata
  - [ ] Implement Approve, Request Changes, and Reject actions with feedback notes
  - [ ] Add Category and Tag management interface (`/dashboard/manager/categories`)
  - **Test**: Content Manager can approve a course, which transitions `publishedStatus` to `published`.

- [ ] **Phase 4.3 — Admin Course Oversight**
  - [ ] Provide global course management table with override capabilities (`/dashboard/admin/courses`)
  - [ ] Add ability to feature courses on the homepage or archive obsolete courses
  - **Test**: Admin can update status or reassign instructor for any course.

---

## Phase 5: Student Learning Interface & Course Player

Goal: deliver a high-quality learning experience with course discovery, YouTube video player, progress tracking, and resource access.

- [ ] **Phase 5.1 — Course Catalog & Discovery**
  - [ ] Build public Course Browse page with search, category filtering, difficulty filters, and price filters (`/courses`)
  - [ ] Implement Course Detail page with curriculum preview, instructor info, prerequisites, and enrollment CTA (`/courses/[slug]`)
  - [ ] Display free preview lessons for unauthenticated/unenrolled visitors
  - **Test**: Catalog filters accurately narrow down courses and detail pages render full syllabus.

- [ ] **Phase 5.2 — Interactive Course Player**
  - [ ] Create dedicated Learning Player view (`/learn/[courseSlug]`)
  - [ ] Implement responsive YouTube player integration with custom controls, timestamps, and autoplay next lesson
  - [ ] Add collapsible curriculum sidebar with completed checkmarks and current lesson highlight
  - [ ] Add Lesson Notes and Downloadable Resources tab below the video
  - **Test**: Enrolled student can stream lessons and navigate between curriculum items.

- [ ] **Phase 5.3 — Progress Tracking Engine**
  - [ ] Implement "Mark as Complete" action on lesson finish
  - [ ] Calculate and display overall course progress percentage in real time
  - [ ] Show course completion status and prompt certificate generation when all lessons and quizzes are completed
  - **Test**: Completing a lesson updates progress bar and persists state across page reloads.

---

## Phase 6: Quiz System & Assessment Engine

Goal: build a secure, interactive quiz system for student testing and instructor assessment.

- [ ] **Phase 6.1 — Instructor Quiz Builder**
  - [ ] Create Quiz Creation interface (`/dashboard/instructor/quizzes/new` and `/dashboard/instructor/courses/[id]/quizzes`)
  - [ ] Build Question Editor supporting Multiple Choice and True/False questions
  - [ ] Set correct answers, score weight per question, time limit, and passing score
  - **Test**: Instructor can create and save a quiz with multiple questions.

- [ ] **Phase 6.2 — Secure Student Quiz Runner**
  - [ ] Create Student Quiz landing view with instructions, duration, and passing requirements (`/dashboard/student/quizzes/[id]`)
  - [ ] Build active Quiz Runner interface with countdown timer, question pagination/nav, and review mode
  - [ ] Ensure backend API masks correct answers from the student payload during quiz taking
  - **Test**: Student can take a quiz within the time limit without answers exposed in network traffic.

- [ ] **Phase 6.3 — Server-Side Grading & Scorecards**
  - [ ] Implement backend grading service in Strapi that compares submitted answers with stored correct answers
  - [ ] Compute score, percentage, pass/fail status, and persist `QuizAttempt` record
  - [ ] Render detailed Quiz Result page with score breakdown, review of answers, and explanations (`/dashboard/student/quizzes/[id]/result`)
  - **Test**: Submitting quiz computes correct grade and updates student quiz history.

- [ ] **Phase 6.4 — Instructor Quiz Analytics**
  - [ ] Create Instructor Quiz Analytics dashboard (`/dashboard/instructor/quizzes/[id]/analytics`)
  - [ ] Display pass rate, average score, attempt count, and question difficulty breakdown
  - **Test**: Instructor can inspect class-wide quiz statistics.

---

## Phase 7: Stripe Checkout, Payments & Automated Enrollment

Goal: integrate Stripe checkout for secure course purchases with webhook-verified enrollment automation.

- [ ] **Phase 7.1 — Stripe Checkout Integration**
  - [ ] Implement backend endpoint `/api/orders/create-checkout-session` in Strapi
  - [ ] Create Stripe Checkout session with course metadata, price, customer email, and success/cancel URLs
  - [ ] Build frontend Checkout button and payment loading state
  - **Test**: Clicking "Buy Course" redirects to Stripe Checkout with correct course price and metadata.

- [ ] **Phase 7.2 — Stripe Webhook & Automated Enrollment**
  - [ ] Create Stripe webhook handler `/api/orders/webhook` in Strapi with signature verification (`stripe.webhooks.constructEvent`)
  - [ ] On `checkout.session.completed`, update `Order` status to `paid` and automatically create `Enrollment` record transactionally
  - [ ] Implement idempotency checks to prevent duplicate enrollments on webhook retries
  - **Test**: Test Stripe webhook event transitions order to paid and unlocks course for student.

- [ ] **Phase 7.3 — Student Purchase History & Invoices**
  - [ ] Build Student Purchase History page (`/dashboard/student/orders`)
  - [ ] Display order receipt details, payment method summary, transaction date, and invoice link
  - **Test**: Student can view past purchases and access enrolled courses directly.

---

## Phase 8: Instructor & Content Manager Dashboards

Goal: provide dedicated workspaces for instructors and content curators.

- [ ] **Phase 8.1 — Instructor Dashboard**
  - [ ] Dashboard overview (`/dashboard/instructor`): total courses, total enrolled students, total earnings, active quizzes
  - [ ] Student Roster view (`/dashboard/instructor/students`): list students enrolled in instructor's courses with progress indicators
  - [ ] Quick actions to add lessons or create new quizzes
  - **Test**: Instructor dashboard displays accurate aggregated statistics for assigned courses.

- [ ] **Phase 8.2 — Content Manager Dashboard**
  - [ ] Dashboard overview (`/dashboard/manager`): courses pending review, newly published courses, category distribution
  - [ ] Bulk category and tag assignment tools
  - [ ] Content quality checklist and curriculum health monitoring
  - **Test**: Content Manager can navigate pending items and manage course taxonomies efficiently.

---

## Phase 9: Admin Control Center

Goal: build a comprehensive administration portal for managing users, roles, platform finances, and system settings.

- [ ] **Phase 9.1 — User & Role Management**
  - [ ] Admin User Management table (`/dashboard/admin/users`) with search, role filtering, and status badges
  - [ ] Role switcher action: promote/demote users between Student, Instructor, Content Manager, and Admin
  - [ ] Account activation / deactivation controls
  - **Test**: Admin can update a user's role and the user receives updated permissions on next request.

- [ ] **Phase 9.2 — Financial & Transaction Oversight**
  - [ ] Transaction log table (`/dashboard/admin/transactions`) showing all Stripe orders, amounts, customer details, and status
  - [ ] Platform revenue metrics, refund inspection, and monthly sales summaries
  - **Test**: Admin can search and filter transactions by date, course, or student.

- [ ] **Phase 9.3 — System Health & Audit Logging**
  - [ ] System audit trail (`/dashboard/admin/audit`) recording critical actions (role changes, course approvals, refunds)
  - [ ] Stripe webhook health monitor
  - **Test**: System events are logged with actor, timestamp, and action description.

---

## Phase 10: Notification & Communication Engine

Goal: keep users informed of key lifecycle events via in-app alerts and transactional email notifications.

- [ ] **Phase 10.1 — In-App Notifications**
  - [ ] Implement in-app notification bell with unread badge in header
  - [ ] Emit notifications for: Course Purchase Confirmed, Quiz Result Ready, Course Approved / Needs Changes, New Student Enrolled
  - [ ] Add "Mark as read" and "Mark all as read" actions
  - **Test**: User receives real-time/polled notification when a milestone occurs.

- [ ] **Phase 10.2 — Transactional Email Notifications**
  - [ ] Setup Nodemailer / SMTP transport in Strapi backend
  - [ ] Create email templates for: Purchase Receipt, Course Enrollment Confirmation, Quiz Scorecard, Course Approval Notice
  - **Test**: Test email dispatch sends formatted HTML email on course purchase.

---

## Phase 11: End-to-End Testing, Security & Optimization

Goal: validate security, reliability, performance, and responsive design across all roles.

- [ ] **Phase 11.1 — Security & RBAC Invariant Testing**
  - [ ] Test student cannot access unauthorized video URLs or instructor dashboard routes (`/dashboard/instructor/*`)
  - [ ] Test quiz answers are never returned in pre-submission API responses
  - [ ] Test order creation rejects client-modified amounts
  - **Test**: Automated security probes verify all role boundaries hold.

- [ ] **Phase 11.2 — Full Journey E2E Validation**
  - [ ] Test Student journey: `/auth/register` → Browse → Buy Course (Stripe) → Watch Lessons → Complete Quiz → View Certificate
  - [ ] Test Instructor journey: Login → `/dashboard/instructor` → Create Course → Upload YouTube Lessons → Add Quiz → Review Submissions
  - [ ] Test Content Manager journey: Login → `/dashboard/manager` → Review Draft Course → Approve → Publish to Catalog
  - [ ] Test Admin journey: Login → `/dashboard/admin` → Manage Roles → Inspect Transactions → Audit Platform Health
  - **Test**: All user journeys complete without errors across desktop and mobile screen sizes.
