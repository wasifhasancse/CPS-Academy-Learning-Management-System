---
name: quiz-engine
description: >-
  Use this skill when developing or testing quiz builders for teachers, secure student quiz runners,
  server-side grading, question management, and quiz analytics.
---

# Quiz Engine Development Runbook

Follow these procedures for building and validating the Quiz system:

## 1. Student Quiz Runner Workflow
1. Fetch quiz structure without answers:
   - Request `GET /api/quizzes/:id/start`.
   - Ensure the server omits `correctAnswer` and explanations.
2. Active Quiz State Management:
   - Run a countdown timer using the `timeLimitMinutes` attribute.
   - Store answers locally in memory (`{ [questionId]: selectedOptionId }`).
   - Warn student before navigating away or when time is running low (< 1 minute).
3. Submit Quiz:
   - Call `POST /api/quizzes/:id/submit` with payload:
     ```json
     {
       "attemptId": 123,
       "answers": {
         "q1": "opt_2",
         "q2": "opt_1"
       }
     }
     ```
4. Render Result:
   - Display score, passing status, breakdown per question with correct answers revealed and explanations.

## 2. Teacher Quiz Builder Workflow
- Allow teachers to add questions with:
  - Question title / rich text.
  - Question type: Multiple Choice (Single answer), Multiple Selection, or True/False.
  - Option list (A, B, C, D) with indicator for the correct option.
  - Score value / weight (default: 1 point).
  - Explanation for the correct answer.

## 3. Verification Steps
1. Attempt to inspect network responses in developer tools to confirm no correct answers are leaked before submission.
2. Submit a test quiz after the timer expires to confirm server-side time rejection or auto-grading.
3. Validate that pass/fail criteria match course passing score requirements.
