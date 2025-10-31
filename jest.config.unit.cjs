/**
 * Jest configuration for unit tests
 * Separate from Stagehand E2E configuration
 */

module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/unit/**/*.test.(ts|tsx|js|jsx)'],
  testTimeout: 10000, // 10 seconds for unit tests
  verbose: true,

  // Transform settings for TypeScript and JSX
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],

  // Module settings
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage settings
  collectCoverage: false,
  coverageDirectory: './coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/stagehand/',
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Reporter settings
  reporters: ['default'],
};