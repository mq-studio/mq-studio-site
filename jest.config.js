/**
 * Jest configuration for all tests
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js|jsx)', '**/tests/unit/**/*.test.(ts|tsx|js|jsx)'],
  testTimeout: 10000,
  verbose: true,

  // Transform settings for TypeScript and JSX
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],

  // Module settings
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },

  // Coverage settings
  collectCoverage: false,
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Reporter settings
  reporters: ['default'],
};
