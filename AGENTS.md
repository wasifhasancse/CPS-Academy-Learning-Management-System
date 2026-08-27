This project has a graphify knowledge graph at graphify-out/.

## Graphify Rules
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files.
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost).

---

## Project Overview: CPS Academy Learning Management System (LMS)

CPS Academy is a comprehensive Learning Management System built for students, teachers, content managers, and administrators.

### Core Roles & Permission Matrix

1. **Student**:
   - Discover and search classes/courses by category, tags, difficulty, and price.
   - Buy classes via Stripe checkout with automatic enrollment upon verified payment.
   - Learn via interactive course player with YouTube video lessons, resource downloads, and progress tracking.
   - Take quizzes linked to classes with timed attempts, immediate grading, detailed scorecards, and certificates.
   - Manage student profile, enrolled courses, learning history, and invoice records.

2. **Teacher / Instructor**:
   - Author, upload, and update courses, modules, and video lessons (YouTube unlisted URLs, resources, descriptions).
   - Create and manage course-specific quizzes (multiple choice, true/false, questions bank, passing scores).
   - Manage enrolled students, monitor student learning progress, and review quiz performance analytics.

3. **Content Manager**:
   - Curate, review, and moderate all course content, descriptions, taxonomies, and video resources.
   - Manage course categories, tags, promotional banners, and featured course catalogs.
   - Approve teacher-submitted courses and publish them to the public catalog.

4. **Admin**:
   - Global platform administration and configuration.
   - Manage user accounts, assign/change user roles (Student, Teacher, Content Manager, Admin), and enforce access policies.
   - Manage financial transactions, monitor Stripe webhooks, reconcile orders, and view revenue analytics.
   - Audit logs, system health checks, and global settings.

---

## Technical Stack & Architecture

### Backend: Strapi v5 (`learning-management-system-back-end`)
- **Framework**: Strapi v5 Headless CMS (`@strapi/strapi`).
- **Database**: Neon PostgreSQL (connected via `DATABASE_URL` with `pg`).
- **Authentication**: `@strapi/plugin-users-permissions` with JWT tokens, Google OAuth provider (`/api/connect/google`), and custom role policies.
- **Payment Processing**: Stripe API with webhook listener for transactional enrollment creation.
- **API Design**: RESTful endpoints with custom controllers, services, and middlewares for business logic.

### Frontend: Next.js 16 (`learning-management-system-front-end`)
- **Framework**: Next.js 16 App Router with React 19.
- **Typography**: Roboto (`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`).
- **Color Palette & Theme Tokens** (Tailwind CSS v4):
  - Primary: `#213C51` (Dark navy slate)
  - Secondary: `#6594B1` (Soft steel blue)
  - Highlight / Accent: `#DDAED3` (Lilac lavender)
  - Surface / Neutral: `#EEEEEE` (Light grey)
- **Styling & Component Rules**:
  - **NO gradients anywhere in the project**; use clean, solid flat colors.
  - Always use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) and semantic class names.
  - Always use atomic, reusable UI components (`src/components/ui/`); never duplicate similar component implementations.
- **Routing Conventions**:
  - Unauthenticated auth routes: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`.
  - Authenticated role dashboards: `/dashboard/student`, `/dashboard/teacher`, `/dashboard/manager`, `/dashboard/admin`.
  - Next.js middleware enforces auth guards on `/dashboard/*` (redirecting unauthenticated users to `/auth/login?redirect=...`) and strictly isolates role dashboards.
- **State & Data Fetching**: Server Components for SEO/prefetching + Client Components for interactive video player and quiz engine.
- **Video Delivery**: Responsive YouTube embed player with progress checkpoints, duration tracking, and resource trays.

---

## Security, RBAC & Data Integrity Rules

1. **Zero-Trust Backend Authorization**:
   - Never trust role claims or user IDs provided by the client. Always extract and verify the authenticated user from the verified JWT on the server.
   - Price calculation and enrollment creation must happen strictly on the backend. Never accept client-submitted amounts.

2. **Quiz Answer Secrecy**:
   - The API must NEVER send correct answer keys or solution explanations to the client before a quiz attempt is submitted.
   - Quiz grading and score computation must happen server-side inside Strapi controllers/services.

3. **Content Access Guarding**:
   - Video lessons and course materials marked as paid must only be accessible to enrolled students, course instructors, content managers, or admins.
   - Preview/Free lessons can be publicly accessible.

4. **TypeScript & Type Safety**:
   - **Strict Prohibition of `any`**: Never use the `any` type or ESLint suppressions (`@typescript-eslint/no-explicit-any`) anywhere in the codebase.
   - **Concrete & Inferred Types**: Use concrete types, Zod schemas (`z.infer<typeof Schema>`), Strapi schema interfaces, React event/component types, or generic type parameters (`<T>`).
   - Validate API inputs and payloads using schema validators (e.g., Zod) on both frontend and backend boundaries.

5. **Code Hygiene & Native Tooling**:
   - Do not use temporary modifying scripts to change project files; use native editing tools.
   - Ensure clean formatting without trailing whitespace or leftover debug console logs.
