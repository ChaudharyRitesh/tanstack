export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL || "https://jsonplaceholder.typicode.com",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 1,
  CACHE_TIME: {
    LONG: 1000 * 60 * 10, // 10 minutes
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    SHORT: 1000 * 60, // 1 minute
  },
};

export const ROUTES = {
  TODOS: "/todos",
  USERS: "/users",
};
