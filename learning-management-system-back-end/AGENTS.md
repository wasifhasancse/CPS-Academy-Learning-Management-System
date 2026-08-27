# Strapi v5 Backend Guidelines

## Project Context
This is the backend API for CPS Academy LMS, built using Strapi v5 on PostgreSQL.

## Core Rules
1. **Database**: Use Neon PostgreSQL via `pg` database client connected via `DATABASE_URL`.
2. **Architecture**:
   - Standard Strapi v5 structure: `src/api/<name>/{content-types,controllers,routes,services}`.
   - Use Strapi Document Service API for all CRUD and relation queries.
3. **Role-Based Authorization (4-Role Matrix)**:
   - Enforce 4 distinct roles: `Admin`, `Content Manager`, `Instructor`, `Student`.
   - Never trust user IDs or roles passed from the client; extract them from the verified session context (`ctx.state.user`).
   - Admin manages users and assign roles; Content Manager manages all courses/content/blogs; Instructor manages **own courses only**; Student can only enroll and take quizzes.
   - Enforce record ownership on Instructor mutations (`course.instructor.id === user.id`).
4. **Stripe Payments**:
   - Manage checkout sessions and verified webhooks.
   - Create enrollments atomically upon verified `checkout.session.completed` events.
5. **Quiz Security**:
   - Never expose correct question answers to uncompleted quiz sessions.
   - Perform grading server-side.
6. **Type Safety & Code Quality**:
   - Strict prohibition of `any`.
   - Validate request payloads with schemas.
   - Keep controllers thin and place domain logic into services.
