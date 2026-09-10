// config/config.js throws at import time on missing env, so every value it
// asserts has to exist before any module under test is loaded. These are
// throwaway test values — the real MONGO_URI is never used because setup.js
// swaps the connection for an in-memory server.
export default {
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    // Each file gets its own process, so one suite's mongoose state, socket
    // server or module mocks can't leak into another's.
    pool: "forks",
    testTimeout: 30000,
    hookTimeout: 60000,
    env: {
      NODE_ENV: "test",
      PORT: "4001",
      MONGO_URI: "mongodb://127.0.0.1:27017/aidedesk-test-placeholder",
      JWT_SECRET: "test-jwt-secret-not-used-in-production",
      GOOGLE_USER_EMAIL: "test@example.com",
      FRONTEND_URL: "http://localhost:5173",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/controllers/**",
        "src/middleware/**",
        "src/sockets/**",
        "src/services/**",
        "src/utils/**",
      ],
    },
  },
};
