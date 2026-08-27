# Quiz Engine & Assessment Rules

## 1. Schema & Data Model
- Quizzes are associated with Courses or Modules.
- Each Quiz contains a set of Questions with types: `multiple_choice`, `single_choice`, or `true_false`.
- Question options must have unique identifiers (e.g., `opt_1`, `opt_2`, `opt_3`, `opt_4`).
- Correct answer mapping is stored privately in the Question schema or backend database table.

## 2. Secure Quiz Session Flow
1. **Start Quiz Session**:
   - Student calls `/api/quizzes/:id/start`.
   - Backend checks if student is enrolled in the course.
   - Backend creates a `QuizAttempt` record with `status = "in_progress"`, `startedAt = now()`.
   - Backend returns quiz metadata and questions **WITHOUT** correct answers.
2. **Submit Quiz Session**:
   - Student calls `/api/quizzes/:id/submit` with `attemptId` and answers payload (`{ questionId: selectedOptionId }`).
   - Backend checks that the attempt belongs to the requesting student, is currently in progress, and is within the allowed time limit (with a small grace period for network latency).
   - Backend calculates score, percentage, and pass/fail status against passing criteria.
   - Backend updates `QuizAttempt` to `status = "completed"`, `submittedAt = now()`, `score`, `passed`.
   - Backend returns score breakdown, questions with correct answers, and feedback.

## 3. Idempotency & Attempt Limits
- Once an attempt is marked completed or expired, it cannot be re-submitted.
- If a course restricts maximum attempts per student, verify the count before allowing a new attempt to start.
