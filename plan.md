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
    - Primary: `#285A48` (Forest Emerald Green)
    - Secondary: `#408A71` (Sage Pine Green)
    - Highlight / Accent: `#B0E4CC` (Mint Highlight)
    - Dark / Base: `#091413` (Obsidian Forest)
    - Surface / Neutral: `#F0F7F4` (Light clean mint surface)
  - [x] Strictly enforce flat solid color styling: **NO gradients** anywhere in the project
  - [x] Build atomic, reusable UI component library in `src/components/ui/` (`Button`, `Input`, `Card`, `Badge`, `Modal`, `Table`, `Dropdown`, `ProgressBar`, `Skeleton`, `ThemeToggle`, `RoleGuard`) to avoid duplicate component types
  - [x] Create semantic layout shell (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`) with sidebar and navigation
  - **Test**: Frontend builds with `next build` without styling or compilation errors. (Passed)

- [x] **Phase 1.3 — Shared Contracts & API Client**
  - [x] Define shared TypeScript / JSDoc interfaces for User, Course, Module, Lesson, Quiz, Question, Enrollment, and Transaction
  - [x] Create central API client utility with token injection and error handling in frontend (`src/lib/api.js`)
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
  - [x] Standardize role terminology to **Instructor** across all backend controllers, auth routes, and documentation
  - [x] Configure Google OAuth Provider in Strapi Users & Permissions (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, callback redirect to frontend)
  - [x] Add custom policies/middlewares in Strapi to restrict resources strictly by role and record ownership
  - **Test**: Database migrations applied to Neon PostgreSQL, user and role tables provisioned, and bootstrap role seeding configured. (Passed)

- [x] **Phase 2.2 — Frontend Authentication Flow (Email/Password & Google OAuth)**
  - [x] Implement Unauthenticated Auth pages at `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`
  - [x] Implement "Continue with Google" button triggering Strapi OAuth (`${STRAPI_URL}/api/connect/google`)
  - [x] Create Google OAuth callback page at `/auth/callback/google` to receive JWT and user profile from Strapi
  - [x] Securely store JWT tokens in localStorage and dynamic session context
  - [x] Create `useAuth` hook and authentication context for current user state and role (`src/context/AuthContext.jsx`)
  - [x] On successful login/registration/OAuth, automatically redirect user to `/dashboard/[role]` (`/dashboard/student`, `/dashboard/instructor`, `/dashboard/manager`, `/dashboard/admin`)
  - **Test**: User can register/log in via email/password or Google OAuth, receive JWT session, view role dashboard, and log out cleanly. (Passed)

- [x] **Phase 2.3 — Route Protection & Middleware**
  - [x] Add Next.js 16 `src/proxy.js` to guard all `/dashboard/*` routes
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

## Phase 4: Public Navigation & Discovery Pages

Goal: build responsive public navigation, course catalog discovery with real-time search, blog platform, about page, and student success stories.

- [x] **Phase 4.1 — Navigation Header & Integrated Search Bar**
  - [x] Updated `Header.jsx` with standard navigation links:
    - **Home** (`/`)
    - **Courses** (`/courses`)
    - **Blog** (`/blog`)
    - **About** (`/about`)
    - **Success Story** (`/success-story`)
  - [x] Integrated center search bar with query submit redirecting to `/courses?search=<query>`
  - [x] Built mobile drawer menu supporting search and navigation
  - [x] Updated `Footer.jsx` explore links matching the new navigation routes
  - **Test**: Header renders all items cleanly across desktop and mobile screens. (Passed)

- [x] **Phase 4.2 — Course Catalog & Discovery (`/courses`)**
  - [x] Built public Course Catalog with query parameter support (`?search=...`, `useSearchParams` inside `<Suspense>`)
  - [x] Removed all mock/fixed fallback data: renders live database courses with clean animated skeleton loading state
  - [x] Added Category Filter Pills (`All Tracks`, `CP`, `DSA`, `Web Dev`, `System Design`)
  - [x] Added Difficulty dropdown (`Beginner`, `Intermediate`, `Advanced`) and Sorting (`Popularity`, `Price`, `Lesson count`)
  - [x] Rendered course cards with lesson count, quiz count, student enrollment count, and enrollment CTA
  - **Test**: Catalog loads live courses from Strapi without flashing default/mock data. (Passed)

- [x] **Phase 4.3 — Public Engineering Blog (`/blog` & `/blog/[slug]`)**
  - [x] Built public article catalog with category filtering and search
  - [x] Built single article reader with full markdown body rendering and author metadata
  - [x] Enforced zero-trust backend draft filtering (Public/Students only see published posts)
  - **Test**: Published articles viewable by public; draft articles concealed. (Passed)

- [x] **Phase 4.4 — About CPS Academy (`/about`)**
  - [x] Mission overview and 4 learning pillars (Competitive Programming Rigor, Software Engineering, Timed Assessments, Mentorship)
  - [x] Faculty and mentor profiles with bios and expertise tags
  - [x] Academy statistics counter (5,000+ students, 250k+ problem solves, 120+ regionalists)
  - **Test**: Page renders semantic layout with responsive cards. (Passed)

- [x] **Phase 4.5 — Student Success Stories (`/success-story`)**
  - [x] Showcased verified student milestones (Codeforces rating jumps, ICPC medals, FAANG placements)
  - [x] Category filtering (All Stories, Competitive Programming & ICPC, Tech Careers & FAANG)
  - [x] Alumni quotes, before-and-after rating trajectories, and verification badges
  - **Test**: Filter tabs switch story categories interactively. (Passed)

- [x] **Phase 4.6 — Standardized Course Card & ImgBB Media Upload Engine**
  - [x] Built reusable `CourseCard` component (`src/components/courses/CourseCard.jsx`) with image banner, top-right category badge, difficulty/lesson/quiz counters, borderless dynamic creator instructor attribution, tuition, and CTA
  - [x] Updated Home page (`src/app/page.js`) and Courses catalog page (`src/app/courses/page.js`) to use the unified `CourseCard` with live data fetching
  - [x] Built ImgBB upload utility (`src/lib/imgbb.js`) and `ImageUpload` component (`src/components/ui/ImageUpload.jsx`) using API key `07e805fdc8a1c6855e37aa4218e8f967`
  - [x] Integrated image upload/edit into Admin, Content Manager, and Instructor course creation & editing modals with database URL persistence (`thumbnailUrl`) and creator instructor relation linkage (`instructor: user.id`)
  - **Test**: Direct image upload to ImgBB stores image URL in Strapi and renders thumbnails on cards. (Passed)

- [x] **Phase 4.7 — Universal Public Access & Course Detail View (`/courses/[slug]`)**
  - [x] All navigation tabs (`Home`, `Courses`, `Blog`, `About`, `Success Story`) remain universally open to everyone with any role (or unauthenticated guests)
  - [x] Built single course overview page (`/courses/[slug]`) with curriculum syllabus, module lessons with preview indicators, and quiz list
  - [x] Fixed module and lesson read permissions (`api::module.module.find`, `api::module.module.findOne`) in backend bootstrap for Public and Student roles, ensuring curriculum renders consistently across student preview, instructor view, and public visitors
  - [x] Instant synchronous session hydration via cached `cps_user` in `AuthContext`, eliminating sign-in and header dashboard button loading delays
  - [x] Added spinners to authentication submit buttons and skeleton shimmers for catalog/course loading states
  - [x] Strict Role-Guarded Enrollment enforcement:
    - **Students**: Can directly enroll (`POST /api/enrollments`) or launch course player if already enrolled
    - **Guests/Unauthenticated**: Prompted to Log In or Register
    - **Admin / Content Manager / Instructor**: Access course in staff inspection mode with direct management and preview links
  - **Test**: All user roles can freely navigate navbar and explore courses, with curriculum modules rendering accurately and fast responsive auth flows. (Passed)

---

## Phase 5: Multi-Role Dashboards & Control Center

Goal: deliver complete, production-grade dashboards for Students, Instructors, Content Managers, and Admins.

- [x] **Phase 5.1 — Admin Control Center (`/dashboard/admin`)**
  - [x] Platform KPI metrics: Total Users (by role: Admins, Content Managers, Instructors, Students), Total Courses, Lessons, Quizzes, Enrollments, Blog Posts (Draft vs Published)
  - [x] **User & Role Management**: Searchable user table, role switcher modal (`Admin`, `Content Manager`, `Instructor`, `Student`), block/unblock account toggle, user deletion
  - [x] **Global Course CRUD**: Add, edit, delete any course across the entire platform
  - [x] **Curriculum Hub**: Add, edit, delete video lessons (YouTube URL, markdown notes, duration, free preview toggle), add/edit/delete MCQ quizzes and question builder
  - [x] **Blog Oversight**: Global blog post table, write new posts, edit, delete, and toggle draft/published status
  - [x] **Student Progress**: Real-time progress monitoring for enrolled students across all courses
  - [x] Backend user controller extension in Strapi (`user.find`, `user.update`, `user.destroy`, `role.find`) with admin zero-trust authorization
  - **Test**: Admin can manage users, assign roles, create courses/lessons/quizzes/blogs, and view student progress. (Passed)

- [x] **Phase 5.2 — Content Manager Dashboard (`/dashboard/manager`)**
  - [x] Platform-wide Course Library management (create, edit, delete any course)
  - [x] Platform-wide Curriculum & MCQ Hub (lessons, quizzes, questions)
  - [x] Student Progress Roster across all platform courses
  - [x] Blog Writing & Publishing Center (write, edit, publish, delete blog posts)
  - [x] Strict RBAC isolation: Content Manager cannot manage users or assign roles
  - **Test**: Content Manager can curate all content without accessing user management. (Passed)

- [x] **Phase 5.3 — Instructor Dashboard (`/dashboard/instructor`)**
  - [x] Scoped Course Management: create, edit, delete **assigned courses only**
  - [x] Scoped Curriculum Organizer: add/edit/delete lessons and MCQ quizzes for own courses
  - [x] Scoped Student Roster: monitor completion progress of students enrolled in own courses
  - [x] Strict RBAC isolation: Instructor cannot access other instructors' courses, manage users, or publish blogs
  - **Test**: Instructor can manage own courses and students while blocked from global administration. (Passed)

- [x] **Phase 5.4 — Role Invariant Enforcement & Security Guards**
  - [x] `Enrollment.create`: Enforces that only users with role `Student` can enroll in courses (Admin, Content Manager, and Instructor rejected with `403 Forbidden`)
  - [x] `QuizAttempt.create`: Enforces that only users with role `Student` can submit quiz attempts (Admin, Content Manager, and Instructor rejected with `403 Forbidden`)
  - **Test**: Backend rejects enrollment and quiz attempts from non-student roles. (Passed)

- [x] **Phase 5.5 — Pure Live Data Architecture & Student Dashboard Integration**
  - [x] Eliminated all static/mock data across the platform (`FALLBACK_BLOGS`, `FALLBACK_ARTICLE`, mock student enrollments, mock quiz scorecards)
  - [x] Connected Student Dashboard (`/dashboard/student`) to live database enrollments (`GET /api/enrollments`), quiz scorecards (`GET /api/quiz-attempts`), and platform catalog (`GET /api/courses`)
  - [x] Separated public `/courses` catalog queries from instructor dashboard scoped queries (`myCourses=true`), enabling instructors and all roles to browse all platform courses
  - **Test**: Full platform operates purely on live PostgreSQL database records with zero mock fixtures. (Passed)

---

## Phase 6: Student Learning Interface & Course Player

Goal: deliver an interactive video course player, curriculum navigation, lesson completion tracking, and student scorecards.

- [ ] **Phase 6.1 — Interactive Video Course Player (`/learn/[courseSlug]`)**
  - [ ] Dedicated responsive YouTube video player with custom progress checkpoints
  - [ ] Collapsible curriculum sidebar with completed checkmarks and current lesson highlighting
  - [ ] Lesson notes tray with markdown rendering and downloadable resource attachments
  - [ ] Automatic next-lesson autoplay and transition triggers
  - **Test**: Enrolled student can watch video lessons, view notes, and mark lessons as complete.

- [ ] **Phase 6.2 — Progress Persistence & Certificate Trigger**
  - [ ] Calculate and persist lesson completion via `Progress` content-type
  - [ ] Update `Enrollment.progressPercentage` in real time
  - [ ] Prompt course completion certificate when all lessons and quizzes are passed
  - **Test**: Completing lessons updates student progress bar on dashboard and player.

---

## Phase 7: MCQ Quiz Engine & Server-Side Auto-Grading

Goal: build a secure, interactive quiz system with timer countdown, secret answer keys, and automatic scorecard generation.

- [ ] **Phase 7.1 — Secure Student Quiz Runner (`/dashboard/student/quizzes/[id]`)**
  - [ ] Quiz instructions screen with time limit and passing score requirements
  - [ ] Interactive question runner with countdown timer, question pagination, and review screen
  - [ ] Zero-Trust answer security: API masks correct answers from client payload before submission
  - **Test**: Student can take timed quiz without answers exposed in browser devtools or network traffic.

- [ ] **Phase 7.2 — Server-Side Grading & Scorecards**
  - [ ] Backend grading service in Strapi comparing submitted answers with stored correct answers
  - [ ] Compute score, percentage, pass/fail status, and persist `QuizAttempt` record
  - [ ] Render detailed Quiz Result scorecard with score breakdown, review of answers, and explanations (`/dashboard/student/quizzes/[id]/result`)
  - **Test**: Submitting quiz computes grade server-side and updates student scorecards.

---

## Phase 8: Stripe Checkout, Payments & Automated Enrollment

Goal: integrate Stripe checkout for secure course purchases with webhook-verified enrollment automation.

- [ ] **Phase 8.1 — Stripe Checkout Integration**
  - [ ] Backend endpoint `/api/orders/create-checkout-session` in Strapi
  - [ ] Stripe Checkout session with course metadata, price, customer email, and redirect URLs
  - [ ] Frontend "Enroll with Stripe" button and payment loading state
  - **Test**: Clicking "Buy Course" redirects to Stripe Checkout with correct price and course ID.

- [ ] **Phase 8.2 — Stripe Webhook & Automated Enrollment**
  - [ ] Stripe webhook handler `/api/orders/webhook` in Strapi with signature verification (`stripe.webhooks.constructEvent`)
  - [ ] On `checkout.session.completed`, update `Order` status to `paid` and create `Enrollment` record transactionally
  - [ ] Idempotency checks to prevent duplicate enrollments on webhook retries
  - **Test**: Stripe webhook event creates student enrollment automatically upon successful payment.

- [ ] **Phase 8.3 — Student Purchase History & Invoices**
  - [ ] Student Purchase History page (`/dashboard/student/orders`)
  - [ ] Order receipt details, transaction date, payment method summary, and course access links
  - **Test**: Student can inspect past receipts and access purchased courses.

---

## Phase 9: End-to-End Testing, Security & Optimization

Goal: validate security, reliability, performance, and responsive design across all roles.

- [ ] **Phase 9.1 — Automated Security & RBAC Invariant Testing**
  - [ ] Verify Student cannot access instructor/manager/admin dashboard routes
  - [ ] Verify Admin / Manager / Instructor cannot enroll or take quizzes
  - [ ] Verify quiz answers remain hidden before attempt submission
  - [ ] Verify order creation calculates amounts on the backend
  - **Test**: Automated security test suite passes.

- [ ] **Phase 9.2 — Full Journey E2E Validation**
  - [ ] Student journey: Register → Browse Catalog → Buy Course (Stripe) → Watch Lessons → Complete Quiz → View Progress
  - [ ] Instructor journey: Login → `/dashboard/instructor` → Create Course → Add Lessons & Quizzes → Monitor Roster
  - [ ] Content Manager journey: Login → `/dashboard/manager` → Manage Courses & Quizzes → Publish Blog Posts
  - [ ] Admin journey: Login → `/dashboard/admin` → Assign Roles → Manage Platform Courses/Blogs → Monitor Platform Stats
  - **Test**: All role journeys execute cleanly without errors across desktop and mobile devices.
