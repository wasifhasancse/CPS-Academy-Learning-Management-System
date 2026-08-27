# RBAC & Security Rules for CPS Academy LMS

## 1. Zero-Trust Backend Authorization
- The backend is the single source of truth for authorization.
- Every API endpoint that handles sensitive actions (course modification, quiz submission, role change, checkout session creation) must verify the caller's JWT and permissions on the server.
- Never rely on frontend UI hiding or client-side checks for security.

## 2. Role Boundaries & Scopes
- **Student**:
  - Can only access lesson content for courses they are actively enrolled in (except free preview lessons).
  - Can only submit and view their own quiz attempts and orders.
  - Cannot access teacher, content manager, or admin API endpoints.
- **Teacher**:
  - Can create and edit only their own courses, modules, lessons, and quizzes.
  - Can view enrollments and quiz attempts only for their own courses.
  - Cannot publish courses directly to the live catalog without Content Manager / Admin approval.
- **Content Manager**:
  - Can inspect, review, categorize, edit, approve, or reject any course draft.
  - Cannot modify administrative user roles or financial transactions.
- **Admin**:
  - Full system authorization across all resources, users, roles, and billing logs.

## 3. Financial & Transaction Integrity
- Never accept client-submitted prices or discount values. The server must look up the verified database price before initiating a Stripe checkout session.
- Stripe webhook handlers must verify signatures and apply idempotent updates to prevent duplicate enrollments or replay attacks.

## 4. Quiz Integrity & Anti-Cheating
- Question endpoints for students must omit `correctAnswer` and explanation fields until after the attempt is submitted and evaluated.
- Quiz submissions must be graded server-side.
- Enforce time limits by comparing `startedAt` and `submittedAt` timestamps on the server.
