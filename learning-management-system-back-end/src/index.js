"use strict";

/**
 * CPS Academy LMS Core Roles
 */
const ROLES_TO_SEED = [
  {
    name: "Admin",
    type: "admin",
    description:
      "Full control of the platform. Manages all users and assigns/changes their roles.",
  },
  {
    name: "Content Manager",
    type: "content_manager",
    description:
      "Creates and manages all courses, modules, lessons, quizzes, and blog posts.",
  },
  {
    name: "Instructor",
    type: "instructor",
    description:
      "Manages lessons and quizzes for own assigned courses, and monitors student progress.",
  },
  {
    name: "Student",
    type: "student",
    description:
      "Enrolls in courses, streams video lessons, takes quizzes, and tracks personal learning progress.",
  },
];

/**
 * CPS Academy Default Course Categories
 */
const DEFAULT_CATEGORIES = [
  {
    name: "Competitive Programming",
    slug: "competitive-programming",
    description: "Algorithms, Data Structures, and Online Contest Tracks",
  },
  {
    name: "Software Engineering",
    slug: "software-engineering",
    description: "Full-Stack Architecture, Backend Engineering, and Clean Code",
  },
  {
    name: "Data Structures & Algorithms",
    slug: "dsa",
    description: "Core Computer Science Foundations and Problem Solving",
  },
  {
    name: "System Design & Architecture",
    slug: "system-design",
    description: "Scalable Systems, Microservices, and Distributed Systems",
  },
  {
    name: "Web Development",
    slug: "web-development",
    description: "Modern Next.js, React, Node.js, and Full-Stack Engineering",
  },
];

/**
 * CPS Academy Default Seeded Courses (8 courses with lessons & quizzes)
 * Instructor: Rakib Khan — instractor@gmail.com
 */
const DEFAULT_COURSES = [
  {
    title: "Competitive Programming Mastery: From Beginner to Expert",
    slug: "competitive-programming-mastery",
    description: "A complete structured journey through competitive programming. Master algorithms, data structures, and contest strategies to achieve top ratings on Codeforces, AtCoder, and LeetCode.",
    price: 1200,
    difficulty: "Intermediate",
    categorySlug: "competitive-programming",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: Problem-Solving Fundamentals",
        lessons: [
          { title: "Introduction to Competitive Programming", youtubeUrl: "https://www.youtube.com/watch?v=xAeiXy8-9Y8", duration: "14:22", isFreePreview: true },
          { title: "Big-O Notation and Time Complexity", youtubeUrl: "https://www.youtube.com/watch?v=Mo4vesaut8g", duration: "18:45", isFreePreview: true },
          { title: "STL Mastery: Vectors, Sets, and Maps", youtubeUrl: "https://www.youtube.com/watch?v=LyGlTmaWEPs", duration: "22:10", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Dynamic Programming Core Patterns",
        lessons: [
          { title: "DP Foundations: Memoization vs Tabulation", youtubeUrl: "https://www.youtube.com/watch?v=oBt53YbR9Kk", duration: "30:12", isFreePreview: false },
          { title: "Knapsack, LCS, and Classic DP Problems", youtubeUrl: "https://www.youtube.com/watch?v=cJ21moQpofY", duration: "28:40", isFreePreview: false },
          { title: "Tree DP and Digit DP Techniques", youtubeUrl: "https://www.youtube.com/watch?v=tyB0ztf0DNY", duration: "35:20", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "Algorithms & Complexity Quiz",
        slug: "algorithms-complexity-quiz",
        totalScore: 100,
        timeLimitMinutes: 20,
        questions: [
          { prompt: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: 1, explanation: "Binary search divides the search space in half each iteration, giving O(log n)." },
          { prompt: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Heap", "Linked List"], correctAnswer: 1, explanation: "A Stack operates on Last-In-First-Out (LIFO) order." },
          { prompt: "What does STL stand for in C++?", options: ["Standard Type Library", "Static Template Library", "Standard Template Library", "System Template Layer"], correctAnswer: 2, explanation: "STL stands for Standard Template Library, providing containers and algorithms." },
          { prompt: "Which paradigm avoids recomputing overlapping subproblems?", options: ["Greedy", "Divide and Conquer", "Dynamic Programming", "Backtracking"], correctAnswer: 2, explanation: "Dynamic Programming stores subproblem results to avoid redundant recomputation." },
          { prompt: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: 2, explanation: "Merge sort requires O(n) auxiliary space for merging." },
        ],
      },
    ],
  },
  {
    title: "Data Structures & Algorithms: Complete Roadmap",
    slug: "data-structures-algorithms-complete",
    description: "Master every essential data structure and algorithm pattern needed for top-tier software engineering interviews and competitive programming. Covers arrays, trees, graphs, heaps, and beyond.",
    price: 1500,
    difficulty: "Beginner",
    categorySlug: "dsa",
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: Linear Data Structures",
        lessons: [
          { title: "Arrays, Dynamic Arrays, and Memory Layout", youtubeUrl: "https://www.youtube.com/watch?v=QJNwK2uJyGs", duration: "16:30", isFreePreview: true },
          { title: "Linked Lists: Singly, Doubly, Circular", youtubeUrl: "https://www.youtube.com/watch?v=Hj_rA0dhr2I", duration: "24:15", isFreePreview: true },
          { title: "Stacks and Queues: Applications and Patterns", youtubeUrl: "https://www.youtube.com/watch?v=wjI1WNcIntg", duration: "20:00", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Trees and Graphs",
        lessons: [
          { title: "Binary Trees: Traversal and Properties", youtubeUrl: "https://www.youtube.com/watch?v=H5JubkIy_p8", duration: "27:45", isFreePreview: false },
          { title: "Binary Search Trees and AVL Trees", youtubeUrl: "https://www.youtube.com/watch?v=pYT9F8_LFTM", duration: "31:20", isFreePreview: false },
          { title: "Graph Traversal: BFS and DFS", youtubeUrl: "https://www.youtube.com/watch?v=tWVWeAqZ0WU", duration: "29:10", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "Data Structures Foundations Quiz",
        slug: "data-structures-foundations-quiz",
        totalScore: 100,
        timeLimitMinutes: 25,
        questions: [
          { prompt: "What is the worst-case time complexity for insertion in a linked list at position k?", options: ["O(1)", "O(k)", "O(n)", "O(log n)"], correctAnswer: 2, explanation: "You must traverse to position k which in the worst case is O(n)." },
          { prompt: "Which traversal visits root before children?", options: ["Inorder", "Postorder", "Preorder", "Level-order"], correctAnswer: 2, explanation: "Preorder traversal visits root → left subtree → right subtree." },
          { prompt: "What is the height of a balanced BST with n nodes?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctAnswer: 1, explanation: "A balanced BST maintains height O(log n)." },
          { prompt: "Which algorithm finds the shortest path in an unweighted graph?", options: ["DFS", "BFS", "Dijkstra", "Floyd-Warshall"], correctAnswer: 1, explanation: "BFS guarantees shortest paths in unweighted graphs." },
          { prompt: "What data structure is used in BFS?", options: ["Stack", "Priority Queue", "Queue", "Deque"], correctAnswer: 2, explanation: "BFS uses a Queue to process nodes level by level." },
        ],
      },
    ],
  },
  {
    title: "Full-Stack Web Development with Next.js 16 & Strapi",
    slug: "fullstack-nextjs-strapi",
    description: "Build production-ready full-stack web applications using Next.js 16 App Router, React 19, and Strapi v5 headless CMS. Learn authentication, REST APIs, database design, and Vercel deployment.",
    price: 2000,
    difficulty: "Intermediate",
    categorySlug: "web-development",
    thumbnailUrl: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: Next.js App Router Deep Dive",
        lessons: [
          { title: "Next.js 16 App Router vs Pages Router", youtubeUrl: "https://www.youtube.com/watch?v=_BZoXuZYvVs", duration: "18:35", isFreePreview: true },
          { title: "Server Components vs Client Components", youtubeUrl: "https://www.youtube.com/watch?v=6aP9nyTcd44", duration: "22:50", isFreePreview: true },
          { title: "Route Handlers, Loading UI and Error Boundaries", youtubeUrl: "https://www.youtube.com/watch?v=KMpNGT2-JDo", duration: "19:40", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Strapi v5 API & Auth",
        lessons: [
          { title: "Strapi v5: Content Types and REST API", youtubeUrl: "https://www.youtube.com/watch?v=QfgMeVlxMp8", duration: "26:10", isFreePreview: false },
          { title: "JWT Authentication and Google OAuth", youtubeUrl: "https://www.youtube.com/watch?v=1W_fAq9dpQ4", duration: "28:30", isFreePreview: false },
          { title: "Deploying to Vercel and Railway", youtubeUrl: "https://www.youtube.com/watch?v=mxn9L4LBKOY", duration: "23:00", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "Next.js & Strapi Knowledge Check",
        slug: "nextjs-strapi-quiz",
        totalScore: 100,
        timeLimitMinutes: 20,
        questions: [
          { prompt: "Which rendering strategy is default in Next.js 16 App Router?", options: ["Client Side Rendering", "Server Side Rendering", "Static Site Generation", "Incremental Static Regeneration"], correctAnswer: 1, explanation: "App Router defaults to Server Components (SSR)." },
          { prompt: "What file creates a layout shared across child routes in App Router?", options: ["_app.js", "layout.js", "page.js", "template.js"], correctAnswer: 1, explanation: "layout.js wraps all child route pages in App Router." },
          { prompt: "Which HTTP method is used to create a resource via REST API?", options: ["GET", "PUT", "DELETE", "POST"], correctAnswer: 3, explanation: "POST is used to create new resources in REST." },
          { prompt: "What does JWT stand for?", options: ["Java Web Token", "JSON Web Tool", "JSON Web Token", "Java XML Token"], correctAnswer: 2, explanation: "JWT = JSON Web Token, used for stateless authentication." },
          { prompt: "Strapi v5 uses which document API method to fetch one item?", options: ["findAll()", "findOne()", "getOne()", "findFirst()"], correctAnswer: 1, explanation: "strapi.documents().findOne() retrieves a single document by documentId." },
        ],
      },
    ],
  },
  {
    title: "System Design & Architecture for Engineers",
    slug: "system-design-architecture",
    description: "Learn how to design highly scalable, fault-tolerant distributed systems. Covers load balancing, microservices, caching, database sharding, message queues, and real-world architecture case studies.",
    price: 2500,
    difficulty: "Advanced",
    categorySlug: "system-design",
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: Distributed Systems Fundamentals",
        lessons: [
          { title: "CAP Theorem: Consistency, Availability, Partition Tolerance", youtubeUrl: "https://www.youtube.com/watch?v=BHqjEjzAicA", duration: "20:15", isFreePreview: true },
          { title: "Load Balancers, Reverse Proxies, and CDN", youtubeUrl: "https://www.youtube.com/watch?v=S8LK4LKVEZ4", duration: "24:00", isFreePreview: true },
          { title: "Horizontal vs Vertical Scaling Strategies", youtubeUrl: "https://www.youtube.com/watch?v=xpDnVSmNFX0", duration: "18:40", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Databases and Caching",
        lessons: [
          { title: "SQL vs NoSQL: When to Use Which", youtubeUrl: "https://www.youtube.com/watch?v=W2Z7fbCLSTw", duration: "22:30", isFreePreview: false },
          { title: "Redis Caching, Pub/Sub, and Session Storage", youtubeUrl: "https://www.youtube.com/watch?v=jgpVdJB2sKQ", duration: "27:00", isFreePreview: false },
          { title: "Designing a URL Shortener at Scale", youtubeUrl: "https://www.youtube.com/watch?v=JQDHz72OA3c", duration: "32:15", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "System Design Concepts Quiz",
        slug: "system-design-concepts-quiz",
        totalScore: 100,
        timeLimitMinutes: 25,
        questions: [
          { prompt: "Which consistency model guarantees all nodes see the same data at all times?", options: ["Eventual Consistency", "Strong Consistency", "Causal Consistency", "Read-your-writes"], correctAnswer: 1, explanation: "Strong consistency ensures all reads return the most recent write." },
          { prompt: "What does CDN stand for?", options: ["Content Delivery Network", "Central Data Node", "Cached Data Network", "Content Deployment Node"], correctAnswer: 0, explanation: "CDN = Content Delivery Network, caches assets geographically close to users." },
          { prompt: "Which database is best suited for unstructured, document-based data?", options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"], correctAnswer: 2, explanation: "MongoDB is a NoSQL document database ideal for flexible schemas." },
          { prompt: "What is the primary purpose of a message queue like Kafka?", options: ["In-memory caching", "Decoupling producers and consumers asynchronously", "Synchronous API calls", "Load balancing"], correctAnswer: 1, explanation: "Message queues decouple producers from consumers for async processing." },
          { prompt: "Database sharding refers to?", options: ["Replicating data across nodes", "Partitioning data across multiple database servers", "Encrypting database rows", "Creating backup snapshots"], correctAnswer: 1, explanation: "Sharding distributes data across multiple servers to scale horizontally." },
        ],
      },
    ],
  },
  {
    title: "Graph Theory & Advanced Algorithms",
    slug: "graph-theory-advanced-algorithms",
    description: "Deep dive into graph algorithms including Dijkstra, Bellman-Ford, MST, Topological Sort, and Network Flow. Essential for competitive programmers targeting Div. 1 and ICPC contestants.",
    price: 1800,
    difficulty: "Advanced",
    categorySlug: "competitive-programming",
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: Shortest Path Algorithms",
        lessons: [
          { title: "Dijkstra's Algorithm with Priority Queue", youtubeUrl: "https://www.youtube.com/watch?v=GazC3A4OQTE", duration: "25:30", isFreePreview: true },
          { title: "Bellman-Ford and Detecting Negative Cycles", youtubeUrl: "https://www.youtube.com/watch?v=-mOEd_3gTK0", duration: "22:15", isFreePreview: false },
          { title: "Floyd-Warshall All-Pairs Shortest Path", youtubeUrl: "https://www.youtube.com/watch?v=4OQeCuLYj-4", duration: "20:00", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Minimum Spanning Trees & Flows",
        lessons: [
          { title: "Kruskal's Algorithm and DSU", youtubeUrl: "https://www.youtube.com/watch?v=JZBQLXgSGfs", duration: "28:20", isFreePreview: false },
          { title: "Prim's Algorithm for Dense Graphs", youtubeUrl: "https://www.youtube.com/watch?v=f7JOBJIC-NA", duration: "24:05", isFreePreview: false },
          { title: "Max Flow: Ford-Fulkerson and Edmonds-Karp", youtubeUrl: "https://www.youtube.com/watch?v=MczX0SM3I84", duration: "33:40", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "Graph Algorithms Quiz",
        slug: "graph-algorithms-quiz",
        totalScore: 100,
        timeLimitMinutes: 20,
        questions: [
          { prompt: "Which algorithm fails on graphs with negative edge weights?", options: ["Bellman-Ford", "Floyd-Warshall", "Dijkstra", "BFS"], correctAnswer: 2, explanation: "Dijkstra's greedy approach fails with negative edges." },
          { prompt: "What is the time complexity of Dijkstra with a binary heap?", options: ["O(V²)", "O(E log V)", "O(V log E)", "O(E + V)"], correctAnswer: 1, explanation: "Dijkstra with a min-heap runs in O((V + E) log V) or O(E log V)." },
          { prompt: "Kruskal's algorithm uses which data structure?", options: ["Binary Tree", "Priority Queue", "Disjoint Set Union", "Stack"], correctAnswer: 2, explanation: "Kruskal uses DSU (Union-Find) to detect cycles." },
          { prompt: "Topological sort is applicable to?", options: ["Undirected graphs", "Directed Acyclic Graphs", "Weighted graphs", "Complete graphs"], correctAnswer: 1, explanation: "Topological sort applies only to Directed Acyclic Graphs (DAGs)." },
          { prompt: "Max flow equals min cut according to?", options: ["Dijkstra's theorem", "Ford-Fulkerson theorem", "Max-flow Min-cut theorem", "König's theorem"], correctAnswer: 2, explanation: "The Max-flow Min-cut theorem states max flow equals the minimum cut capacity." },
        ],
      },
    ],
  },
  {
    title: "Software Engineering Best Practices & Clean Code",
    slug: "software-engineering-best-practices",
    description: "Learn industry-grade software engineering principles. Covers SOLID, design patterns, clean code, test-driven development, git workflows, code reviews, and agile engineering practices.",
    price: 1600,
    difficulty: "Intermediate",
    categorySlug: "software-engineering",
    thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: SOLID Principles",
        lessons: [
          { title: "Single Responsibility & Open/Closed Principles", youtubeUrl: "https://www.youtube.com/watch?v=yxf2spbpTSw", duration: "19:00", isFreePreview: true },
          { title: "Liskov Substitution & Dependency Inversion", youtubeUrl: "https://www.youtube.com/watch?v=Ntraj80qN2k", duration: "22:25", isFreePreview: false },
          { title: "Interface Segregation in Practice", youtubeUrl: "https://www.youtube.com/watch?v=UQqY3_6Epbg", duration: "16:50", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Design Patterns",
        lessons: [
          { title: "Creational Patterns: Factory, Singleton, Builder", youtubeUrl: "https://www.youtube.com/watch?v=v9ejT8FO-7I", duration: "28:00", isFreePreview: false },
          { title: "Structural Patterns: Adapter, Decorator, Proxy", youtubeUrl: "https://www.youtube.com/watch?v=NU_1StN5Tkk", duration: "26:30", isFreePreview: false },
          { title: "Behavioral Patterns: Observer, Strategy, Command", youtubeUrl: "https://www.youtube.com/watch?v=v9ejT8FO-7I", duration: "30:15", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "SOLID & Design Patterns Quiz",
        slug: "solid-design-patterns-quiz",
        totalScore: 100,
        timeLimitMinutes: 20,
        questions: [
          { prompt: "Which SOLID principle states a class should have only one reason to change?", options: ["Open/Closed", "Single Responsibility", "Dependency Inversion", "Interface Segregation"], correctAnswer: 1, explanation: "SRP: A class should have a single responsibility and one reason to change." },
          { prompt: "Which design pattern ensures only one instance of a class exists?", options: ["Factory", "Observer", "Singleton", "Adapter"], correctAnswer: 2, explanation: "Singleton restricts instantiation to a single object." },
          { prompt: "The Observer pattern is used for?", options: ["Creating objects", "One-to-many event notification", "Adapting interfaces", "Managing state"], correctAnswer: 1, explanation: "Observer defines a subscription mechanism for one-to-many notifications." },
          { prompt: "What does TDD stand for?", options: ["Type Driven Development", "Test Driven Development", "Template Design Document", "Technical Deployment Draft"], correctAnswer: 1, explanation: "TDD = Test-Driven Development: write tests before writing code." },
          { prompt: "Which git workflow uses feature branches merged via pull requests?", options: ["Gitflow", "Centralized Workflow", "Forking Workflow", "Trunk-Based Development"], correctAnswer: 0, explanation: "Gitflow uses feature branches with pull requests to main/develop branches." },
        ],
      },
    ],
  },
  {
    title: "React 19 & Modern Frontend Engineering",
    slug: "react-19-modern-frontend",
    description: "Build blazing-fast, accessible, and production-ready React 19 applications. Covers hooks, context, state management, performance optimization, testing, and deployment pipelines.",
    price: 1400,
    difficulty: "Beginner",
    categorySlug: "web-development",
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: React Core Concepts",
        lessons: [
          { title: "Components, JSX, and Props Deep Dive", youtubeUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", duration: "20:10", isFreePreview: true },
          { title: "State Management with useState and useReducer", youtubeUrl: "https://www.youtube.com/watch?v=-bEzt5ISACA", duration: "24:35", isFreePreview: true },
          { title: "useEffect, Lifecycle, and Data Fetching", youtubeUrl: "https://www.youtube.com/watch?v=0ZJgIjIuY7U", duration: "21:50", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Advanced React Patterns",
        lessons: [
          { title: "Context API and Global State Architecture", youtubeUrl: "https://www.youtube.com/watch?v=5LrDIWkK_Bc", duration: "27:20", isFreePreview: false },
          { title: "Custom Hooks: Encapsulating Complex Logic", youtubeUrl: "https://www.youtube.com/watch?v=J-g9ZJha8FE", duration: "23:40", isFreePreview: false },
          { title: "React 19 New Features: Actions, use(), and Suspense", youtubeUrl: "https://www.youtube.com/watch?v=EPaLg4U_K1o", duration: "29:00", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "React 19 Core Concepts Quiz",
        slug: "react-19-core-concepts-quiz",
        totalScore: 100,
        timeLimitMinutes: 20,
        questions: [
          { prompt: "Which hook is used to run side effects in React functional components?", options: ["useState", "useCallback", "useEffect", "useRef"], correctAnswer: 2, explanation: "useEffect runs after every render and handles side effects like data fetching." },
          { prompt: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"], correctAnswer: 0, explanation: "JSX = JavaScript XML, a syntax extension allowing HTML-like markup in JS." },
          { prompt: "Which hook avoids unnecessary re-renders of child components?", options: ["useEffect", "useMemo", "useCallback", "useRef"], correctAnswer: 2, explanation: "useCallback memoizes callback functions to prevent child re-renders." },
          { prompt: "How do you lift state up in React?", options: ["Using Redux", "Moving state to a shared parent component", "Using localStorage", "Using useRef"], correctAnswer: 1, explanation: "Lifting state up moves shared state to the lowest common parent." },
          { prompt: "What is the purpose of the key prop in React lists?", options: ["Styling elements", "Helping React identify which items changed", "Triggering re-renders", "Providing accessibility labels"], correctAnswer: 1, explanation: "key helps React track list items during reconciliation for efficient updates." },
        ],
      },
    ],
  },
  {
    title: "ICPC & Olympiad Programming: Contest Strategies",
    slug: "icpc-olympiad-contest-strategies",
    description: "Targeted training for ICPC regional contestants and national Olympiad participants. Covers advanced problem classification, contest meta-strategies, team coordination, and curated problem sets.",
    price: 2200,
    difficulty: "Advanced",
    categorySlug: "competitive-programming",
    thumbnailUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&auto=format&fit=crop",
    modules: [
      {
        title: "Module 1: Contest Strategy & Problem Classification",
        lessons: [
          { title: "Reading and Classifying Problems in 2 Minutes", youtubeUrl: "https://www.youtube.com/watch?v=xAeiXy8-9Y8", duration: "17:30", isFreePreview: true },
          { title: "Time Management in 5-Hour ICPC Contests", youtubeUrl: "https://www.youtube.com/watch?v=6ZcTKkWzgqs", duration: "15:45", isFreePreview: false },
          { title: "Team Roles: Problem Solver, Debugger, Typist", youtubeUrl: "https://www.youtube.com/watch?v=kLDYS7Z9-Zg", duration: "14:00", isFreePreview: false },
        ],
      },
      {
        title: "Module 2: Advanced Techniques for Olympiad",
        lessons: [
          { title: "Segment Trees with Lazy Propagation", youtubeUrl: "https://www.youtube.com/watch?v=ZBHKZF5w4YU", duration: "38:20", isFreePreview: false },
          { title: "Convex Hull Trick and Divide & Conquer DP", youtubeUrl: "https://www.youtube.com/watch?v=orswXA166FA", duration: "34:15", isFreePreview: false },
          { title: "String Algorithms: KMP, Z-Function, Suffix Arrays", youtubeUrl: "https://www.youtube.com/watch?v=GTJr8OvyEVQ", duration: "40:00", isFreePreview: false },
        ],
      },
    ],
    quizzes: [
      {
        title: "ICPC Contest Strategy Quiz",
        slug: "icpc-contest-strategy-quiz",
        totalScore: 100,
        timeLimitMinutes: 20,
        questions: [
          { prompt: "In ICPC, how many members are typically in a team?", options: ["2", "3", "4", "5"], correctAnswer: 1, explanation: "ICPC teams consist of exactly 3 members." },
          { prompt: "What is the time limit penalty per wrong submission in ICPC?", options: ["10 minutes", "20 minutes", "30 minutes", "5 minutes"], correctAnswer: 1, explanation: "Each wrong submission adds 20 minutes to the team's total penalty time." },
          { prompt: "KMP algorithm is used for?", options: ["Graph shortest path", "Pattern string matching", "Sorting arrays", "Matrix multiplication"], correctAnswer: 1, explanation: "KMP (Knuth-Morris-Pratt) efficiently finds pattern occurrences in a string." },
          { prompt: "Segment Tree with lazy propagation supports range updates in?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: 1, explanation: "Lazy propagation enables O(log n) range updates on segment trees." },
          { prompt: "Which technique reduces DP transitions using convex hull?", options: ["Digit DP", "Matrix Exponentiation", "Convex Hull Trick", "Bitmask DP"], correctAnswer: 2, explanation: "Convex Hull Trick optimizes certain DP recurrences from O(n²) to O(n)." },
        ],
      },
    ],
  },
];

/**
 * CPS Academy Default Published Blog Posts
 */
const DEFAULT_BLOGS = [
  {
    title: "How to Reach Candidate Master on Codeforces in 6 Months",
    slug: "how-to-reach-candidate-master-on-codeforces",
    excerpt:
      "A structured roadmap covering dynamic programming, graph theory, and contest strategies from CPS Academy coaches.",
    content: `## The Journey to Candidate Master

Reaching **Candidate Master (1900+ rating)** on Codeforces requires moving beyond basic syntax to mastering advanced problem-solving techniques.

### 1. Master Core Data Structures
- Segment Trees with Lazy Propagation
- Disjoint Set Union (DSU) with Rollbacks
- Trie and Suffix Automaton

### 2. Deepen Dynamic Programming Intuition
- Digit DP and Tree DP
- Bitmask DP with SOS optimizations
- Matrix Exponentiation for recurrence relations

### 3. Practice Strategy
Solve 5 problems above your current rating every week and rigorously upsolve contest problems you couldn't solve during the live round.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
  },
  {
    title: "Building Resilient Microservices with Clean Architecture",
    slug: "building-resilient-microservices-clean-architecture",
    excerpt:
      "Key architectural patterns for designing fault-tolerant, scalable distributed systems.",
    content: `## Scalable Architecture Principles

Designing microservices requires strict boundary enforcement, idempotent APIs, and robust messaging brokers.

### Key Tenets
1. **Domain-Driven Design (DDD)**: Separate bounded contexts cleanly.
2. **Outbox Pattern**: Ensure reliable message delivery to message queues without distributed locks.
3. **Circuit Breakers**: Gracefully handle downstream service degradation.`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
  },
];

/**
 * Essential Permissions by Role Scope
 */
const PUBLIC_ACTIONS = [
  "plugin::users-permissions.auth.callback",
  "plugin::users-permissions.auth.connect",
  "plugin::users-permissions.auth.register",
  "plugin::users-permissions.auth.forgotPassword",
  "plugin::users-permissions.auth.resetPassword",
  "plugin::users-permissions.auth.emailConfirmation",
  "plugin::users-permissions.auth.sendEmailConfirmation",
  "plugin::users-permissions.providers.getProviders",
  "api::course.course.find",
  "api::course.course.findOne",
  "api::category.category.find",
  "api::category.category.findOne",
  "api::module.module.find",
  "api::module.module.findOne",
  "api::lesson.lesson.find",
  "api::lesson.lesson.findOne",
  "api::quiz.quiz.find",
  "api::quiz.quiz.findOne",
  "api::blog-post.blog-post.find",
  "api::blog-post.blog-post.findOne",
  "api::order.order.webhook",
  "api::order.order.getConfig",
];

const STUDENT_ACTIONS = [
  "plugin::users-permissions.user.me",
  "plugin::users-permissions.auth.changePassword",
  "api::course.course.find",
  "api::course.course.findOne",
  "api::category.category.find",
  "api::category.category.findOne",
  "api::module.module.find",
  "api::module.module.findOne",
  "api::lesson.lesson.find",
  "api::lesson.lesson.findOne",
  "api::quiz.quiz.find",
  "api::quiz.quiz.findOne",
  "api::question.question.find",
  "api::question.question.findOne",
  "api::enrollment.enrollment.find",
  "api::enrollment.enrollment.findOne",
  "api::enrollment.enrollment.create",
  "api::progress.progress.find",
  "api::progress.progress.findOne",
  "api::progress.progress.create",
  "api::progress.progress.update",
  "api::quiz-attempt.quiz-attempt.find",
  "api::quiz-attempt.quiz-attempt.findOne",
  "api::quiz-attempt.quiz-attempt.create",
  "api::blog-post.blog-post.find",
  "api::blog-post.blog-post.findOne",
  "api::order.order.find",
  "api::order.order.findOne",
  "api::order.order.createCheckoutSession",
  "api::order.order.verifySession",
  "api::order.order.myOrders",
  "api::order.order.getConfig",
];

const INSTRUCTOR_ACTIONS = [
  "plugin::users-permissions.user.me",
  "plugin::users-permissions.auth.changePassword",
  // Course Management
  "api::course.course.find",
  "api::course.course.findOne",
  "api::course.course.create",
  "api::course.course.update",
  "api::course.course.delete",
  // Module Management
  "api::module.module.find",
  "api::module.module.findOne",
  "api::module.module.create",
  "api::module.module.update",
  "api::module.module.delete",
  // Lesson Management
  "api::lesson.lesson.find",
  "api::lesson.lesson.findOne",
  "api::lesson.lesson.create",
  "api::lesson.lesson.update",
  "api::lesson.lesson.delete",
  // Quiz Management
  "api::quiz.quiz.find",
  "api::quiz.quiz.findOne",
  "api::quiz.quiz.create",
  "api::quiz.quiz.update",
  "api::quiz.quiz.delete",
  // Question Management
  "api::question.question.find",
  "api::question.question.findOne",
  "api::question.question.create",
  "api::question.question.update",
  "api::question.question.delete",
  // Student Progress & Enrollment Insights
  "api::enrollment.enrollment.find",
  "api::enrollment.enrollment.findOne",
  "api::progress.progress.find",
  "api::progress.progress.findOne",
  "api::quiz-attempt.quiz-attempt.find",
  "api::quiz-attempt.quiz-attempt.findOne",
  "api::category.category.find",
  "api::category.category.findOne",
  "api::order.order.find",
  "api::order.order.findOne",
  "api::order.order.myOrders",
];

const CONTENT_MANAGER_ACTIONS = [
  ...INSTRUCTOR_ACTIONS,
  "api::blog-post.blog-post.find",
  "api::blog-post.blog-post.findOne",
  "api::blog-post.blog-post.create",
  "api::blog-post.blog-post.update",
  "api::blog-post.blog-post.delete",
  "api::category.category.create",
  "api::category.category.update",
  "api::category.category.delete",
];

const ADMIN_ACTIONS = [
  ...CONTENT_MANAGER_ACTIONS,
  "plugin::users-permissions.user.find",
  "plugin::users-permissions.user.findOne",
  "plugin::users-permissions.user.create",
  "plugin::users-permissions.user.update",
  "plugin::users-permissions.user.destroy",
  "plugin::users-permissions.role.find",
  "plugin::users-permissions.role.findOne",
  "plugin::users-permissions.role.create",
  "plugin::users-permissions.role.update",
  "plugin::users-permissions.role.deleteRole",
  "api::order.order.find",
  "api::order.order.findOne",
  "api::order.order.create",
  "api::order.order.update",
  "api::order.order.delete",
  "api::order.order.createCheckoutSession",
  "api::order.order.verifySession",
  "api::order.order.myOrders",
  "api::order.order.getConfig",
];

module.exports = {
  register(/*{ strapi }*/) {},
  async bootstrap({ strapi }) {
    try {
      const roleService = strapi.service("plugin::users-permissions.role");
      if (!roleService) return;

      // 1. Seed custom LMS roles
      const existingRoles = await strapi.db
        .query("plugin::users-permissions.role")
        .findMany();
      const existingNames = existingRoles.map((r) =>
        r.name.toLowerCase().trim(),
      );
      const existingTypes = existingRoles.map((r) =>
        (r.type || "").toLowerCase().trim(),
      );

      for (const roleDef of ROLES_TO_SEED) {
        const nameMatch = existingNames.includes(
          roleDef.name.toLowerCase().trim(),
        );
        const typeMatch = existingTypes.includes(
          roleDef.type.toLowerCase().trim(),
        );

        if (!nameMatch && !typeMatch) {
          strapi.log.info(
            `[Bootstrap] Creating CPS Academy role: "${roleDef.name}" (${roleDef.type})`,
          );
          await strapi.db.query("plugin::users-permissions.role").create({
            data: {
              name: roleDef.name,
              type: roleDef.type,
              description: roleDef.description,
            },
          });
        }
      }

      // 2. Seed Default Course Categories if none exist
      const existingCategories = await strapi.db
        .query("api::category.category")
        .findMany();
      if (existingCategories.length === 0) {
        strapi.log.info("[Bootstrap] Seeding default course categories...");
        for (const cat of DEFAULT_CATEGORIES) {
          await strapi.documents("api::category.category").create({
            data: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
            },
          });
        }
      }

      // 2.5 Backfill legacy blog posts missing the explicit "status" field
      const legacyBlogs = await strapi.db
        .query("api::blog-post.blog-post")
        .findMany();
      for (const legacyBlog of legacyBlogs) {
        if (!legacyBlog.status) {
          const inferredStatus = legacyBlog.publishedAt ? "published" : "draft";
          await strapi.db.query("api::blog-post.blog-post").update({
            where: { id: legacyBlog.id },
            data: {
              status: inferredStatus,
              publishedDate:
                inferredStatus === "published"
                  ? legacyBlog.publishedAt || new Date()
                  : null,
            },
          });
        }
      }

      // 2.6 Backfill legacy quizzes missing the "totalScore" field (renamed from passingScore)
      const legacyQuizzes = await strapi.db.query("api::quiz.quiz").findMany();
      for (const legacyQuiz of legacyQuizzes) {
        if (!legacyQuiz.totalScore) {
          await strapi.db.query("api::quiz.quiz").update({
            where: { id: legacyQuiz.id },
            data: { totalScore: 100 },
          });
        }
      }

      // 3. Seed Default Sample Blog Posts if none exist
      const existingBlogs = await strapi.db
        .query("api::blog-post.blog-post")
        .findMany();
      if (existingBlogs.length === 0) {
        strapi.log.info("[Bootstrap] Seeding sample published blog posts...");
        const cpCat = await strapi.db.query("api::category.category").findOne({
          where: { slug: "competitive-programming" },
        });
        for (const blog of DEFAULT_BLOGS) {
          await strapi.documents("api::blog-post.blog-post").create({
            data: {
              title: blog.title,
              slug: blog.slug,
              excerpt: blog.excerpt,
              content: blog.content,
              coverImageUrl: blog.coverImageUrl,
              category: cpCat ? cpCat.id : undefined,
              status: "published",
              publishedDate: new Date(),
            },
          });
        }
      }

      // 4. Fetch updated roles list
      const allRoles = await strapi.db
        .query("plugin::users-permissions.role")
        .findMany();
      const studentRole = allRoles.find(
        (r) => r.type === "student" || r.name.toLowerCase() === "student",
      );

      const pluginStore = strapi.store({
        type: "plugin",
        name: "users-permissions",
      });

      // 5. Configure Advanced Registration & Default Role settings
      const advancedSettings =
        (await pluginStore.get({ key: "advanced" })) || {};
      const targetType = studentRole?.type || "student";

      if (
        advancedSettings.default_role !== targetType ||
        !advancedSettings.allow_register
      ) {
        advancedSettings.default_role = targetType;
        advancedSettings.allow_register = true;
        advancedSettings.email_confirmation = false;
        await pluginStore.set({ key: "advanced", value: advancedSettings });
        strapi.log.info(
          `[Bootstrap] Set default_role to: "${targetType}", registration enabled.`,
        );
      }

      // 5.1 Seed Quick Login Demo Accounts if missing
      const DEMO_ACCOUNTS = [
        {
          username: "admin_demo",
          email: "admin@gmail.com",
          password: "abc12345",
          roleType: "admin",
        },
        {
          username: "manager_demo",
          email: "contentmanager@gmail.com",
          password: "abc12345",
          roleType: "content_manager",
        },
        {
          username: "instructor_demo",
          email: "instractor@gmail.com",
          password: "abc12345",
          roleType: "instructor",
        },
        {
          username: "student_demo",
          email: "student@gmail.com",
          password: "abc12345",
          roleType: "student",
        },
      ];

      for (const demo of DEMO_ACCOUNTS) {
        const existing = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({
            where: { email: demo.email.toLowerCase() },
            populate: ["role"],
          });

        const targetRole = allRoles.find(
          (r) =>
            (r.type || "").toLowerCase() === demo.roleType ||
            (r.name || "").toLowerCase().replace(/\s+/g, "_") === demo.roleType,
        );

        if (!existing && targetRole) {
          try {
            await strapi.plugin("users-permissions").service("user").add({
              username: demo.username,
              email: demo.email.toLowerCase(),
              password: demo.password,
              confirmed: true,
              blocked: false,
              role: targetRole.id,
            });
            strapi.log.info(
              `[Bootstrap] Created demo user: ${demo.email} (${demo.roleType})`,
            );
          } catch (e) {
            strapi.log.warn(
              `[Bootstrap] Could not create demo user ${demo.email}:`,
              e.message,
            );
          }
        }
      }

      // 5.2 Seed Default Courses, Lessons & Quizzes (fully idempotent per-slug checks)
      strapi.log.info("[Bootstrap] Verifying default course/lesson/quiz seed...");

      // Resolve the instructor user (created in step 5.1 above)
      const instructorUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { email: "instractor@gmail.com" } });

      for (const courseDef of DEFAULT_COURSES) {
        try {
          // --- Course: find or create ---
          let courseRow = await strapi.db
            .query("api::course.course")
            .findOne({ where: { slug: courseDef.slug } });

          if (!courseRow) {
            const cat = await strapi.db
              .query("api::category.category")
              .findOne({ where: { slug: courseDef.categorySlug } });

            const created = await strapi.documents("api::course.course").create({
              data: {
                title: courseDef.title,
                slug: courseDef.slug,
                description: courseDef.description,
                price: courseDef.price,
                difficulty: courseDef.difficulty,
                thumbnailUrl: courseDef.thumbnailUrl,
                category: cat ? cat.id : undefined,
                instructor: instructorUser ? instructorUser.id : undefined,
              },
              status: "published",
            });

            // Re-fetch to get the numeric DB id for relations
            courseRow = await strapi.db
              .query("api::course.course")
              .findOne({ where: { slug: courseDef.slug } });

            strapi.log.info(`[Bootstrap] Seeded course: "${courseDef.title}"`);
          }

          // --- Modules + Lessons: create Module, then attach Lessons to Module ---
          // The course API populates modules.lessons, NOT direct course.lessons.
          // Lessons must be linked to a Module for them to appear.
          let moduleOrder = 1;
          for (const mod of courseDef.modules) {
            try {
              // Find or create the module (check by title + course)
              let moduleRow = await strapi.db
                .query("api::module.module")
                .findOne({ where: { title: mod.title, course: { id: courseRow.id } } });

              if (!moduleRow) {
                moduleRow = await strapi.db.query("api::module.module").create({
                  data: {
                    title: mod.title,
                    order: moduleOrder,
                    course: courseRow.id,
                  },
                });
                strapi.log.info(`[Bootstrap]   + Module: "${mod.title}"`);
              }
              moduleOrder++;

              // Fetch existing lessons already in this module
              const existingModLessons = await strapi.db
                .query("api::lesson.lesson")
                .findMany({ where: { module: { id: moduleRow.id } } });
              const existingModLessonTitles = new Set(existingModLessons.map((l) => l.title));

              let lessonOrder = existingModLessons.length + 1;
              for (const lessonDef of mod.lessons) {
                if (existingModLessonTitles.has(lessonDef.title)) continue;
                try {
                  // strapi.db.query does not auto-generate UID fields — build slug manually
                  const rawSlug = lessonDef.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "")
                    .trim()
                    .replace(/\s+/g, "-")
                    .substring(0, 55);
                  const uniqueSlug = `${rawSlug}-${moduleRow.id}-${lessonOrder}`;

                  await strapi.db.query("api::lesson.lesson").create({
                    data: {
                      title: lessonDef.title,
                      slug: uniqueSlug,
                      youtubeUrl: lessonDef.youtubeUrl,
                      duration: lessonDef.duration,
                      isFreePreview: lessonDef.isFreePreview,
                      order: lessonOrder++,
                      module: moduleRow.id,
                      course: courseRow.id,
                    },
                  });
                  strapi.log.info(`[Bootstrap]     + Lesson: "${lessonDef.title}"`);
                } catch (lessonErr) {
                  strapi.log.warn(`[Bootstrap]       Lesson failed: "${lessonDef.title}": ${lessonErr.message}`);
                }
              }
            } catch (modErr) {
              strapi.log.warn(`[Bootstrap]   Module failed: "${mod.title}": ${modErr.message}`);
            }
          }

          // --- Quizzes & Questions: check per slug, create if missing ---
          for (const quizDef of courseDef.quizzes) {
            const existingQuiz = await strapi.db
              .query("api::quiz.quiz")
              .findOne({ where: { slug: quizDef.slug } });
            if (existingQuiz) continue;

            // Create the quiz row first
            const newQuiz = await strapi.db.query("api::quiz.quiz").create({
              data: {
                title: quizDef.title,
                slug: quizDef.slug,
                totalScore: quizDef.totalScore,
                timeLimitMinutes: quizDef.timeLimitMinutes,
                course: courseRow.id,
              },
            });

            // Create each Question linked to the quiz
            for (const q of quizDef.questions) {
              await strapi.db.query("api::question.question").create({
                data: {
                  prompt: q.prompt,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation,
                  quiz: newQuiz.id,
                },
              });
            }
            strapi.log.info(`[Bootstrap]   + Quiz: "${quizDef.title}" (${quizDef.questions.length} questions)`);
          }
        } catch (courseErr) {
          strapi.log.warn(
            `[Bootstrap] Could not seed "${courseDef.title}":`,
            courseErr.message,
          );

        }
      }

      strapi.log.info("[Bootstrap] Course/Lesson/Quiz seed verification complete.");


      // 6. Configure & Enable Providers strictly via environment variables
      const grantConfig = (await pluginStore.get({ key: "grant" })) || {};
      const serverUrl =
        process.env.PUBLIC_URL ||
        `http://${process.env.HOST === "0.0.0.0" ? "localhost" : process.env.HOST || "localhost"}:${process.env.PORT || 1337}`;

      const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

      let grantModified = false;
      if (googleClientId && googleClientSecret) {
        if (
          !grantConfig.google?.enabled ||
          grantConfig.google.key !== googleClientId ||
          grantConfig.google.secret !== googleClientSecret
        ) {
          grantConfig.google = {
            enabled: true,
            icon: "google",
            key: googleClientId,
            secret: googleClientSecret,
            callback: `${serverUrl}/api/auth/google/callback`,
            scope: ["email", "profile"],
          };
          grantModified = true;
        }
      }

      if (!grantConfig.email?.enabled) {
        grantConfig.email = {
          enabled: true,
          icon: "envelope",
        };
        grantModified = true;
      }

      if (grantModified) {
        await pluginStore.set({ key: "grant", value: grantConfig });
        strapi.log.info(
          "[Bootstrap] Users-Permissions providers updated from environment.",
        );
      }

      // 7. Fast In-Memory Bulk Permission Verification
      const existingPermissions = await strapi.db
        .query("plugin::users-permissions.permission")
        .findMany({ populate: ["role"] });

      const existingPermKeys = new Set(
        existingPermissions.map((p) => `${p.action}::${p.role?.id || p.role}`),
      );

      const permissionsToCreate = [];

      for (const role of allRoles) {
        const normalizedType = (role.type || "").toLowerCase();
        const normalizedName = (role.name || "").toLowerCase();

        let actionsToGrant = STUDENT_ACTIONS;
        if (normalizedType === "public" || normalizedName === "public") {
          actionsToGrant = PUBLIC_ACTIONS;
        } else if (normalizedType === "admin" || normalizedName === "admin") {
          actionsToGrant = ADMIN_ACTIONS;
        } else if (
          normalizedType === "content_manager" ||
          normalizedName === "content manager"
        ) {
          actionsToGrant = CONTENT_MANAGER_ACTIONS;
        } else if (
          normalizedType === "instructor" ||
          normalizedName === "instructor"
        ) {
          actionsToGrant = INSTRUCTOR_ACTIONS;
        } else if (
          normalizedType === "student" ||
          normalizedName === "student"
        ) {
          actionsToGrant = STUDENT_ACTIONS;
        } else if (
          normalizedType === "authenticated" ||
          normalizedName === "authenticated"
        ) {
          actionsToGrant = STUDENT_ACTIONS;
        }

        for (const action of actionsToGrant) {
          const key = `${action}::${role.id}`;
          if (!existingPermKeys.has(key)) {
            permissionsToCreate.push({ action, role: role.id });
          }
        }
      }

      if (permissionsToCreate.length > 0) {
        strapi.log.info(
          `[Bootstrap] Seeding ${permissionsToCreate.length} missing permissions...`,
        );
        for (const perm of permissionsToCreate) {
          await strapi.db.query("plugin::users-permissions.permission").create({
            data: perm,
          });
        }
      }

      strapi.log.info("[Bootstrap] Essential Users & Permissions verified.");
    } catch (error) {
      strapi.log.error(
        "[Bootstrap] Failed to bootstrap roles & permissions:",
        error,
      );
    }
  },
};
