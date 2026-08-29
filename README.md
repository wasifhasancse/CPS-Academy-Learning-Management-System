# CPS Academy — Learning Management System (LMS)

CPS Academy is a comprehensive Learning Management System built for competitive programming, computer science, and software engineering education. The platform supports four distinct user roles (Admin, Content Manager, Instructor, Student) with secure role-based access control, video lessons, timed quiz assessments, Stripe payments, and learning analytics.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, React 19, Tailwind CSS v4, Lucide / React Icons)
- **Backend / CMS**: Strapi v5 Headless CMS (Node.js, `@strapi/plugin-users-permissions`)
- **Database**: Neon PostgreSQL (Serverless Postgres)
- **Authentication**: JWT & Google OAuth 2.0
- **Payments**: Stripe API & Webhook Fulfillment
- **Media Hosting**: ImgBB API & YouTube Video Embed Engine

---

## 🚀 How to Run Locally

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`
- **Database**: PostgreSQL instance (or free serverless database like [Neon](https://neon.tech))
- **Stripe Account (Optional for payments)**: Stripe Test Mode API Keys
- **Google Cloud Console (Optional for OAuth)**: OAuth 2.0 Web Client Credentials

---

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd "CPS Academy"
```

---

### Step 2: Backend Setup (`learning-management-system-back-end`)

1. **Navigate to the backend directory**:
   ```bash
   cd learning-management-system-back-end
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` or create a new `.env` file in `learning-management-system-back-end/`:
   ```env
   # Server Config
   HOST=0.0.0.0
   PORT=1337
   PUBLIC_URL=http://localhost:1337
   FRONTEND_URL=http://localhost:3000

   # Security Salts & Secrets (Generate random strings or keep defaults for local dev)
   APP_KEYS=randomKeyA,randomKeyB
   API_TOKEN_SALT=randomTokenSalt
   ADMIN_JWT_SECRET=randomAdminJwtSecret
   TRANSFER_TOKEN_SALT=randomTransferTokenSalt
   JWT_SECRET=randomJwtSecretString
   ENCRYPTION_KEY=randomEncryptionKey32CharsLong123

   # Database (PostgreSQL / Neon connection string)
   DATABASE_CLIENT=postgres
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>?sslmode=require
   DATABASE_SSL=true
   DATABASE_SSL_REJECT_UNAUTHORIZED=false

   # Google OAuth 2.0 (Optional for social login)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Stripe Payments & Webhooks
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Start the Strapi CMS Server**:
   ```bash
   npm run develop
   ```
   - **API Endpoint**: `http://localhost:1337`
   - **Admin Panel**: `http://localhost:1337/admin`
   - *Note*: On first launch, visit `http://localhost:1337/admin` to register your local Strapi administrator account. The system bootstrap will automatically seed the 4 application roles (`Admin`, `Content Manager`, `Instructor`, `Student`) and configure essential public permissions.

---

### Step 3: Frontend Setup (`learning-management-system-front-end`)

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd learning-management-system-front-end
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in `learning-management-system-front-end/`:
   ```env
   # Backend Connection
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Stripe (Publishable Key for Checkout redirection)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   - **Frontend App**: `http://localhost:3000`

---

### Step 4: Testing & Role Verification

1. **Create an Account**:
   - Go to `http://localhost:3000/auth/register` and create a student account.
   - Newly registered users are assigned the **Student** role by default and redirected to `/dashboard/student`.

2. **Switch Roles (Admin / Instructor / Content Manager)**:
   - Go to the Strapi Admin Panel at `http://localhost:1337/admin`.
   - Navigate to **Content Manager** ➔ **Users (Users-Permissions)**.
   - Select the target user and change their **Role** to `Admin`, `Content Manager`, `Instructor`, or `Student`.
   - Log out and log back in on the frontend to access the respective dashboard (`/dashboard/admin`, `/dashboard/manager`, `/dashboard/instructor`, `/dashboard/student`).

---

### Step 5: (Optional) Local Stripe Webhook Forwarding

To test the payment reconciliation and automatic course enrollment locally:
1. Download and authenticate the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Forward events directly to the local backend:
   ```bash
   stripe listen --forward-to localhost:1337/api/orders/webhook
   ```
3. Copy the output signing secret (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in your backend `.env` file.

---

## ✨ Core Features & Completed Modules

### 1. Multi-Role RBAC System
- **Strict Role Isolation**: 4 dedicated dashboard workspaces (`/dashboard/student`, `/dashboard/instructor`, `/dashboard/manager`, `/dashboard/admin`).
- **Edge Route Guards**: Next.js 16 proxy middleware (`src/proxy.js`) automatically intercepts unauthenticated requests and isolates cross-role access.
- **Granular Permissions Matrix**:
  - **Admin**: Full platform control, user management, global role assignment, and audit logs.
  - **Content Manager**: Global curriculum authoring (courses, modules, lessons, quizzes, blogs) and cross-course analytics.
  - **Instructor**: Ownership-scoped course authoring, module & lesson management, quiz builders, and student progress tracking for assigned courses.
  - **Student**: Course discovery, Stripe checkout enrollment, distraction-free video learning interface, timed quizzes, and scorecard tracking.

### 2. Course Discovery & Curriculum Engine
- **Search & Filtering**: Real-time query search, category filters, difficulty sorting, and dynamic course badges.
- **Hierarchical Curriculum**: Nested relational structure (`Course` ➔ `Modules` ➔ `Lessons` & `Quizzes`).
- **Interactive Player**: Responsive YouTube video player with progress checkpoints, completion toggles, lesson navigation sidebar, and downloadable resources.
- **Media Uploads**: Built-in ImgBB media engine for direct thumbnail uploads with preview support.

### 3. Timed Quiz & Assessment Engine
- **Zero-Cheat Architecture**: Correct answer keys and explanations are omitted from student-facing payloads and validated strictly server-side upon submission.
- **Timer & Auto-Submit**: Active countdown timer with automated submission on expiry.
- **Instant Detailed Scorecard**: Breakdown of total score, pass/fail status, and explanation for each question post-submission.

### 4. Stripe Payments & Automatic Enrollment
- **Secure Server-Side Checkout**: Dynamic Stripe checkout session generation with automatic currency and price validation.
- **Transactional Webhook Listener**: Webhook endpoint (`/api/orders/webhook`) verifies Stripe signatures and atomically creates enrollment and payment records upon payment completion.

### 5. Community & Content Platform
- **Engineering Blog**: Public articles with category filtering, search, and rich markdown rendering.
- **Student Success Stories**: Verified alumni rating jumps, contest achievements, and career trajectories.
- **Strict 4-Color Design System**: Clean, flat design system using 4 brand colors (`#355872`, `#7AAACE`, `#9CD5FF`, `#F7F8F0`) with full light and dark mode support.

---

## 🧗 Challenges Faced & Solutions

1. **Strapi v5 Relation Sanitization**:
   - *Challenge*: Strapi v5's default `sanitizeOutput` stripped author and instructor relation attributes for unauthenticated and student users due to Users-Permissions field restrictions.
   - *Solution*: Custom controller overrides explicitly preserve safe public profile fields (`id`, `username`, `email`) on instructor relations after output sanitization.

2. **Nested Module & Lesson Permission Propagation**:
   - *Challenge*: Nested relations (`course.modules.lessons`) were filtered out for `Public` and `Student` roles when child permissions were not explicitly enabled in the Users & Permissions plugin.
   - *Solution*: Programmatically seeded read permissions for modules, lessons, and quizzes in the Strapi bootstrap lifecycle (`src/index.js`) and ensured controllers preserve curriculum arrays.

3. **Cloud Reverse Proxy & HTTPS Cookies in OAuth**:
   - *Challenge*: Deploying backend to Railway behind an HTTPS proxy triggered `Cannot send secure cookie over unencrypted connection` during Google OAuth callbacks because internal Koa instances received plain HTTP.
   - *Solution*: Configured `proxy: { koa: true }` in `config/server.js`, updated session cookie policies (`secure: false`, `sameSite: 'lax'`), and added dynamic CORS origin matching.

4. **Next.js 16 Route Interception & Hydration Consistency**:
   - *Challenge*: Direct `localStorage` reads during initial SSR caused client hydration mismatches, and `src/middleware.js` triggered Next.js 16 deprecation warnings.
   - *Solution*: Migrated edge route interception to the Next.js 16 `src/proxy.js` convention and implemented deterministic SSR state with mounted synchronization inside `useEffect`.

5. **Quiz Answer Security & Integrity**:
   - *Challenge*: Ensuring students cannot inspect client-side network payloads or DOM state to view quiz answers beforehand.
   - *Solution*: Built server-side answer sanitization on `find`/`findOne` quiz endpoints, computing final scores and explanations exclusively inside custom Strapi submission controllers.
