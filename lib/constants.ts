import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const SUGGESTIONS_DISPLAY_COUNT = 4;

export const SUGGESTION_POOL = [
  "How do I debug a memory leak in Node.js?",
  "Explain the difference between REST and GraphQL APIs",
  "Write a TypeScript function to debounce user input",
  "What are best practices for React Server Components?",
  "How do I set up CI/CD for a Next.js app?",
  "What's the difference between SQL and NoSQL databases?",
  "Help me write a regex to validate email addresses",
  "How do I optimize Core Web Vitals for my website?",
  "Explain Docker containers vs virtual machines",
  "How do I handle authentication with JWT?",
  "What is the difference between unit and integration tests?",
  "How do I fix CORS errors in my API?",
  "Best practices for error handling in async JavaScript",
  "How do I structure a monorepo with Turborepo?",
  "Explain event-driven architecture patterns",
  "How do I profile and fix slow database queries?",
];
