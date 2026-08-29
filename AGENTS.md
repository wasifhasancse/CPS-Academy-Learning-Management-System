This project has a graphify knowledge graph at graphify-out/.

## Graphify Rules
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files.
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost).

---

## Project Overview: CPS Academy Learning Management System (LMS)

CPS Academy is a comprehensive Learning Management System built for students, instructors, content managers, and administrators.

### Core Roles & Permission Matrix

| Action | Admin | Content Manager | Instructor | Student |
|---|:---:|:---:|:---:|:---:|
| **Manage users & assign roles** | Yes | No | No | No |
| **Create / edit / delete any course** | Yes | Yes | Own only | No |
| **Add / edit / delete lessons** | Yes | Yes | Own courses | No |
| **Create quizzes** | Yes | Yes | Own courses | No |
| **View student progress** | Yes | Yes | Own courses | Own only |
| **Write / manage blog posts** | Yes | Yes | No | No |
| **Enroll in a course** | No | No | No | Yes |
| **Take quizzes** | No | No | No | Yes |

#### Role Scope Details:
1. **Admin**:
   - Full control of the platform.
   - Manages all users and assigns/changes their roles (`Admin`, `Content Manager`, `Instructor`, `Student`).
   - Can perform all content, billing, and system operations.

2. **Content Manager**:
   - Creates and manages all courses, modules, lessons, quizzes, and blogs (the content library).
   - Can view student learning progress across all courses.
   - Does **NOT** manage users or change user roles.

3. **Instructor**:
   - Manages courses, lessons, and quizzes for **their own assigned courses only**.
   - Can monitor learning progress of students enrolled in **their own courses**.
   - Cannot edit other instructors' courses, manage global users, or publish blog posts.

4. **Student**:
   - Discovers classes, buys/enrolls in courses via Stripe, streams video lessons, takes quizzes, and views **their own progress and scorecards**.
   - Has strictly no access to authoring, grading, curation, or administration.

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
  - Primary: `#285A48` (Forest Emerald Green)
  - Secondary: `#408A71` (Sage Pine Green)
  - Highlight / Accent: `#B0E4CC` (Mint Highlight)
  - Dark / Base: `#091413` (Obsidian Forest)
  - Surface / Neutral: `#F0F7F4` (Light clean mint surface)
- **Styling & Component Rules**:
  - **NO gradients anywhere in the project**; use clean, solid flat colors.
  - Always use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) and semantic class names.
  - Always use atomic, reusable UI components (`src/components/ui/`); never duplicate similar component implementations.
- **Routing Conventions**:
  - Unauthenticated auth routes: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`.
  - Authenticated role dashboards: `/dashboard/student`, `/dashboard/instructor`, `/dashboard/manager`, `/dashboard/admin`.
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
   - Never attempt to run `git commit` automatically or commit a single line of code unless explicitly requested by the user.

---

## Known Issues, Bug Fixes & Prevention Guidelines

### 1. Theme Variables & Dark Mode Color Invariants
- **Issue**: Overriding constant brand color tokens (e.g. assigning `--primary: #EEEEEE` inside `.dark`) breaks utilities like `bg-primary`, causing dark mode footers, banners, and components to render with light backgrounds.
- **Prevention Rule**:
  - Keep brand palette variables constant in both light and dark modes: `--primary: #285A48;`, `--secondary: #408A71;`, `--highlight: #B0E4CC;`.
  - Use dedicated semantic tokens for theming: `--background`, `--foreground`, `--surface`, `--card`, `--border`, `--muted`, `--footer-bg`, `--footer-fg`.
  - Always provide explicit hover states for buttons and interactive elements across both modes (`hover:...` and `dark:hover:...`).
  - For full-width callout banners, place dark cards (`bg-primary`) inside neutral section wrappers (`bg-surface` / `bg-background`) so they remain well-framed in light mode instead of creating full-width dark blocks.

### 2. Nested Git Repositories
- **Issue**: Running `git add .` when sub-directories contain `.git` folders tracks them as mode `160000` gitlinks/submodules instead of tracking their source files.
- **Prevention Rule**: Remove nested `.git` folders before staging and clear cached gitlinks via `git rm --cached -r <dir>`.

### 3. Next.js 16 Proxy Convention
- **Issue**: Using `src/middleware.js` triggers deprecation warnings in Next.js 16.
- **Prevention Rule**: Use the Next.js 16 `src/proxy.js` convention (`export function proxy(request) { ... }`) for request interception and edge routing guards.

### 4. Strapi v5 Default Role Configuration
- **Issue**: Setting `advanced.default_role` in `users-permissions` plugin to a numeric role ID causes registration to fail with `Impossible to find the default role` because Strapi queries `{ where: { type: settings.default_role } }`.
- **Prevention Rule**: Always store the role `type` string (e.g. `'student'` or `'authenticated'`) in `advanced.default_role`. Provide role fallbacks in custom registration controllers.

### 5. Strapi v5 Google OAuth Provider Configuration
- **Issue**: Visiting `/api/connect/google` fails with `400: This provider is disabled` when `grant.google.enabled` is false in the core store.
- **Prevention Rule**: Automatically configure and enable `grant.google` and `grant.email` in Strapi bootstrap (`src/index.js`). Ensure custom `auth.callback` controller seamlessly redirects browser requests to the frontend OAuth callback route (`/auth/callback/google?jwt=...`).

### 6. Strapi v5 User-Permissions Relation Sanitization
- **Issue**: Standard `this.sanitizeOutput(courses, ctx)` in Strapi v5 can strip `instructor` user relation attributes for unauthenticated/student requests due to Users-Permissions field restrictions, causing `course.instructor` to lose `username`.
- **Prevention Rule**: In Strapi custom controllers (`find`, `findOne`), explicitly preserve safe public profile fields (`id`, `username`, `name`) on author/instructor relations after sanitization, and ensure frontend components (`CourseCard.jsx`) safely resolve the username and render with consistent spacing.

### 7. Strapi v5 Nested Module & Lesson Read Permissions
- **Issue**: Populating nested relations (e.g., `modules.lessons` on `course`) strips `modules` for `Student` and `Public` roles when `api::module.module.find` and `api::module.module.findOne` are not explicitly enabled in `PUBLIC_ACTIONS` / `STUDENT_ACTIONS`.
- **Prevention Rule**: Always grant `api::module.module.find`, `api::module.module.findOne`, `api::lesson.lesson.find`, `api::lesson.lesson.findOne`, `api::quiz.quiz.find`, and `api::quiz.quiz.findOne` to both `Public` and `Student` role scopes in Strapi bootstrap (`src/index.js`). Additionally, in custom controllers (`course.js`), explicitly preserve nested `modules` on `sanitizedOutput` so curriculum data is never stripped.

### 8. React/Next.js Client Storage Hydration Consistency
- **Issue**: Reading browser `localStorage` directly in `useState` lazy initializers causes server-side rendered HTML (`null` / skeleton state) to mismatch client initial hydration, triggering React Hydration Failed errors.
- **Prevention Rule**: Keep initial SSR and client state deterministic (`user: null`, `mounted: false`), and only synchronize browser storage inside `useEffect` with a `mounted` check before rendering client-specific authentication widgets.

### 9. Custom Props DOM Element Forwarding in React 19
- **Issue**: Passing custom component props such as `isLoading` through `<Button {...props}>` without explicit destructuring forwards `isLoading={true}` directly to native DOM `<button>` or `<Link>` elements, causing React 19 console warnings (`React does not recognize the 'isLoading' prop on a DOM element`).
- **Prevention Rule**: Always explicitly destructure custom control props (e.g. `isLoading = false`, `variant`, `size`) in primitive UI wrappers (`src/components/ui/Button.jsx`) and prevent spreading non-standard attributes onto DOM tags.

### 10. Form Select Dropdown Empty State Guarding
- **Issue**: Rendering an HTML `<select>` over an empty options array causes the input to collapse into an unusable narrow box with no placeholder option, visually breaking responsive layout.
- **Prevention Rule**: Always enforce a min-width on `<select>` elements (`min-w-[200px] sm:min-w-[280px]`), provide a fallback `<option value="">No items available</option>` when the source array is empty, and set `disabled={items.length === 0}`.

### 11. Structured UI Empty States Across Dashboards and Catalogs
- **Issue**: Using bare plain text for empty lists or searches degrades user experience and leaves users without next-step guidance.
- **Prevention Rule**: Use the standardized `<EmptyState>` component with relevant icons, explanatory titles, contextual descriptions, and actionable creation or filter-reset buttons across all dashboard tabs, table views, and catalog pages.

### 12. Table Primitives Prop Forwarding (`colSpan`, `rowSpan`, event handlers)
- **Issue**: Omitting `...props` in custom table wrappers like `<TableCell>` silently drops attributes such as `colSpan={6}`, causing empty state rows or multi-column cells to collapse into the first column rather than spanning the full width of the table.
- **Prevention Rule**: Always forward `...props` across primitive UI wrappers (`Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`) so HTML attributes like `colSpan`, `rowSpan`, `scope`, and event handlers are passed through to the native elements.

### 13. Strapi v5 Custom Route Ordering & Method Not Allowed (405) Collisions
- **Issue**: Registering custom endpoints (e.g. `POST /orders/create-checkout-session`) in separate router files or after `createCoreRouter` causes the router's parameterized `:id` matcher (`GET /orders/:id`, `PUT /orders/:id`) to intercept the request and return `405 Method Not Allowed`.
- **Prevention Rule**: Define explicit ordered route arrays in `src/api/<api>/routes/<api>.js` with custom sub-paths listed *before* generic `/:id` parameters, and provide resilient JWT token verification directly in the controller using Strapi's JWT service (`resolveUser`).

### 14. Icon Imports in Server and Client Components
- **Issue**: Using newly added icons (e.g. `HiOutlineClock`) without explicitly including them in the `import { ... } from "react-icons/hi2"` statement causes a `Runtime ReferenceError: <Icon> is not defined` during client render.
- **Prevention Rule**: Always ensure that all referenced icon components are imported in top-level declarations and verified during the build step.

### 15. Strapi v5 Controller `sanitizeOutput` Return Spreading & Property Mutation
- **Issue**: Spreading the result of `await this.sanitizeOutput(...)` via `{ ...sanitizedOutput }` triggers `Spread types may only be created from object types`, directly mutating properties (`sanitizedOutput.author = ...`) causes `Property 'author' does not exist on type 'object'`, or declaring `/** @type {...} */ const sanitizedOutput = await ...` causes `Type 'unknown' is not assignable to type ...` because `sanitizeOutput` returns `Promise<unknown>` / `Promise<object>`.
- **Prevention Rule**: Type-cast `sanitizeOutput` using parenthesized JSDoc expression assertion `const sanitizedOutput = /** @type {Record<string, unknown> | Array<Record<string, unknown>>} */ (await this.sanitizeOutput(data, ctx));` or `const sanitizedOutput = /** @type {Record<string, unknown>} */ (await this.sanitizeOutput(data, ctx));` and mutate properties after verifying `typeof sanitizedOutput === 'object'`.

### 16. Controller `ctx.query` Extraction & Spread Type Safety
- **Issue**: Spreading parsed query filters `{ ...queryFilters }` where `queryFilters` is typed from `ctx.query?.filters` or JSON-parsed can cause TypeScript error `Spread types may only be created from object types` because `ctx.query` values are typed as string / unknown unions.
- **Prevention Rule**: Safely validate and annotate filter objects with JSDoc `/** @type {Record<string, unknown>} */` after checking `typeof === 'object'` before spreading or passing to Strapi entity/document queries.

### 17. Nested Property Access on `Record<string, unknown>` Entities
- **Issue**: Directly accessing nested properties such as `sanitizedOutput.instructor.username` or `sanitizedOutput.modules.length` when `sanitizedOutput` is typed as `Record<string, unknown>` triggers `Property 'username' does not exist on type 'unknown'` because dictionary values default to `unknown`.
- **Prevention Rule**: Safely annotate nested object/array members with concrete JSDoc types (e.g. `const currentInstructor = /** @type {Record<string, unknown> | null | undefined} */ (sanitizedOutput.instructor);` or `const currentModules = /** @type {unknown[] | undefined} */ (sanitizedOutput.modules);`) before accessing nested properties, strictly avoiding the `any` keyword.

### 18. Strapi Users-Permissions User Model Property Access
- **Issue**: Attempting to access `.name` directly on Strapi `plugin::users-permissions.user` relations (e.g. `rawInstructor.name`) triggers TypeScript error `Property 'name' does not exist on type '{ id: ID; documentId: string; ... }'` because standard Strapi users-permissions schema defines `username` and `email` rather than `name`.
- **Prevention Rule**: Access standard user fields `username` and `email` (e.g. `rawInstructor.username || rawInstructor.email?.split('@')[0] || 'CPS Instructor'`). If accessing non-standard custom attributes, verify key existence using `'name' in user` with type guarding or explicit JSDoc annotation without using `any`.

### 19. Strapi v5 Database Connection Configuration Typing
- **Issue**: Annotating database connection dictionaries with `Record<Core.Config.Database.ClientKind, Core.Config.Database['connection']>` triggers TypeScript errors (e.g., `Property 'filename' is missing in type '{ connectionString: ... }' but required in type '{ filename: string; }'`) when using connection URLs (like Neon PostgreSQL `DATABASE_URL`) because `Core.Config.Database['connection']` is a broad union whose constituent connection types require dialect-specific fields (e.g. `filename` for sqlite, or individual `host`/`port`/`database`/`user`/`password` for `SharedConnection`).
- **Prevention Rule**: Annotate the connection dictionary with `/** @type {Record<Core.Config.Database.ClientKind, Record<string, unknown>>} */` in `config/database.js` so that dynamic connection objects (such as connection strings or dialect options) pass type checking cleanly without violating client kind constraints.

### 20. Strapi Behind Reverse Proxy & HTTPS Secure Cookie Errors in OAuth
- **Issue**: Running Strapi in containerized/cloud environments (Render, Railway, Docker, AWS ALB) behind an HTTPS reverse proxy triggers `warn: You are using a third party provider for login. Make sure to set an absolute url in config/server.js` and crashes with `Error: Cannot send secure cookie over unencrypted connection` on `/api/connect/google` because Koa receives internal plain HTTP (`0.0.0.0:8080`), disregards `X-Forwarded-Proto: https` without `proxy: true`, and treats `ctx.secure` as `false` when `koa-session`/`grant` attempts to set secure cookies.
- **Prevention Rule**: Always configure `url: env('PUBLIC_URL', env('URL', ''))` and `proxy: env.bool('IS_PROXIED', true)` in `config/server.js`, and include production frontend origins dynamically in `config/middlewares.js` under `strapi::cors` so proxy headers and secure session cookies work seamlessly across environments.

### 21. Production Mixed Content Browser Blocking for Backend API Calls
- **Issue**: Deploying the frontend on HTTPS (e.g. `https://cps-academy.vercel.app`) with `NEXT_PUBLIC_STRAPI_URL` set to an insecure `http://` URL (e.g. `http://...railway.app`) causes browsers to block API requests (`/api/auth/local`, `/api/auth/local/register`, etc.) with `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource... This request has been blocked; the content must be served over HTTPS.`
- **Prevention Rule**: In production environment variables (e.g. Vercel Project Settings), ensure `NEXT_PUBLIC_STRAPI_URL` starts with `https://`. Additionally, use `getStrapiUrl()` in [`src/lib/api.js`](file:///d:/CPS%20Academy/learning-management-system-front-end/src/lib/api.js) to normalize and auto-upgrade insecure URLs to HTTPS whenever executing in secure browser contexts.



