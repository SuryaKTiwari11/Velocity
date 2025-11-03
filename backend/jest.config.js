export default {
  // Module file extensions
  moduleFileExtensions: ["js", "json"],

  // Test environment
  testEnvironment: "node",

  // Transform configuration - empty to use native ES modules
  transform: {},

  // Test file patterns
  testMatch: [
    "**/test/**/*.test.js",
    "**/tests/**/*.test.js",
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js",
  ],

  // Module name mapper for path resolution
  moduleNameMapper: {},

  // Enable experimental VM modules support
  runner: "jest-runner",
};
