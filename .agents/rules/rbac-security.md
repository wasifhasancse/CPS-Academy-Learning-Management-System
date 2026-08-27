# RBAC & Security Rules for CPS Academy LMS

## 1. Zero-Trust Backend Authorization
- The backend is the single source of truth for authorization.
- Every API endpoint that handles sensitive actions (course modification, quiz submission, role change, checkout session creation) must verify the caller's JWT and permissions on the server.
- Never rely on frontend UI hiding or client-side checks for security.

## 2. Definitive Permission Matrix & Role Scopes

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

### Detailed Role Enforcements:
- **Admin**:
  - Only role permitted to manage users and assign/change user roles.
  - Full CRUD authority across all courses, lessons, quizzes, blogs, orders, and system logs.
  - Does not enroll in courses or take student quizzes.
- **Content Manager**:
  - Full authority to create, edit, organize, and delete any course, module, lesson, and quiz across the platform content library.
  - Can author and publish blog posts / articles.
  - Can view student progress across all courses.
  - Strictly forbidden from managing user accounts or changing user roles.
- **Instructor**:
  - Can create, edit, and manage lessons and quizzes for **their own assigned courses only**.
  - Can view learning progress and quiz submissions for students enrolled in **their own courses**.
  - Cannot modify other instructors' courses, manage global users, or author blog posts.
- **Student**:
  - Can browse courses, enroll/buy courses via Stripe, stream lessons, and take quizzes.
  - Can view **only their own** course progress, quiz scorecards, and purchase history.
  - Has zero access to course authoring, question keys, blog management, or admin features.

## 3. Financial & Transaction Integrity
- Never accept client-submitted prices or discount values. The server must look up the verified database price before initiating a Stripe checkout session.
- Stripe webhook handlers must verify signatures and apply idempotent updates to prevent duplicate enrollments or replay attacks.

## 4. Quiz Integrity & Anti-Cheating
- Question endpoints for students must omit `correctAnswer` and explanation fields until after the attempt is submitted and evaluated.
- Quiz submissions must be graded server-side.
- Enforce time limits by comparing `startedAt` and `submittedAt` timestamps on the server.
