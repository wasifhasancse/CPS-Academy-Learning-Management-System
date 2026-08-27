/**
 * @fileoverview Shared Domain Types & Contracts for CPS Academy LMS
 * Strictly typed interfaces for zero-trust RBAC, content management, and quiz evaluations.
 */

/**
 * @typedef {'Admin' | 'Content Manager' | 'Instructor' | 'Student'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} documentId
 * @property {string} username
 * @property {string} email
 * @property {string} [avatar]
 * @property {UserRole} role
 * @property {boolean} blocked
 * @property {boolean} confirmed
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} documentId
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [icon]
 * @property {number} [courseCount]
 */

/**
 * @typedef {'draft' | 'under_review' | 'published' | 'archived'} PublishedStatus
 * @typedef {'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'} CourseDifficulty
 */

/**
 * @typedef {Object} Course
 * @property {number} id
 * @property {string} documentId
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {string} [shortDescription]
 * @property {CourseDifficulty} difficulty
 * @property {number} price
 * @property {boolean} isFree
 * @property {PublishedStatus} publishedStatus
 * @property {Category} [category]
 * @property {User} instructor
 * @property {Module[]} [modules]
 * @property {string} [thumbnailUrl]
 * @property {number} [totalDurationMinutes]
 * @property {number} [totalLessonsCount]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Module
 * @property {number} id
 * @property {string} documentId
 * @property {string} title
 * @property {number} order
 * @property {Lesson[]} [lessons]
 * @property {Quiz[]} [quizzes]
 */

/**
 * @typedef {Object} Lesson
 * @property {number} id
 * @property {string} documentId
 * @property {string} title
 * @property {string} slug
 * @property {string} [description]
 * @property {string} youtubeVideoId
 * @property {number} durationSeconds
 * @property {number} order
 * @property {boolean} isPreview
 * @property {string} [notesMarkdown]
 * @property {LessonResource[]} [resources]
 */

/**
 * @typedef {Object} LessonResource
 * @property {string} title
 * @property {string} url
 * @property {string} [fileType]
 */

/**
 * @typedef {'multiple_choice' | 'single_choice' | 'true_false'} QuestionType
 */

/**
 * @typedef {Object} QuestionOption
 * @property {string} id
 * @property {string} text
 */

/**
 * @typedef {Object} Question
 * @property {number} id
 * @property {string} documentId
 * @property {string} prompt
 * @property {QuestionType} type
 * @property {QuestionOption[]} options
 * @property {string[]} [correctOptionIds] - Only returned after submission or to instructors/admins
 * @property {string} [explanation] - Only returned after submission
 * @property {number} points
 * @property {number} order
 */

/**
 * @typedef {Object} Quiz
 * @property {number} id
 * @property {string} documentId
 * @property {string} title
 * @property {string} [description]
 * @property {number} passingScorePercentage
 * @property {number} timeLimitMinutes
 * @property {number} totalQuestions
 * @property {Question[]} [questions]
 * @property {number} order
 */

/**
 * @typedef {'active' | 'completed' | 'refunded' | 'expired'} EnrollmentStatus
 */

/**
 * @typedef {Object} Enrollment
 * @property {number} id
 * @property {string} documentId
 * @property {User} student
 * @property {Course} course
 * @property {EnrollmentStatus} status
 * @property {number} progressPercentage
 * @property {string[]} completedLessonIds
 * @property {string} enrolledAt
 * @property {string} [completedAt]
 */

/**
 * @typedef {'succeeded' | 'pending' | 'failed' | 'refunded'} PaymentStatus
 */

/**
 * @typedef {Object} Transaction
 * @property {number} id
 * @property {string} documentId
 * @property {string} stripeCheckoutSessionId
 * @property {string} stripePaymentIntentId
 * @property {number} amount
 * @property {string} currency
 * @property {PaymentStatus} paymentStatus
 * @property {User} student
 * @property {Course} course
 * @property {string} createdAt
 */

export {};
