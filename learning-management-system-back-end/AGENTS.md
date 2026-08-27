# Strapi v5 Backend Guidelines

## Project Context
This is the backend API for CPS Academy LMS, built using Strapi v5 on PostgreSQL.

## Core Rules
1. **Database**: Use Neon PostgreSQL via `pg` database client connected via `DATABASE_URL`.
2. **Architecture**:
   - Standard Strapi v5 structure: `src/api/<name>/{content-types,controllers,routes,services}`.
   - Use Strapi Document Service API for all CRUD and relation queries.
3. **Role-Based Authorization**:
   - Enforce 4 roles: `Student`, `Teacher`, `Content Manager`, `Admin`.
   - Never trust user IDs or roles passed from the client; extract them from the authenticated session context (`ctx.state.user`).
   - Validate course ownership on teacher actions.
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
