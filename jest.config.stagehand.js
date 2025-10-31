/**
 * Jest configuration for Stagehand E2E tests
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/stagehand/**/*.test.js'],
  testTimeout: 60000, // 60 seconds for E2E tests
  verbose: true,
  
  // Setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Coverage settings (optional)
  collectCoverage: false,
  
  // Transform settings
  transform: {},
  
  // Module settings
  moduleFileExtensions: ['js', 'json', 'node'],
  
  // Reporter settings
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'stagehand-results.xml',
    }]
  ],
};