# Next.js 16 Frontend Development Rules

When working in `learning-management-system-front-end/`:

## 1. Framework & App Router
- Use Next.js 16 App Router conventions (`src/app/**`).
- Default to React Server Components (RSC) for data fetching, static rendering, and SEO.
- Use Client Components (`"use client"`) only when interactivity, browser APIs, React hooks (`useState`, `useEffect`), or media players are needed.

## 2. Design System, Typography & Styling (Tailwind CSS v4)
- **Typography**:
  - Global font: Roboto (`@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`).
- **Brand Palette & Tokens**:
  - Primary: `#213C51` (Dark navy slate)
  - Secondary: `#6594B1` (Soft steel blue)
  - Highlight / Accent: `#DDAED3` (Lilac lavender)
  - Surface / Neutral: `#EEEEEE` (Light grey)
- **Strict Styling Guidelines**:
  - **NO gradients anywhere in the project**; use clean, flat solid colors only.
  - Always use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) and semantic class names.
  - Always build and reuse atomic UI components in `src/components/ui/` (`Button`, `Input`, `Card`, `Badge`, `Modal`, `Table`, etc.). Never create duplicate implementations of the same component type.
  - Configure tokens in `src/app/globals.css` using `@theme inline`.

## 3. Video Player & Learning Interface
- Embed YouTube lesson videos cleanly using responsive aspect-ratio containers (`aspect-video`).
- Track video watch progress and trigger completion handlers when the student finishes or marks a lesson complete.
- Keep the course curriculum sidebar accessible, showing current active lesson and completion status.

## 4. Route Architecture & Authentication
- **Unauthenticated Auth Routes**:
  - Place auth flows under `/auth/login`, `/auth/register`, `/auth/forgot-password`, and `/auth/reset-password`.
  - Provide "Continue with Google" button redirecting to `${NEXT_PUBLIC_STRAPI_URL}/api/connect/google`.
  - Handle OAuth response and cookie exchange at `/auth/callback/google`.
- **Authenticated Role Dashboards**:
  - Route all authenticated dashboard features under `/dashboard/[role]/*`:
    - Student: `/dashboard/student/*`
    - Teacher: `/dashboard/teacher/*`
    - Content Manager: `/dashboard/manager/*`
    - Admin: `/dashboard/admin/*`
- **Route Guard Middleware**:
  - Unauthenticated access to `/dashboard/*` redirects to `/auth/login?redirect=...`.
  - Authenticated visits to root `/dashboard` automatically route to `/dashboard/[userRole]`.
  - Cross-role route access attempts are blocked with 403 Forbidden.
- Handle loading states with accessible skeleton loaders and fallback UI (`loading.js` / Suspense).
