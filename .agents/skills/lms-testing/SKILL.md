---
name: lms-testing
description: >-
  Use this skill when designing, writing, or running integration, security, and end-to-end tests
  for the CPS Academy LMS across Student, Teacher, Content Manager, and Admin workflows.
---

# LMS Testing & Verification Runbook

Follow these instructions for validating CPS Academy LMS functionality:

## 1. Role-Based Access Control (RBAC) Security Verification
Run automated or script-based checks for role boundary enforcement:
- **Student Probes**:
  - `GET /api/teacher/courses` -> Expect 403 Forbidden.
  - `GET /api/lessons/:paidLessonId` (without enrollment) -> Expect 403 Forbidden.
  - `GET /api/quizzes/:id` -> Verify `correctAnswer` is omitted from payload.
- **Teacher Probes**:
  - `PUT /api/courses/:otherTeacherCourseId` -> Expect 403 Forbidden (ownership check).
  - `PUT /api/users/:id/role` -> Expect 403 Forbidden.
- **Content Manager Probes**:
  - `PUT /api/courses/:id/publish` -> Expect 200 OK.
  - `POST /api/orders/refund` -> Expect 403 Forbidden.

## 2. Payment & Enrollment Integrity Testing
- Test that modifying client-side price payload does not affect checkout session unit amount.
- Replay test webhook payloads to verify idempotent behavior (no duplicate enrollment records).

## 3. Quiz Scoring Verification
- Test all-correct answers -> Expect 100% score and `passed: true`.
- Test below-threshold answers -> Expect correct percentage and `passed: false`.
- Test expired submission -> Verify late submissions are handled according to quiz rules.

## 4. Frontend Component & Accessibility Checks
- Check that all interactive buttons and inputs have accessible labels and keyboard focus states.
- Validate responsive layouts across mobile (375px), tablet (768px), and desktop (1280px).
