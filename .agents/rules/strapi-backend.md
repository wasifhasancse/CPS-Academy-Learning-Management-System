# Strapi v5 Backend Development Rules

When working in `learning-management-system-back-end/`:

## 1. Architecture & Conventions
- Use Strapi v5 standard folder structure: `src/api/<api-name>/{content-types,controllers,routes,services}`.
- Connect to Neon PostgreSQL using `DATABASE_URL` via the `pg` database client with SSL enabled.
- Always use Strapi's Document Service API (`strapi.documents('api::...')`) for content operations in Strapi v5.
- Keep business logic in services (`src/api/<api-name>/services/`), keeping controllers thin and focused on request validation and response mapping.

## 2. Content-Type Schemas
- Store schema definitions in `src/api/<api-name>/content-types/<api-name>/schema.json`.
- Maintain clear relational links (e.g., `course` -> `hasMany` -> `modules` -> `hasMany` -> `lessons`).
- Ensure sensitive fields (like `correctAnswer` in Quiz Questions or Stripe secrets) are marked with `private: true` or explicitly stripped in custom controller transforms.

## 3. RBAC & Policy Enforcement
- Use Strapi policies (`src/policies/` or route-level policies) to restrict endpoints based on user roles (`Student`, `Teacher`, `Content Manager`, `Admin`).
- Validate record ownership before allowing updates (e.g., ensure a Teacher can only edit courses where `course.instructor.id === user.id`).
- Super Admin operations must verify the Admin role via user permissions.

## 4. Stripe Payments & Enrollment Integrity
- Never trust client-submitted amounts. Always fetch the authoritative course price from the database before creating a Stripe checkout session.
- Handle Stripe webhooks in a raw body endpoint to verify `stripe-signature`.
- Perform enrollment creation and order status updates inside database transactions with idempotency keys to prevent double-enrollments.

## 5. Authentication & Google OAuth Provider
- Configure `@strapi/plugin-users-permissions` with local (email/password) and Google provider.
- Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in environment variables.
- Set redirect URL to point back to the frontend Google callback handler (`${FRONTEND_URL}/auth/callback/google`).
- Assign the default `Student` role to new users created via Google OAuth.
