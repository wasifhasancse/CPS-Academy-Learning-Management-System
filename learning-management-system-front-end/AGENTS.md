<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend Guidelines for CPS Academy LMS

## Core Architecture
1. **Next.js 16 & React 19**:
   - Use App Router structure (`src/app/**`).
   - Keep Server Components as the default for data fetching, layouts, and public views.
   - Use Client Components (`"use client"`) for video players, quiz runners, and interactive form dashboards.
2. **Design System & Styling (Tailwind CSS v4)**:
   - **Typography**: Roboto (`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`).
   - **Color Tokens**:
     - Primary: `#213C51` (Dark navy slate)
     - Secondary: `#6594B1` (Soft steel blue)
     - Highlight: `#DDAED3` (Lilac lavender)
     - Surface: `#EEEEEE` (Light grey)
   - **Styling Rules**:
     - **NO gradients anywhere in the project**; use clean, flat solid colors.
     - Always use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) and semantic class names.
     - Always build and reuse atomic UI components in `src/components/ui/` (`Button`, `Input`, `Card`, `Badge`, `Modal`, `Table`, etc.). Never create duplicate implementations of the same component type.
3. **LMS Experience & Video Player**:
   - Embed YouTube lesson videos with responsive `aspect-video` containers.
   - Implement course navigation with real-time lesson progress markers and module accordions.
4. **Quiz Interface**:
   - Interactive quiz runner with timer, question navigation, review state, and instant scorecards.
5. **Routing & Authentication**:
   - Unauthenticated routes: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/callback/google` (Google OAuth exchange).
   - "Continue with Google" triggers Strapi Users & Permissions Google provider (`/api/connect/google`).
   - Authenticated role dashboards: `/dashboard/student/*`, `/dashboard/teacher/*`, `/dashboard/manager/*`, `/dashboard/admin/*`.
   - Next.js middleware guards `/dashboard/*` (redirecting unauthenticated requests to `/auth/login?redirect=...`) and blocks unauthorized cross-role access.
6. **Code Standards**:
   - Strict TypeScript/JSDoc types; zero tolerance for `any`.
   - Reusable component architecture with clean state boundaries.
7. **Theme Variables & Dark Mode Invariants**:
   - Never override brand color variables (`--primary`, `--secondary`, `--highlight`) inside `.dark`.
   - Use semantic variables (`--background`, `--foreground`, `--surface`, `--card`, `--border`, `--muted`, `--footer-bg`, `--footer-fg`) for dark/light mode adaptations.
   - Always ensure interactive controls (`Button`, links, inputs) have defined hover and focus states for both modes.
